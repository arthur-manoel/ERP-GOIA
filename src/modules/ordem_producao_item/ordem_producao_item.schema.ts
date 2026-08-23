import { z } from 'zod'

const idSchema = z
  .number({
    error:
      'O ID deve ser um número',
  })
  .int(
    'O ID deve ser um número inteiro'
  )
  .positive(
    'O ID deve ser maior que zero'
  )

const quantidadeSchema = z
  .number({
    error:
      'A quantidade deve ser um número',
  })
  .int(
    'A quantidade deve ser um número inteiro'
  )
  .min(
    0,
    'A quantidade não pode ser negativa'
  )

export const createOrdemProducaoItemSchema =
  z
    .object({
      id_ordem_producao:
        idSchema,

      id_produto:
        idSchema,

      id_modelo:
        idSchema
          .optional()
          .nullable(),

      id_cor:
        idSchema
          .optional()
          .nullable(),

      id_tamanho:
        idSchema
          .optional()
          .nullable(),

      quantidade:
        quantidadeSchema,

      quantidade_produzida:
        quantidadeSchema,
    })
    .strict()

export const updateOrdemProducaoItemSchema =
  z
    .object({
      id_produto:
        idSchema.optional(),

      id_modelo:
        idSchema
          .optional()
          .nullable(),

      id_cor:
        idSchema
          .optional()
          .nullable(),

      id_tamanho:
        idSchema
          .optional()
          .nullable(),

      quantidade:
        quantidadeSchema
          .optional(),

      quantidade_produzida:
        quantidadeSchema
          .optional(),
    })
    .strict()
    .refine(
      (data) =>
        Object.keys(data).length >
        0,
      {
        message:
          'Informe pelo menos um campo para atualização',
      }
    )

export const ordemProducaoItemIdSchema =
  z.object({
    id:
      z.coerce
        .number()
        .int(
          'O ID deve ser um número inteiro'
        )
        .positive(
          'O ID deve ser maior que zero'
        ),
  })

export const listOrdemProducaoItemSchema =
  z.object({
    page:
      z.coerce
        .number()
        .int(
          'A página deve ser um número inteiro'
        )
        .min(
          1,
          'A página deve ser maior ou igual a 1'
        )
        .default(1),

    limit:
      z.coerce
        .number()
        .int(
          'O limite deve ser um número inteiro'
        )
        .min(
          1,
          'O limite deve ser maior ou igual a 1'
        )
        .max(
          100,
          'O limite máximo é 100'
        )
        .default(20),

    id_ordem_producao:
      z.coerce
        .number()
        .int(
          'id_ordem_producao deve ser um número inteiro'
        )
        .positive(
          'id_ordem_producao deve ser maior que zero'
        )
        .optional(),

    id_produto:
      z.coerce
        .number()
        .int(
          'id_produto deve ser um número inteiro'
        )
        .positive(
          'id_produto deve ser maior que zero'
        )
        .optional(),

    id_modelo:
      z.coerce
        .number()
        .int(
          'id_modelo deve ser um número inteiro'
        )
        .positive(
          'id_modelo deve ser maior que zero'
        )
        .optional(),

    id_cor:
      z.coerce
        .number()
        .int(
          'id_cor deve ser um número inteiro'
        )
        .positive(
          'id_cor deve ser maior que zero'
        )
        .optional(),

    id_tamanho:
      z.coerce
        .number()
        .int(
          'id_tamanho deve ser um número inteiro'
        )
        .positive(
          'id_tamanho deve ser maior que zero'
        )
        .optional(),
  })

export type CreateOrdemProducaoItemInput =
  z.infer<
    typeof createOrdemProducaoItemSchema
  >

export type UpdateOrdemProducaoItemInput =
  z.infer<
    typeof updateOrdemProducaoItemSchema
  >

export type ListOrdemProducaoItemInput =
  z.infer<
    typeof listOrdemProducaoItemSchema
  >