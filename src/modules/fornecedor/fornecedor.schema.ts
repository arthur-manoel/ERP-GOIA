import { z } from 'zod'

const optionalString = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .nullable()

export const fornecedorIdSchema = z.coerce
  .number()
  .int('ID do fornecedor deve ser um número inteiro')
  .positive('ID do fornecedor deve ser maior que zero')

export const createFornecedorSchema = z
  .object({
    razao_social: z
      .string()
      .trim()
      .min(1, 'Razão social é obrigatória')
      .max(150, 'Razão social deve ter no máximo 150 caracteres'),

    nome_fantasia: optionalString(150),

    cnpj: optionalString(18),

    telefone: optionalString(20),

    email: z
      .string()
      .trim()
      .email('Email inválido')
      .max(150, 'Email deve ter no máximo 150 caracteres')
      .optional()
      .nullable(),

    endereco: optionalString(255),

    cidade: optionalString(100),

    estado: z
      .string()
      .trim()
      .length(2, 'Estado deve ter exatamente 2 caracteres')
      .transform((value) => value.toUpperCase())
      .optional()
      .nullable(),

    cep: optionalString(10),

    ativo: z
      .boolean()
      .default(true),
  })
  .strict()

export const updateFornecedorSchema = createFornecedorSchema
  .partial()
  .refine(
    (data) => Object.keys(data).length > 0,
    {
      message: 'Informe ao menos um campo para atualização',
    }
  )

export type CreateFornecedorInput = z.infer<
  typeof createFornecedorSchema
>

export type UpdateFornecedorInput = z.infer<
  typeof updateFornecedorSchema
>
