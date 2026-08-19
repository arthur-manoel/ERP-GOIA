import {
  z,
} from 'zod'

const nomeSchema =
  z
    .string()
    .trim()
    .min(
      2,
      'O nome deve possuir pelo menos 2 caracteres'
    )
    .max(
      100,
      'O nome deve possuir no máximo 100 caracteres'
    )

const codigoHexSchema =
  z
    .string()
    .trim()
    .regex(
      /^#[0-9A-Fa-f]{6}$/,
      'O código hexadecimal deve seguir o formato #RRGGBB'
    )

export const createCorSchema =
  z
    .object({
      nome:
        nomeSchema,

      codigo_hex:
        codigoHexSchema,

      ativo:
        z
          .boolean()
          .optional()
          .default(true),
    })
    .strict()

export const updateCorSchema =
  z
    .object({
      nome:
        nomeSchema.optional(),

      codigo_hex:
        codigoHexSchema.optional(),

      ativo:
        z
          .boolean()
          .optional(),
    })
    .strict()
    .refine(
      (data) =>
        Object.keys(data)
          .length > 0,
      {
        message:
          'Informe pelo menos um campo para atualização',
      }
    )

export const corIdSchema =
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

export const listCoresSchema =
  z.object({
    page:
      z.coerce
        .number()
        .int()
        .positive()
        .default(1),

    limit:
      z.coerce
        .number()
        .int()
        .positive()
        .max(
          100,
          'O limite máximo é 100'
        )
        .default(20),

    q:
      z
        .string()
        .trim()
        .max(100)
        .optional(),

    include_inativos:
      z
        .enum([
          'true',
          'false',
        ])
        .optional()
        .default('false')
        .transform(
          (value) =>
            value ===
            'true'
        ),
  })

export type CreateCorInput =
  z.infer<
    typeof createCorSchema
  >

export type UpdateCorInput =
  z.infer<
    typeof updateCorSchema
  >

export type ListCoresInput =
  z.infer<
    typeof listCoresSchema
  >