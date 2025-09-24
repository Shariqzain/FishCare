import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import userRoutes from './routes/user.js';
import scanRoutes from './routes/scan.js';
import { MONGO_URI, PORT } from './config.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/scans', scanRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ message: 'Server error', error: err.message });
});

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
    console.log('MongoDB URI:', MONGO_URI);
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running and accessible at http://172.17.22.86:${PORT}`);
      console.log(`Make sure your mobile device can reach this address`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    console.error('MongoDB URI:', MONGO_URI);
    process.exit(1);
  });
