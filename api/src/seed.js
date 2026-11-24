import mongoose from 'mongoose';
import { connectDatabase } from './db.js';
import Budget from './models/budgetDocument.js';
import Remittance from './models/remittance.js';

const budgets = [
  { id: 'b1a2c3d4-e5f6-7890-abcd-ef1234567890', userId: 'user-1', currency: 'INR', monthlyLimit: 30000, month: 'November', year: 2026 },
  { id: 'f9e8d7c6-b5a4-3210-fedc-ba0987654321', userId: 'user-2', currency: 'USD', monthlyLimit: 500, month: 'November', year: 2026 },
];

const remittances = [
  { id: '9cd12e9b-0bce-45fd-b487-d97e662b69ee', recipient: 'Priyanka', amount: 250, rate: 62.5, date: '2026-10-21', purpose: 'Family support' },
  { id: '54ef019a-8e51-4ce0-95d8-9d6d4a976c4e', recipient: 'Ajay', amount: 150, rate: 62.5, date: '2026-11-01', purpose: 'Gift' },
];

try {
  await connectDatabase();
  for (const [model, records] of [[Budget, budgets], [Remittance, remittances]]) {
    for (const record of records) {
      await model.updateOne({ id: record.id }, { $setOnInsert: record }, { upsert: true });
    }
  }
  console.log('Sample data seeded.');
} catch (error) {
  console.error('Failed to seed MongoDB:', error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
