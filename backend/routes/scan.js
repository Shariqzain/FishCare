import express from 'express';
import Scan from '../models/Scan.js';
import User from '../models/User.js';

const router = express.Router();

// Add a scan to user's history
router.post('/add', async (req, res) => {
  console.log('Received scan data:', req.body);
  const { userId, imageUrl, result } = req.body;
  
  try {
    if (!userId) {
      console.error('No userId provided');
      return res.status(400).json({ message: 'User ID is required' });
    }

    if (!result || typeof result !== 'object') {
      console.error('Result must be an object:', result);
      return res.status(400).json({ message: 'Result must be an object' });
    }

    if (typeof result.label !== 'string' || result.label.trim() === '') {
      console.error('Invalid or missing label:', result.label);
      return res.status(400).json({ message: 'Valid label is required' });
    }

    if (typeof result.confidence !== 'number' || isNaN(result.confidence)) {
      console.error('Invalid or missing confidence:', result.confidence);
      return res.status(400).json({ message: 'Valid confidence value is required' });
    }

    console.log('Creating new scan with data:', {
      userId,
      imageUrl,
      result: {
        label: result.label,
        confidence: result.confidence
      }
    });

    const scan = new Scan({
      user: userId,
      imageUrl,
      result: {
        label: result.label,
        confidence: result.confidence
      }
    });
    
    await scan.save();
    console.log('Scan saved:', scan);
    
    // Format the scan data for the user's scans array
    const scanData = {
      imageUrl: imageUrl,
      result: {
        label: result.label,
        confidence: result.confidence
      }
    };

    await User.findByIdAndUpdate(
      userId,
      { $push: { scans: scanData } },
      { new: true, runValidators: true }
    );
    console.log('User updated with scan');
    
    res.status(201).json({ 
      success: true,
      message: 'Scan saved successfully',
      scan: scan
    });
  } catch (err) {
    console.error('Error saving scan:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get user's scan history
router.get('/history/:userId', async (req, res) => {
  try {
    console.log('Fetching scan history for userId:', req.params.userId);
    
    if (!req.params.userId) {
      console.error('No userId provided');
      return res.status(400).json({ message: 'User ID is required' });
    }

    const scans = await Scan.find({ user: req.params.userId }).sort({ scannedAt: -1 });
    console.log('Found scans:', scans);
    
    res.status(200).json(scans);
  } catch (err) {
    console.error('Error fetching scan history:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

export default router;
