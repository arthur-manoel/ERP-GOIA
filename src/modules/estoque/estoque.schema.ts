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

export const createEstoqueSchema =
  z
    .object({
      id_empresa:
        idSchema,

      id_setor:
        idSchema,

      id_produto:
        idSchema,

      quantidade:
        quantidadeSchema,

      quantidade_reservada:
        z
          .number({
            error:
              'A quantidade reservada deve ser um número',
          })
          .int(
            'A quantidade reservada deve ser um número inteiro'
          )
          .min(
            0,
            'A quantidade reservada não pode ser negativa'
          ),
    })
    .strict()

export const updateEstoqueSchema =
  z
    .object({
      id_empresa:
        idSchema.optional(),

      id_setor:
        idSchema.optional(),

      id_produto:
        idSchema.optional(),

      quantidade:
        quantidadeSchema
          .optional(),

      quantidade_reservada:
        z
          .number({
            error:
              'A quantidade reservada deve ser um número',
          })
          .int(
            'A quantidade reservada deve ser um número inteiro'
          )
          .min(
            0,
            'A quantidade reservada não pode ser negativa'
          )
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

export const estoqueIdSchema =
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

export const listEstoqueSchema =
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

    id_empresa:
      z.coerce
        .number()
        .int(
          'id_empresa deve ser um número inteiro'
        )
        .positive(
          'id_empresa deve ser maior que zero'
        )
        .optional(),

    id_setor:
      z.coerce
        .number()
        .int(
          'id_setor deve ser um número inteiro'
        )
        .positive(
          'id_setor deve ser maior que zero'
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
  })

export type CreateEstoqueInput =
  z.infer<
    typeof createEstoqueSchema
  >

export type UpdateEstoqueInput =
  z.infer<
    typeof updateEstoqueSchema
  >

export type ListEstoqueInput =
  z.infer<
    typeof listEstoqueSchema
  >