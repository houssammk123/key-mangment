const express = require('express');
const Key = require('../models/Key');
const Log = require('../models/Log');
const InviteLink = require('../models/InviteLink');
const auth = require('../middleware/auth');
const router = express.Router();

// GET /api/stock
router.get('/', auth, async (req, res) => {
  try {
    const total = await Key.countDocuments();
    const unused = await Key.countDocuments({ status: 'UNUSED' });
    const active = await Key.countDocuments({ status: 'ACTIVE' });
    const reusable = await Key.countDocuments({ status: 'REUSABLE' });
    const available = unused + reusable;

    const totalLinks = await InviteLink.countDocuments();
    const availableLinks = await InviteLink.countDocuments({ assigned: false });
    const assignedLinks = await InviteLink.countDocuments({ assigned: true });

    const recentStock = await Log.find({ action: 'KEYS_GENERATED' })
      .sort({ timestamp: -1 })
      .limit(10);

    res.json({
      total,
      unused,
      active,
      reusable,
      available,
      usagePercent: total > 0 ? Math.round((active / total) * 100) : 0,
      totalLinks,
      availableLinks,
      assignedLinks,
      recentStock,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/stock/invite-links - Add invite links in bulk
router.post('/invite-links', auth, async (req, res) => {
  try {
    const { links } = req.body;

    if (!links || !links.length) {
      return res.status(400).json({ message: 'No links provided' });
    }

    // Split by newline if it's a string, otherwise use array
    const linkArray = typeof links === 'string'
      ? links.split('\n').map(l => l.trim()).filter(l => l.length > 0)
      : links;

    const docs = linkArray.map(link => ({ link }));
    const created = await InviteLink.insertMany(docs);

    await Log.create({
      action: 'INVITE_LINKS_ADDED',
      details: `${created.length} invite links added`,
    });

    res.json({ message: `${created.length} invite links added`, count: created.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/stock/invite-links - List all invite links
router.get('/invite-links', auth, async (req, res) => {
  try {
    const links = await InviteLink.find().sort({ createdAt: -1 });
    res.json(links);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/stock/invite-links/:id
router.delete('/invite-links/:id', auth, async (req, res) => {
  try {
    await InviteLink.findByIdAndDelete(req.params.id);
    res.json({ message: 'Invite link deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
