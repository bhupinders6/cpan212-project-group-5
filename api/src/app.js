import express from 'express';
import remittanceRouter from './routes/remittances.js';
import externalRouter from './routes/external.js';
import { notFoundHandler, errorHandler } from './middleware/errors.js';

const app = express();

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/remittances', remittanceRouter);
app.use('/api', externalRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;