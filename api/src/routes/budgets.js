import express from "express";

import{
    getBudgets,
    getBudgetById,
    createBudget,
    updateBudget,
    deleteBudget
} from "../controllers/budgets.js";

import{validate} from "../middleware/validate.js";
import{budgetSchema} from "../models/budget.js";

const router= express.Router();

// to get all budgets
router.get('/', getBudgets);

// to get a budget by ID
router.get('/:id', getBudgetById);

// to create a new budget
router.post('/', validate(budgetSchema), createBudget);

// to update a budget
router.put('/:id', validate(budgetSchema), updateBudget);

// to delete a budget
router.delete('/:id', deleteBudget);

export default router;