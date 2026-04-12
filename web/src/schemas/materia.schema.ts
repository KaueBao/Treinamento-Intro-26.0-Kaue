import { z } from "zod";
import { corSchema, nameSchema, slugSchema } from "./base.schema";

export const createMateriaSchema = z
  .object({
    name: nameSchema,
    descricao: z
      .string({
        error: (issue) =>
          issue.input === undefined
            ? "Descrição é obrigatória"
            : "Descrição deve ser um texto",
      })
      .min(1, "Descrição não pode estar vazia")
      .max(500, "Descrição não pode ter mais de 500 caracteres")
      .trim(),
    cor: corSchema,
    slug: slugSchema,
  })
  .strict();

export const patchMateriaSchema = createMateriaSchema
  .partial()
  .strict()
  .refine((obj) => Object.keys(obj).length > 0, {
    message: "Pelo menos um campo precisa ser fornecido para atualização",
  });
