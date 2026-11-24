import Budget from '../models/budgetDocument.js';

export const getBudgets = async (_req, res) => {
  res.json(await Budget.find());
};

export const getBudgetById = async (req, res) => {
  const budget = await Budget.findOne({ id: req.params.id });
  if (!budget) {
    return res.status(404).json({ message: 'Budget not found' });
  }
  res.json(budget);
};

export const createBudget = async (req, res) => {
  const budget = await Budget.create(req.body);
  res.status(201).json(budget);
};

export const updateBudget = async (req, res) => {
  const budget = await Budget.findOneAndUpdate(
    { id: req.params.id }, req.body, { returnDocument: 'after', runValidators: true }
  );
  if (!budget) {
    return res.status(404).json({ message: 'Budget not found' });
  }
  res.json(budget);
};

export const deleteBudget = async (req, res) => {
  const budget = await Budget.findOneAndDelete({ id: req.params.id });
  if (!budget) {
    return res.status(404).json({ message: 'Budget not found' });
  }
  res.status(204).send();
};
