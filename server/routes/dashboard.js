const express = require('express');
const Key = require('../models/Key');
const Log = require('../models/Log');
const auth = require('../middleware/auth');
const router = express.Router();

// GET /api/dashboard/stats
router.get('/stats', auth, async (req, res) => {
  try {
    const totalKeys = await Key.countDocuments();
    const activeKeys = await Key.countDocuments({ status: 'ACTIVE' });
    const unusedKeys = await Key.countDocuments({ status: 'UNUSED' });
    const reusableKeys = await Key.countDocuments({ status: 'REUSABLE' });
    const stockAvailable = unusedKeys + reusableKeys;

    res.json({ totalKeys, activeKeys, stockAvailable, unusedKeys, reusableKeys });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/dashboard/activity
router.get('/activity', auth, async (req, res) => {
  try {
    const logs = await Log.find()
      .sort({ timestamp: -1 })
      .limit(20);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
