import {
  z,
} from 'zod'

export const cargoStatusSchema =
  z.enum([
    'ATIVO',
    'INATIVO',
  ])

export const createCargoSchema =
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

      descricao: z
        .string()
        .trim()
        .nullable()
        .optional(),

      status:
        cargoStatusSchema,
    })
    .strict()

export const updateCargoSchema =
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

      descricao: z
        .string()
        .trim()
        .nullable()
        .optional(),

      status:
        cargoStatusSchema
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

export const cargoIdParamSchema =
  z
    .object({
      id: z.coerce
        .number()
        .int()
        .positive(),
    })
    .strict()

export type CargoStatus =
  z.infer<
    typeof cargoStatusSchema
  >

export type CreateCargoInput =
  z.infer<
    typeof createCargoSchema
  >

export type UpdateCargoInput =
  z.infer<
    typeof updateCargoSchema
  >