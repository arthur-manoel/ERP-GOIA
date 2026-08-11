import { z } from 'zod'

const optionalString = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .nullable()

const cnpjSchema = z
  .string()
  .trim()
  .min(1, 'CNPJ é obrigatório')
  .refine(
    (value) => {
      const digits = value.replace(/\D/g, '')

      return digits.length === 14
    },
    {
      message:
        'CNPJ deve conter exatamente 14 dígitos',
    }
  )
  .transform((value) =>
    value.replace(/\D/g, '')
  )

export const empresaIdSchema = z.coerce
  .number()
  .int(
    'ID da empresa deve ser um número inteiro'
  )
  .positive(
    'ID da empresa deve ser maior que zero'
  )

export const createEmpresaSchema = z
  .object({
    razao_social: z
      .string()
      .trim()
      .min(
        1,
        'Razão social é obrigatória'
      )
      .max(
        150,
        'Razão social deve ter no máximo 150 caracteres'
      ),

    nome_fantasia: optionalString(150),

    cnpj: cnpjSchema,

    telefone: optionalString(20),

    email: z
      .string()
      .trim()
      .email('Email inválido')
      .max(
        150,
        'Email deve ter no máximo 150 caracteres'
      )
      .optional()
      .nullable(),

    endereco: optionalString(255),

    cidade: optionalString(100),

    estado: z
      .string()
      .trim()
      .length(
        2,
        'Estado deve ter exatamente 2 caracteres'
      )
      .transform((value) =>
        value.toUpperCase()
      )
      .optional()
      .nullable(),

    cep: optionalString(10),

    ativo: z
      .boolean()
      .default(true),
  })
  .strict()

export const updateEmpresaSchema =
  createEmpresaSchema
    .partial()
    .refine(
      (data) =>
        Object.keys(data).length > 0,
      {
        message:
          'Informe ao menos um campo para atualização',
      }
    )

export type CreateEmpresaInput =
  z.infer<
    typeof createEmpresaSchema
  >

export type UpdateEmpresaInput =
  z.infer<
    typeof updateEmpresaSchema
  >