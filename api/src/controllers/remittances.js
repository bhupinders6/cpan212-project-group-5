import { randomUUID } from 'node:crypto';
import { z } from 'zod';

// In-memory storage
const remittances = [
  {
    id: randomUUID(),
    recipient: "Priyanka",
    amount: 250,
    rate: 62.5,
    date: "2026-10-21",
    purpose: "Family support",
  },
  {
    id: randomUUID(),
    recipient: "Ajay",
    amount: 150,
    rate: 62.5,
    date: "2026-11-01",
    purpose: "Gift",
  },
];

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
export const listRemittances = (_req, res) => {
  res.json(remittances);
};

export const getRemittance = (req, res) => {
  const remittance = remittances.find(item => item.id === req.params.id);
  if (!remittance) {
    return res.status(404).json({ error: "Remittance not found." });
  }
  res.json(remittance);
};

export const createRemittance = (req, res) => {
  const data = validateBody(remittanceSchema, req, res);
  if (!data) return;

  const newRemittance = { id: randomUUID(), ...data };
  remittances.push(newRemittance);
  res.status(201).json(newRemittance);
};

export const updateRemittance = (req, res) => {
  const index = remittances.findIndex(item => item.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Remittance not found." });
  }

  const data = validateBody(remittancePatchSchema, req, res);
  if (!data) return;

  remittances[index] = { ...remittances[index], ...data };
  res.json(remittances[index]);
};

export const deleteRemittance = (req, res) => {
  const index = remittances.findIndex(item => item.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Remittance not found." });
  }

  remittances.splice(index, 1);
  res.status(204).end();
};
