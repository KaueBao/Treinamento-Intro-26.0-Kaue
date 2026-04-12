import { z } from "zod";
import { objectIdSchema } from "./base.schema";

export const addCarrinhoItemSchema = z
  .object({
    produtoId: objectIdSchema,
    quantidade: z.number().int().positive().optional(),
  })
  .strict();

export const removeCarrinhoItemSchema = z
  .object({
    produtoId: objectIdSchema,
    quantidade: z.number().int().positive().optional(),
  })
  .strict();
