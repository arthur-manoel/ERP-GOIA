import { z } from 'zod'

export const createCategoriaSchema = z
  .object({
    id_empresa: z.coerce
      .number()
      .int('O id_empresa deve ser um número inteiro')
      .positive('O id_empresa deve ser maior que zero'),

    nome: z
      .string()
      .trim()
      .min(2, 'O nome deve possuir pelo menos 2 caracteres')
      .max(150, 'O nome deve possuir no máximo 150 caracteres'),

    descricao: z
      .string()
      .trim()
      .max(255, 'A descrição deve possuir no máximo 255 caracteres')
      .nullable()
      .optional(),

    status: z
      .enum(['ATIVO', 'INATIVO'])
      .optional()
      .default('ATIVO'),
  })
  .strict()

export const updateCategoriaSchema = z
  .object({
    id_empresa: z.coerce
      .number()
      .int('O id_empresa deve ser um número inteiro')
      .positive('O id_empresa deve ser maior que zero')
      .optional(),

    nome: z
      .string()
      .trim()
      .min(2, 'O nome deve possuir pelo menos 2 caracteres')
      .max(150, 'O nome deve possuir no máximo 150 caracteres')
      .optional(),

    descricao: z
      .string()
      .trim()
      .max(255, 'A descrição deve possuir no máximo 255 caracteres')
      .nullable()
      .optional(),

    status: z
      .enum(['ATIVO', 'INATIVO'])
      .optional(),
  })
  .strict()
  .refine(
    (data) => Object.keys(data).length > 0,
    {
      message: 'Informe pelo menos um campo para atualização',
    }
  )

export const categoriaIdSchema = z.object({
  id: z.coerce
    .number()
    .int('O id deve ser um número inteiro')
    .positive('O id deve ser maior que zero'),
})

export const listCategoriaSchema = z.object({
  page: z.coerce
    .number()
    .int()
    .positive()
    .default(1),

  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(100)
    .default(20),

  q: z
    .string()
    .trim()
    .optional(),

  id_empresa: z.coerce
    .number()
    .int()
    .positive()
    .optional(),

  include_inativos: z
    .enum(['true', 'false'])
    .optional()
    .transform((value) => value === 'true'),
})

export type CreateCategoriaInput = z.infer<
  typeof createCategoriaSchema
>

export type UpdateCategoriaInput = z.infer<
  typeof updateCategoriaSchema
>

export type ListCategoriaInput = z.infer<
  typeof listCategoriaSchema
>