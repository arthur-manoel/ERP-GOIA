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

const tipoOrigemSchema = z.enum([
  'VENDA',
  'ORDEM_PRODUCAO',
  'NECESSIDADE_PRODUCAO',
])

const statusSchema = z.enum([
  'RESERVADO',
  'FINALIZADO',
  'CANCELADO',
])

export const createReservaEstoqueSchema =
  z
    .object({
      id_empresa:
        idSchema,

      id_setor:
        idSchema,

      id_produto:
        idSchema,

      tipo_origem:
        tipoOrigemSchema,

      id_venda:
        idSchema
          .optional(),

      id_ordem_producao:
        idSchema
          .optional(),

      id_necessidade_producao:
        idSchema
          .optional(),

      quantidade:
        quantidadeSchema,

      status:
        statusSchema
          .optional()
          .default(
            'RESERVADO'
          ),

      id_usuario:
        idSchema,
    })
    .strict()

export const updateReservaEstoqueSchema =
  z
    .object({
      id_empresa:
        idSchema
          .optional(),

      id_setor:
        idSchema
          .optional(),

      id_produto:
        idSchema
          .optional(),

      tipo_origem:
        tipoOrigemSchema
          .optional(),

      id_venda:
        idSchema
          .optional()
          .nullable(),

      id_ordem_producao:
        idSchema
          .optional()
          .nullable(),

      id_necessidade_producao:
        idSchema
          .optional()
          .nullable(),

      quantidade:
        quantidadeSchema
          .optional(),

      status:
        statusSchema
          .optional(),

      id_usuario:
        idSchema
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

export const reservaEstoqueIdSchema =
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

export const listReservaEstoqueSchema =
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

    status:
      statusSchema
        .optional(),
  })

export type CreateReservaEstoqueInput =
  z.infer<
    typeof createReservaEstoqueSchema
  >

export type UpdateReservaEstoqueInput =
  z.infer<
    typeof updateReservaEstoqueSchema
  >

export type ListReservaEstoqueInput =
  z.infer<
    typeof listReservaEstoqueSchema
  >