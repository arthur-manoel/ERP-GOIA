
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

const nomeSchema = z
  .string({
    error:
      'O nome deve ser uma string',
  })
  .trim()
  .min(
    2,
    'O nome deve possuir no mínimo 2 caracteres'
  )
  .max(
    150,
    'O nome deve possuir no máximo 150 caracteres'
  )

const descricaoSchema = z
  .string({
    error:
      'A descrição deve ser uma string',
  })
  .trim()
  .max(
    255,
    'A descrição deve possuir no máximo 255 caracteres'
  )

const statusSchema = z.enum([
  'ATIVO',
  'INATIVO',
])

export const createLocalEstoqueSchema =
  z
    .object({
      id_empresa:
        idSchema,

      nome:
        nomeSchema,

      descricao:
        descricaoSchema
          .optional()
          .nullable(),

      status:
        statusSchema
          .optional()
          .default(
            'ATIVO'
          ),
    })
    .strict()

export const updateLocalEstoqueSchema =
  z
    .object({
      id_empresa:
        idSchema.optional(),

      nome:
        nomeSchema.optional(),

      descricao:
        descricaoSchema
          .optional()
          .nullable(),

      status:
        statusSchema.optional(),
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

export const localEstoqueIdSchema =
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

export const listLocaisEstoqueSchema =
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

    status:
      statusSchema.optional(),
  })

export type CreateLocalEstoqueInput =
  z.infer<
    typeof createLocalEstoqueSchema
  >

export type UpdateLocalEstoqueInput =
  z.infer<
    typeof updateLocalEstoqueSchema
  >

export type ListLocaisEstoqueInput =
  z.infer<
    typeof listLocaisEstoqueSchema
  >