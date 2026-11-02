import crypto from 'node:crypto';

// sample budget data
let budgets= [
    {
        id: 'b1a2c3d4-e5f6-7890-abcd-ef1234567890',
        userId: 'user-1',
        currency: 'INR',
        monthlyLimit: 30000,
        month: 'November',
        year: 2026,
        createdAt: new Date()
    },

    {
        id: 'f9e8d7c6-b5a4-3210-fedc-ba0987654321',
        userId: 'user-2',
        currency: 'USD',
        monthlyLimit: 500,
        month: 'November',
        year: 2026,
        createdAt: new Date()
    }
];


// to get al budgets
export const getBudgets = (req, res) => {
    res,json(budgets);
};

// to get the budgetby ID
export const getBudgetById=(req,res,next)=>{
    const budget= bugets.find(b=> b.id===req.params.id);

    if(!budget){
        return res.status(404).json({message: 'Budget not found'});
    }  

    res.json(budget);
};

//to create a new budget
export const createBudget= (req,res)=> {
    const newBudget= {
        id: crypto.randomUUID(),
        ...req.body,
        createdAt: new Date()
    };
    budgets.push(newBudget);

    res.status(201).json(newBudget);
};

// to update the budget 
export const updateBudget= (req,res, next)=>{
    const budget=budget.find(b=> b.id===req.params.id);

    if(!budget){
        return res.status(404).json({message: 'Budget not found'});
    }

    Object.assign(budget, req.body);
    res.json(budget);
};

//to delete
export const deleteBudget= (req,res)=>{
    const index=budgets.findIndex(b=> b.id===req.params.id);

    if(index===-1){
        return res.status(404).json({message: 'Budget not found'});
    }

    budget.splice(index,1);
    res.status(204).send();
};
