const express = require('express');
const Key = require('../models/Key');
const Log = require('../models/Log');
const UnbindRequest = require('../models/UnbindRequest');
const auth = require('../middleware/auth');
const router = express.Router();

// GET /api/unbind-requests
router.get('/', auth, async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};
    const requests = await UnbindRequest.find(query).sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/unbind-requests (public - user submits)
router.post('/', async (req, res) => {
  try {
    const { keyCode, email, reason } = req.body;

    if (!keyCode || !email) {
      return res.status(400).json({ message: 'Key and email are required' });
    }

    const key = await Key.findOne({ keyCode: keyCode.trim(), boundEmail: email.toLowerCase() });
    if (!key) {
      return res.status(404).json({ message: 'No active key found for this email' });
    }

    if (key.status !== 'ACTIVE') {
      return res.status(400).json({ message: 'This key is not currently active' });
    }

    // Check for existing pending request
    const existing = await UnbindRequest.findOne({
      keyCode: keyCode.trim(),
      status: 'PENDING',
    });
    if (existing) {
      return res.status(400).json({ message: 'An unbind request is already pending for this key' });
    }

    const request = await UnbindRequest.create({
      keyCode: keyCode.trim(),
      email: email.toLowerCase(),
      reason: reason || '',
    });

    await Log.create({
      action: 'UNBIND_REQUESTED',
      keyCode: keyCode.trim(),
      email: email.toLowerCase(),
    });

    res.json({ message: 'Unbind request submitted', request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/unbind-requests/:id/approve
router.put('/:id/approve', auth, async (req, res) => {
  try {
    const request = await UnbindRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    const key = await Key.findOne({ keyCode: request.keyCode });
    if (!key) return res.status(404).json({ message: 'Key not found' });

    // Unbind the key
    key.status = key.reusable ? 'REUSABLE' : 'UNUSED';
    key.boundEmail = null;
    key.redeemedAt = null;
    await key.save();

    request.status = 'APPROVED';
    await request.save();

    await Log.create({
      action: 'UNBIND_APPROVED',
      keyCode: request.keyCode,
      email: request.email,
    });

    res.json({ message: 'Unbind request approved', request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/unbind-requests/:id/reject
router.put('/:id/reject', auth, async (req, res) => {
  try {
    const request = await UnbindRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    request.status = 'REJECTED';
    await request.save();

    await Log.create({
      action: 'UNBIND_REJECTED',
      keyCode: request.keyCode,
      email: request.email,
    });

    res.json({ message: 'Unbind request rejected', request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
