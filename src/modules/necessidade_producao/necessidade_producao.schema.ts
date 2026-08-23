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

const statusSchema = z.enum([
  'PENDENTE',
  'RESERVADO',
  'CONSUMIDO',
  'CANCELADO',
])

export const createNecessidadeProducaoSchema =
  z
    .object({
      id_ordem_producao:
        idSchema,

      id_produto:
        idSchema,

      quantidade_necessaria:
        quantidadeSchema,

      quantidade_reservada:
        quantidadeSchema,

      quantidade_consumida:
        quantidadeSchema,

      status:
        statusSchema
          .optional()
          .default(
            'PENDENTE'
          ),
    })
    .strict()

export const updateNecessidadeProducaoSchema =
  z
    .object({
      id_ordem_producao:
        idSchema.optional(),

      id_produto:
        idSchema.optional(),

      quantidade_necessaria:
        quantidadeSchema
          .optional(),

      quantidade_reservada:
        quantidadeSchema
          .optional(),

      quantidade_consumida:
        quantidadeSchema
          .optional(),

      status:
        statusSchema.optional(),
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

export const necessidadeProducaoIdSchema =
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

export const listNecessidadeProducaoSchema =
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

    status:
      statusSchema.optional(),
  })

export type CreateNecessidadeProducaoInput =
  z.infer<
    typeof createNecessidadeProducaoSchema
  >

export type UpdateNecessidadeProducaoInput =
  z.infer<
    typeof updateNecessidadeProducaoSchema
  >

export type ListNecessidadeProducaoInput =
  z.infer<
    typeof listNecessidadeProducaoSchema
  >