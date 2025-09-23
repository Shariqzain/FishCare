import express from 'express';
import Scan from '../models/Scan.js';
import User from '../models/User.js';

const router = express.Router();

// Add a scan to user's history
router.post('/add', async (req, res) => {
  const { userId, imageUrl, result } = req.body;
  try {
    const scan = new Scan({ user: userId, imageUrl, result });
    await scan.save();
    await User.findByIdAndUpdate(userId, { $push: { scans: { imageUrl, result } } });
    res.status(201).json({ message: 'Scan saved' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's scan history
router.get('/history/:userId', async (req, res) => {
  try {
    const scans = await Scan.find({ user: req.params.userId }).sort({ scannedAt: -1 });
    res.status(200).json(scans);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
