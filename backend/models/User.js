import mongoose from 'mongoose';

const resultSchema = new mongoose.Schema({
  label: { type: String, required: true },
  confidence: { type: Number, required: true }
}, { _id: false });

const scanSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
  result: { type: resultSchema, required: true },
  scannedAt: { type: Date, default: Date.now }
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  scans: [scanSchema]
});

export default mongoose.model('User', userSchema);
