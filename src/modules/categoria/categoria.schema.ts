import { z } from 'zod'

const nomeSchema = z

  .string()
  .trim()
  .min(
    2,
    'O nome deve possuir pelo menos 2 caracteres'
  )
  .max(
    150,
    'O nome deve possuir no máximo 150 caracteres'
  )

const descricaoSchema = z
  .string()
  .trim()
  .max(
    255,
    'A descrição deve possuir no máximo 255 caracteres'
  )
  .nullable()

const booleanQuerySchema = z
  .union([
    z.boolean(),
    z.enum([
      'true',
      'false',
    ]),
  ])
  .transform(
    (value) =>
      value === true ||
      value === 'true'
  )

export const createCategoriaSchema =
  z.object(
    {
      nome: nomeSchema,

      descricao:
        descricaoSchema.optional(),

      ativo: z
        .boolean()
        .optional()
        .default(true),
    },
    {
      error: (issue) => {
        if (
          issue.code === 'unrecognized_keys'
        ) {
          return 'Existem campos não permitidos na requisição'
        }

        return undefined
      },
    }
  )

export const updateCategoriaSchema =
  z.object(
    {
      nome: nomeSchema.optional(),

      descricao:
        descricaoSchema.optional(),

      ativo:    
        z.boolean().optional(),
    },
    {
      error: (issue) => {
        if (
          issue.code === 'unrecognized_keys'
        ) {
          return 'Não é permitido alterar id ou data_cadastro'
        }

        return undefined
      },
    }
  )
  .refine(
    (data) =>
      Object.keys(data).length > 0,
    {
      message:
        'Informe pelo menos um campo para atualização',
    }
  )

export const listCategoriaSchema =
  z.object({
    page: z.coerce
      .number()
      .int(
        'A página deve ser um número inteiro'
      )
      .min(
        1,
        'A página deve ser maior ou igual a 1'
      )
      .default(1),

    limit: z.coerce
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
        'O limite máximo é 100 registros'
      )
      .default(20),

    q: z
      .string()
      .trim()
      .max(
        150,
        'A busca deve possuir no máximo 150 caracteres'
      )
      .optional()
      .transform(
        (value) =>
          value || undefined
      ),

    include_inativos:
      booleanQuerySchema
        .optional()
        .default(false),
  })

export const categoriaIdSchema =
  z.object({
    id: z.coerce
      .number()
      .int(
        'O id deve ser um número inteiro'
      )
      .positive(
        'O id deve ser maior que zero'
      ),
  })

export type CreateCategoriaInput =
  z.infer<
    typeof createCategoriaSchema
  >

export type UpdateCategoriaInput =
  z.infer<
    typeof updateCategoriaSchema
  >

export type ListCategoriaInput =
  z.infer<
    typeof listCategoriaSchema
  >

export type CategoriaIdInput =
  z.infer<
    typeof categoriaIdSchema
  >