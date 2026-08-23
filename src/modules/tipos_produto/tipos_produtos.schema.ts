import { z } from 'zod'

export const createTipoProdutoSchema =
  z.object({
    nome: z
      .string()
      .trim()
      .min(
        1,
        'O nome é obrigatório'
      )
      .max(
        100,
        'O nome deve possuir no máximo 100 caracteres'
      ),

    descricao: z
      .string()
      .trim()
      .max(
        255,
        'A descrição deve possuir no máximo 255 caracteres'
      )
      .nullable()
      .optional(),
  })
  .strict()

export const updateTipoProdutoSchema =
  z.object({
    nome: z
      .string()
      .trim()
      .min(
        1,
        'O nome é obrigatório'
      )
      .max(
        100,
        'O nome deve possuir no máximo 100 caracteres'
      )
      .optional(),

    descricao: z
      .string()
      .trim()
      .max(
        255,
        'A descrição deve possuir no máximo 255 caracteres'
      )
      .nullable()
      .optional(),
  })
  .strict()
  .refine(
    (data) =>
      Object.keys(data).length > 0,
    {
      message:
        'Informe pelo menos um campo para atualização',
    }
  )

export const listTiposProdutosSchema =
  z.object({
    page: z.coerce
      .number()
      .int()
      .min(1)
      .default(1),

    limit: z.coerce
      .number()
      .int()
      .min(1)
      .max(100)
      .default(20),

    q: z
      .string()
      .trim()
      .optional()
      .transform(
        (value) =>
          value || undefined
      ),
  })

export const tipoProdutoIdSchema =
  z.object({
    id: z.coerce
      .number()
      .int()
      .positive(),
  })

export type CreateTipoProdutoInput =
  z.infer<
    typeof createTipoProdutoSchema
  >

export type UpdateTipoProdutoInput =
  z.infer<
    typeof updateTipoProdutoSchema
  >

export type ListTiposProdutosInput =
  z.infer<
    typeof listTiposProdutosSchema
  >