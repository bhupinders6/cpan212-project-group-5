import { z } from 'zod';
import Remittance from '../models/remittance.js';

// Zod schemas
const remittanceSchema = z.object({
  recipient: z.string().trim().min(1, "Recipient must be a non-empty string."),
  amount: z.number().positive("Amount must be a positive number."),
  rate: z.number().positive("Rate must be a positive number."),
  date: z.string().trim().min(1, "Date must be a non-empty string."),
  purpose: z.string().trim().min(1, "Purpose must be a non-empty string."),
}).strict();

const remittancePatchSchema = remittanceSchema.partial().refine(
  data => Object.keys(data).length > 0,
  { message: "At least one field is required." }
);

// Helper for validation
function validateBody(schema, req, res) {
  const result = schema.safeParse(req.body);
  if (result.success) return result.data;

  const details = result.error.issues.map(issue => ({
    field: issue.path.join(".") || "body",
    message: issue.message,
  }));
  res.status(400).json({ error: "Validation failed.", details });
  return null;
}

// Exported Controllers
export const listRemittances = async (_req, res) => {
  res.json(await Remittance.find());
};

export const getRemittance = async (req, res) => {
  const remittance = await Remittance.findOne({ id: req.params.id });
  if (!remittance) {
    return res.status(404).json({ error: "Remittance not found." });
  }
  res.json(remittance);
};

export const createRemittance = async (req, res) => {
  const data = validateBody(remittanceSchema, req, res);
  if (!data) return;

  const newRemittance = await Remittance.create(data);
  res.status(201).json(newRemittance);
};

export const updateRemittance = async (req, res) => {
  const existing = await Remittance.exists({ id: req.params.id });
  if (!existing) {
    return res.status(404).json({ error: "Remittance not found." });
  }

  const data = validateBody(remittancePatchSchema, req, res);
  if (!data) return;

  const remittance = await Remittance.findOneAndUpdate(
    { id: req.params.id }, data, { returnDocument: 'after', runValidators: true }
  );
  if (!remittance) {
    return res.status(404).json({ error: "Remittance not found." });
  }
  res.json(remittance);
};

export const deleteRemittance = async (req, res) => {
  const remittance = await Remittance.findOneAndDelete({ id: req.params.id });
  if (!remittance) {
    return res.status(404).json({ error: "Remittance not found." });
  }

  res.status(204).end();
};
