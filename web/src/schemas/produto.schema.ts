import { z } from "zod";
import { objectIdSchema } from "./base.schema";

const categoriaIdsSchema = z.array(objectIdSchema);

const productObjectSchema = z
  .object({
    nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres").max(120).trim(),
    descricao: z
      .string()
      .min(10, "Descrição deve ter no mínimo 10 caracteres")
      .max(500)
      .trim(),
    preco: z.coerce.number().positive("Preço deve ser positivo"),
    categorias: categoriaIdsSchema.optional(),
    categoriaIds: categoriaIdsSchema.optional(),
  })
  .strict()
  .refine((data) => !(data.categorias && data.categoriaIds), {
    message: "Envie apenas um dos campos: categorias ou categoriaIds",
    path: ["categorias"],
  });

export const productSchema = productObjectSchema.transform((data) => ({
  nome: data.nome,
  descricao: data.descricao,
  preco: data.preco,
  categoriaIds: data.categorias ?? data.categoriaIds,
}));

const patchProductObjectSchema = z
  .object({
    nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres").max(120).trim().optional(),
    descricao: z
      .string()
      .min(10, "Descrição deve ter no mínimo 10 caracteres")
      .max(500)
      .trim()
      .optional(),
    preco: z.coerce.number().positive("Preço deve ser positivo").optional(),
    categorias: categoriaIdsSchema.optional(),
    categoriaIds: categoriaIdsSchema.optional(),
  })
  .strict()
  .refine((obj) => Object.keys(obj).length > 0, {
    message: "Pelo menos um campo precisa ser enviado",
  })
  .refine((data) => !(data.categorias && data.categoriaIds), {
    message: "Envie apenas um dos campos: categorias ou categoriaIds",
    path: ["categorias"],
  });

export const patchProductSchema = patchProductObjectSchema.transform((data) => ({
  nome: data.nome,
  descricao: data.descricao,
  preco: data.preco,
  categoriaIds: data.categorias ?? data.categoriaIds,
}));

// aliases para manter compatibilidade com o código atual
export const createProdutoSchema = productSchema;
export const patchProdutoSchema = patchProductSchema;
