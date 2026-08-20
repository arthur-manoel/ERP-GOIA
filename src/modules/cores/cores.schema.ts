import {
  z,
} from 'zod'

export const createCorSchema =
  z.object({
    id_empresa:
      z
        .number()
        .int()
        .positive(
          'id_empresa deve ser maior que zero'
        ),

    nome:
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
        ),

    codigo_hex:
      z
        .string()
        .trim()
        .regex(
          /^#[0-9A-Fa-f]{6}$/,
          'O código hexadecimal deve seguir o formato #RRGGBB'
        ),

    status:
      z
        .enum([
          'ATIVO',
          'INATIVO',
        ])
        .optional()
        .default(
          'ATIVO'
        ),
  })

export const updateCorSchema =
  z
    .object({
      id_empresa:
        z
          .number()
          .int()
          .positive(
            'id_empresa deve ser maior que zero'
          )
          .optional(),

      nome:
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
          .optional(),

      codigo_hex:
        z
          .string()
          .trim()
          .regex(
            /^#[0-9A-Fa-f]{6}$/,
            'O código hexadecimal deve seguir o formato #RRGGBB'
          )
          .optional(),

      status:
        z
          .enum([
            'ATIVO',
            'INATIVO',
          ])
          .optional(),
    })
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
        .int()
        .positive(
          'ID inválido'
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
        .max(100)
        .default(20),

    q:
      z
        .string()
        .trim()
        .optional(),

    id_empresa:
      z.coerce
        .number()
        .int()
        .positive()
        .optional(),

    include_inativos:
      z
        .enum([
          'true',
          'false',
        ])
        .optional()
        .default(
          'false'
        )
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