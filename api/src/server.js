import app from './app.js';
import { connectDatabase } from './db.js';

const port = process.env.PORT || 4000;

try {
  await connectDatabase();
  app.listen(port, () => {
    console.log(`Remittance Tracker API listening on port ${port}`);
  });
} catch (error) {
  console.error('Failed to connect to MongoDB:', error.message);
  process.exitCode = 1;
}