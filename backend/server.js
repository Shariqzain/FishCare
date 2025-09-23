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

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected');
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch((err) => console.error('MongoDB connection error:', err));
