import { z } from "zod";
import { objectIdSchema } from "./base.schema";

export const createProdutoSchema = z.object({
  nome: z.string().min(1, "Nome e obrigatorio").max(120).trim(),
  descricao: z.string().min(1, "Descricao e obrigatoria").max(500).trim(),
  preco: z.number().positive("Preco deve ser maior que zero"),
  categoriaIds: z.array(objectIdSchema).optional(),
});

export const patchProdutoSchema = createProdutoSchema
  .partial()
  .refine((obj) => Object.keys(obj).length > 0, {
    message: "Pelo menos um campo precisa ser enviado",
  });
