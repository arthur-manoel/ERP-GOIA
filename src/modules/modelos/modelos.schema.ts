import { z } from 'zod'

export const modeloStatusSchema =
  z.enum([
    'ATIVO',
    'INATIVO',
  ])

const idEmpresaSchema =
  z
    .number()
    .int('id_empresa deve ser um número inteiro')
    .positive('id_empresa deve ser um número positivo')
    .nullable()

const nomeSchema =
  z
    .string()
    .trim()
    .min(
      1,
      'Nome é obrigatório'
    )
    .max(
      100,
      'Nome deve possuir no máximo 100 caracteres'
    )

const descricaoSchema =
  z
    .string()
    .trim()
    .max(
      255,
      'Descrição deve possuir no máximo 255 caracteres'
    )
    .nullable()

export const createModeloSchema =
  z
    .object({
      id_empresa:
        idEmpresaSchema
          .optional()
          .default(null),

      nome:
        nomeSchema,

      descricao:
        descricaoSchema
          .optional(),

      status:
        modeloStatusSchema
          .optional()
          .default('ATIVO'),
    })
    .strict()

export const updateModeloSchema =
  z
    .object({
      id_empresa:
        idEmpresaSchema
          .optional(),

      nome:
        nomeSchema
          .optional(),

      descricao:
        descricaoSchema
          .optional(),

      status:
        modeloStatusSchema
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

export const modeloIdParamSchema =
  z
    .object({
      id:
        z.coerce
          .number()
          .int(
            'ID deve ser um número inteiro'
          )
          .positive(
            'ID deve ser um número positivo'
          ),
    })
    .strict()

export type ModeloStatus =
  z.infer<
    typeof modeloStatusSchema
  >

export type CreateModeloInput =
  z.infer<
    typeof createModeloSchema
  >

export type UpdateModeloInput =
  z.infer<
    typeof updateModeloSchema
  >