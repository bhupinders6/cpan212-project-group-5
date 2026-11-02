const express = require("express");
const { randomUUID } = require("node:crypto");
const { z } = require("zod");

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());

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

const remittanceRouter = express.Router();

const remittanceSchema = z
  .object({
    recipient: z.string().trim().min(1, "Recipient must be a non-empty string."),
    amount: z.number().positive("Amount must be a positive number."),
    rate: z.number().positive("Rate must be a positive number."),
    date: z.string().trim().min(1, "Date must be a non-empty string."),
    purpose: z.string().trim().min(1, "Purpose must be a non-empty string."),
  })
  .strict();

const remittancePatchSchema = remittanceSchema
  .partial()
  .refine(data => Object.keys(data).length > 0, {
    message: "At least one field is required.",
  });

// Returns { data } on success or sends a 400 with per-field details.
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

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

remittanceRouter.get("/", (_req, res) => {
  res.json(remittances);
});

remittanceRouter.get("/:id", (req, res) => {
  const remittance = remittances.find(item => item.id === req.params.id);
  if (!remittance) {
    return res.status(404).json({ error: "Remittance not found." });
  }
  res.json(remittance);
});

remittanceRouter.post("/", (req, res) => {
  const data = validateBody(remittanceSchema, req, res);
  if (!data) return;

  const remittance = { id: randomUUID(), ...data };
  remittances.push(remittance);
  res.status(201).json(remittance);
});

remittanceRouter.put("/:id", (req, res) => {
  const index = remittances.findIndex(item => item.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Remittance not found." });
  }

  const data = validateBody(remittanceSchema, req, res);
  if (!data) return;

  remittances[index] = { id: remittances[index].id, ...data };
  res.json(remittances[index]);
});

remittanceRouter.patch("/:id", (req, res) => {
  const index = remittances.findIndex(item => item.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Remittance not found." });
  }

  const data = validateBody(remittancePatchSchema, req, res);
  if (!data) return;

  remittances[index] = { ...remittances[index], ...data };
  res.json(remittances[index]);
});

remittanceRouter.delete("/:id", (req, res) => {
  const index = remittances.findIndex(item => item.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Remittance not found." });
  }

  remittances.splice(index, 1);
  res.status(204).end();
});

app.use(["/api/remitances", "/api/remittances"], remittanceRouter);

app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});
