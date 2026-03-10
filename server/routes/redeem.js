const express = require('express');
const bcrypt = require('bcryptjs');
const https = require('https');
const Key = require('../models/Key');
const User = require('../models/User');
const Log = require('../models/Log');
const InviteLink = require('../models/InviteLink');
const router = express.Router();

function sendDiscordNotification(keyCode, email) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl || webhookUrl === 'your-discord-webhook-url-here') return;

  const payload = JSON.stringify({
    embeds: [{
      title: 'New Key Redeemed',
      color: 0x1DB954,
      fields: [
        { name: 'Key', value: `\`${keyCode}\``, inline: true },
        { name: 'Email', value: email, inline: true },
        { name: 'Time', value: new Date().toLocaleString(), inline: false },
      ],
      footer: { text: 'SpotifyHub Key Management' },
    }],
  });

  const url = new URL(webhookUrl);
  const req = https.request({
    hostname: url.hostname,
    path: url.pathname,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  req.on('error', (err) => console.error('Discord webhook error:', err.message));
  req.write(payload);
  req.end();
}

// POST /api/redeem
router.post('/', async (req, res) => {
  try {
    const { keyCode, email, password } = req.body;

    if (!keyCode || !email) {
      return res.status(400).json({ message: 'Key and email are required' });
    }

    // Find the key
    const key = await Key.findOne({ keyCode: keyCode.trim() });
    if (!key) {
      return res.status(404).json({ message: 'Invalid key' });
    }

    // Check if key is already active (and not reusable)
    if (key.status === 'ACTIVE') {
      return res.status(400).json({ message: 'This key is already in use' });
    }

    // Check if key is available (UNUSED or REUSABLE)
    if (key.status !== 'UNUSED' && key.status !== 'REUSABLE') {
      return res.status(400).json({ message: 'This key is not available' });
    }

    // Check expiry
    if (key.expiresAt && new Date() > key.expiresAt) {
      return res.status(400).json({ message: 'This key has expired' });
    }

    // Check cooldown (1 hour between redemptions per email)
    const user = await User.findOne({ email: email.toLowerCase() });
    if (user && user.lastRedeemTime) {
      const cooldown = 60 * 60 * 1000; // 1 hour
      const timeSinceLastRedeem = Date.now() - user.lastRedeemTime.getTime();
      if (timeSinceLastRedeem < cooldown) {
        const remaining = Math.ceil((cooldown - timeSinceLastRedeem) / 60000);
        return res.status(429).json({
          message: `Please wait ${remaining} minutes before redeeming again`,
        });
      }
    }

    // Create or update user
    if (user) {
      user.lastRedeemTime = new Date();
      await user.save();
    } else {
      const hashedPassword = password ? await bcrypt.hash(password, 10) : await bcrypt.hash('default', 10);
      await User.create({
        email: email.toLowerCase(),
        password: hashedPassword,
        lastRedeemTime: new Date(),
      });
    }

    // Redeem the key
    key.status = 'ACTIVE';
    key.boundEmail = email.toLowerCase();
    key.redeemedAt = new Date();
    await key.save();

    await Log.create({
      action: 'KEY_REDEEMED',
      keyCode: key.keyCode,
      email: email.toLowerCase(),
    });

    // Assign an invite link from the pool
    let inviteLink = null;
    const available = await InviteLink.findOne({ assigned: false });
    if (available) {
      available.assigned = true;
      available.assignedTo = email.toLowerCase();
      available.keyCode = key.keyCode;
      await available.save();
      inviteLink = available.link;
    }

    // Notify Discord
    sendDiscordNotification(key.keyCode, email.toLowerCase());

    res.json({
      message: 'Key redeemed successfully!',
      inviteLink,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
