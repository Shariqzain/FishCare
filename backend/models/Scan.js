import mongoose from 'mongoose';

const scanSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  imageUrl: String,
  result: String,
  scannedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Scan', scanSchema);
