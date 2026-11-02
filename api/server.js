const express = require("express");
const { randomUUID } = require("node:crypto");

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());

const remittances = [
  {
    id: randomUUID(),
    recipient: "Priya Sharma",
    amount: 250,
    rate: 62.5,
    date: "2026-10-15",
    purpose: "Family support",
  },
  {
    id: randomUUID(),
    recipient: "Arjun Patel",
    amount: 150,
    rate: 62.5,
    date: "2026-10-20",
    purpose: "Education expenses",
  },
];

const remittanceFields = ["recipient", "amount", "rate", "date", "purpose"];
const remittanceRouter = express.Router();

function validateRemittance(data, partial = false) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return "Request body must be an object.";
  }

  const keys = Object.keys(data);
  if (keys.some(key => !remittanceFields.includes(key))) {
    return "Request body contains unsupported fields.";
  }
  if (partial && keys.length === 0) {
    return "At least one field is required.";
  }

  for (const field of remittanceFields) {
    if (!(field in data)) {
      if (partial) continue;
      return `The ${field} field is required.`;
    }

    const value = data[field];
    if (field === "amount" || field === "rate") {
      if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
        return `The ${field} field must be a positive number.`;
      }
    } else if (typeof value !== "string" || value.trim() === "") {
      return `The ${field} field must be a non-empty string.`;
    }
  }

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
  const error = validateRemittance(req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  const remittance = { id: randomUUID(), ...req.body };
  remittances.push(remittance);
  res.status(201).json(remittance);
});

remittanceRouter.patch("/:id", (req, res) => {
  const index = remittances.findIndex(item => item.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Remittance not found." });
  }

  const error = validateRemittance(req.body, true);
  if (error) {
    return res.status(400).json({ error });
  }

  remittances[index] = { ...remittances[index], ...req.body };
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
