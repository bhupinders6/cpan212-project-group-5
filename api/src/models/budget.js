import { z } from "zod";

export const budgetSchema = z.object({
  title: z.string().min(1),
  amount: z.number().positive(),
  category: z.string().min(1)
});