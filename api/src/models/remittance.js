import { randomUUID } from 'node:crypto';
import mongoose from 'mongoose';

const remittanceSchema = new mongoose.Schema({
  id: { type: String, default: randomUUID, unique: true },
  recipient: { type: String, required: true },
  amount: { type: Number, required: true },
  rate: { type: Number, required: true },
  date: { type: String, required: true },
  purpose: { type: String, required: true },
}, {
  id: false,
  versionKey: false,
  toJSON: { transform: (_doc, result) => { delete result._id; return result; } },
});

export default mongoose.model('Remittance', remittanceSchema);
