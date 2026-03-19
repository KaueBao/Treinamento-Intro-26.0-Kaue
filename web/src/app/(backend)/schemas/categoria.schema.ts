import { z } from "zod";

export const createCategoriaSchema = z.object({
  nome: z.string().min(1, "Nome e obrigatorio").max(120).trim(),
});

export const patchCategoriaSchema = createCategoriaSchema
  .partial()
  .refine((obj) => Object.keys(obj).length > 0, {
    message: "Pelo menos um campo precisa ser enviado",
  });
