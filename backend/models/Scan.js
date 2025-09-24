import mongoose from 'mongoose';

const resultSchema = new mongoose.Schema({
  label: { type: String, required: true },
  confidence: { type: Number, required: true }
}, { _id: false });

const scanSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  imageUrl: { type: String, required: true },
  result: { type: resultSchema, required: true },
  scannedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Scan', scanSchema);
