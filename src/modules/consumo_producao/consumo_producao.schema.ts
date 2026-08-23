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

export const createConsumoProducaoSchema =
  z
    .object({
      id_ordem_producao:
        idSchema,

      id_necessidade_producao:
        idSchema,

      id_reserva_estoque:
        idSchema,

      id_produto:
        idSchema,

      id_setor:
        idSchema,

      quantidade:
        quantidadeSchema,

      id_usuario:
        idSchema,
    })
    .strict()

export const updateConsumoProducaoSchema =
  z
    .object({
      id_ordem_producao:
        idSchema.optional(),

      id_necessidade_producao:
        idSchema.optional(),

      id_reserva_estoque:
        idSchema.optional(),

      id_produto:
        idSchema.optional(),

      id_setor:
        idSchema.optional(),

      quantidade:
        quantidadeSchema
          .optional(),

      id_usuario:
        idSchema.optional(),
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

export const consumoProducaoIdSchema =
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

export const listConsumoProducaoSchema =
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
        .int()
        .positive()
        .optional(),

    id_necessidade_producao:
      z.coerce
        .number()
        .int()
        .positive()
        .optional(),

    id_reserva_estoque:
      z.coerce
        .number()
        .int()
        .positive()
        .optional(),

    id_produto:
      z.coerce
        .number()
        .int()
        .positive()
        .optional(),

    id_setor:
      z.coerce
        .number()
        .int()
        .positive()
        .optional(),
  })

export type CreateConsumoProducaoInput =
  z.infer<
    typeof createConsumoProducaoSchema
  >

export type UpdateConsumoProducaoInput =
  z.infer<
    typeof updateConsumoProducaoSchema
  >

export type ListConsumoProducaoInput =
  z.infer<
    typeof listConsumoProducaoSchema
  >