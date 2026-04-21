import { z } from "zod";
import { objectIdSchema } from "./base.schema";

const produtoIdsSchema = z
  .array(objectIdSchema)
  .min(1, "Informe pelo menos um produto");

export const compraStatusSchema = z.enum([
  "pending",
  "paid",
  "shipped",
  "delivered",
  "cancelled",
]);

export const createCompraSchema = z
  .object({
    userId: z.string().min(1, "userId e obrigatorio"),
    produtoIds: produtoIdsSchema,
  })
  .strict();

export const patchCompraSchema = z
  .object({
    userId: z.string().min(1).optional(),
    produtoIds: produtoIdsSchema.optional(),
  })
  .strict()
  .refine((obj) => Object.keys(obj).length > 0, {
    message: "Pelo menos um campo precisa ser enviado",
  });

export const checkoutCompraSchema = z
  .object({
    produtoIds: produtoIdsSchema,
  })
  .strict();

export const patchCompraStatusSchema = z
  .object({
    status: compraStatusSchema,
  })
  .strict();
