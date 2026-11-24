import { randomUUID } from 'node:crypto';
import mongoose from 'mongoose';

const budgetDocumentSchema = new mongoose.Schema({
  id: { type: String, default: randomUUID, unique: true },
  userId: { type: String, required: true },
  currency: { type: String, required: true },
  monthlyLimit: { type: Number, required: true },
  month: { type: String, required: true },
  year: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
}, {
  id: false,
  versionKey: false,
  toJSON: { transform: (_doc, result) => { delete result._id; return result; } },
});

export default mongoose.model('Budget', budgetDocumentSchema);
