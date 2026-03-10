const express = require('express');
const crypto = require('crypto');
const Key = require('../models/Key');
const Log = require('../models/Log');
const InviteLink = require('../models/InviteLink');
const auth = require('../middleware/auth');
const router = express.Router();

function generateKeyCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const segment = () => Array.from({ length: 4 }, () => chars[crypto.randomInt(chars.length)]).join('');
  return `SpotifyHub-${segment()}-${segment()}`;
}

// POST /api/keys/generate
router.post('/generate', auth, async (req, res) => {
  try {
    const { quantity, reusable, expiresAt } = req.body;
    const count = Math.min(Math.max(parseInt(quantity) || 1, 1), 1000);

    const keys = [];
    for (let i = 0; i < count; i++) {
      let keyCode;
      let exists = true;
      while (exists) {
        keyCode = generateKeyCode();
        exists = await Key.findOne({ keyCode });
      }

      keys.push({
        keyCode,
        reusable: !!reusable,
        expiresAt: expiresAt || null,
      });
    }

    const created = await Key.insertMany(keys);

    await Log.create({
      action: 'KEYS_GENERATED',
      details: `${count} keys generated`,
    });

    res.json({ message: `${count} keys generated`, keys: created });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/keys
router.get('/', auth, async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status && status !== 'ALL') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { keyCode: { $regex: search, $options: 'i' } },
        { boundEmail: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Key.countDocuments(query);
    const keys = await Key.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    // Attach invite links to keys
    const keyCodes = keys.map(k => k.keyCode);
    const links = await InviteLink.find({ keyCode: { $in: keyCodes } }).lean();
    const linkMap = {};
    links.forEach(l => { linkMap[l.keyCode] = l.link; });
    keys.forEach(k => { k.inviteLink = linkMap[k.keyCode] || null; });

    res.json({
      keys,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/keys/export
router.get('/export', auth, async (req, res) => {
  try {
    const keys = await Key.find().sort({ createdAt: -1 });

    const header = 'Key,Status,Reusable,Bound Email,Created At,Redeemed At\n';
    const rows = keys.map(k =>
      `${k.keyCode},${k.status},${k.reusable},${k.boundEmail || ''},${k.createdAt.toISOString()},${k.redeemedAt ? k.redeemedAt.toISOString() : ''}`
    ).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=keys-export.csv');
    res.send(header + rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/keys/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const key = await Key.findByIdAndDelete(req.params.id);
    if (!key) return res.status(404).json({ message: 'Key not found' });

    await Log.create({
      action: 'KEY_DELETED',
      keyCode: key.keyCode,
    });

    res.json({ message: 'Key deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/keys/:id/unbind
router.put('/:id/unbind', auth, async (req, res) => {
  try {
    const key = await Key.findById(req.params.id);
    if (!key) return res.status(404).json({ message: 'Key not found' });

    const oldEmail = key.boundEmail;
    key.status = key.reusable ? 'REUSABLE' : 'UNUSED';
    key.boundEmail = null;
    key.redeemedAt = null;
    await key.save();

    await Log.create({
      action: 'KEY_UNBOUND',
      keyCode: key.keyCode,
      email: oldEmail,
    });

    res.json({ message: 'Key unbound', key });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
