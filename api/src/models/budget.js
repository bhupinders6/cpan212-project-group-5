import { z } from "zod";

export const budgetSchema = z.object({
  userId: z.string().min(1),
  currency: z.string().length(3),
  monthlyLimit: z.number().positive(),
  month: z.string().min(1),
  year: z.number().int()
});