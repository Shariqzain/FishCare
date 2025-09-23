import mongoose from 'mongoose';

const scanSchema = new mongoose.Schema({
  imageUrl: String,
  result: String,
  scannedAt: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  scans: [scanSchema]
});

export default mongoose.model('User', userSchema);
