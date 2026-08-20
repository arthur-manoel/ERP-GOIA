import {
  z,
} from 'zod'

export const setorStatusSchema =
  z.enum([
    'ATIVO',
    'INATIVO',
  ])

export const setorTipoSchema = z.enum([
  'FABRICA',
  'AVIAMENTO',
  'ESTOQUE',
  'LOJA',
  'EXPEDICAO',
  'OUTRO',
])

export const createSetorSchema =
  z
    .object({
      id_empresa: z
        .number()
        .int()
        .positive()
        .nullable(),

      nome: z
        .string()
        .trim()
        .min(
          1,
          'Nome é obrigatório'
        ),

      tipo: setorTipoSchema,

      descricao: z
        .string()
        .trim()
        .nullable()
        .optional(),

      status:
        setorStatusSchema,
    })
    .strict()

export const updateSetorSchema =
  z
    .object({
      id_empresa: z
        .number()
        .int()
        .positive()
        .nullable()
        .optional(),

      nome: z
        .string()
        .trim()
        .min(
          1,
          'Nome não pode ser vazio'
        )
        .optional(),

      tipo: z
        .string()
        .trim()
        .min(
          1,
          'Tipo não pode ser vazio'
        )
        .optional(),

      descricao: z
        .string()
        .trim()
        .nullable()
        .optional(),

      status:
        setorStatusSchema
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

export const setorIdParamSchema =
  z
    .object({
      id: z.coerce
        .number()
        .int()
        .positive(),
    })
    .strict()

export type SetorStatus =
  z.infer<
    typeof setorStatusSchema
  >

export type CreateSetorInput =
  z.infer<
    typeof createSetorSchema
  >

export type UpdateSetorInput =
  z.infer<
    typeof updateSetorSchema
  >