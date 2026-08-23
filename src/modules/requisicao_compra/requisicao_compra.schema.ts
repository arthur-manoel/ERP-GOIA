import { z } from 'zod'

export const REQUISICAO_COMPRA_STATUS = [
  'RASCUNHO',
  'ABERTA',
  'APROVADA',
  'ATENDIDA',
  'CANCELADA'
] as const

const idSchema = z.number({ error: 'O ID deve ser um número' })
  .int('O ID deve ser um número inteiro')
  .positive('O ID deve ser maior que zero')

const datePattern = /^\d{4}-\d{2}-\d{2}$/

function isValidDate(value: string): boolean {
  if (!datePattern.test(value)) return false

  const [year, month, day] = value.split('-').map(Number)

  const date = new Date(Date.UTC(year, month - 1, day))

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  )
}

const dateSchema = z.string({
  error: 'A data deve ser um texto'
})
  .refine(
    isValidDate,
    'A data informada é inválida. Utilize o formato YYYY-MM-DD'
  )

const observacaoSchema = z.string({
  error: 'A observação deve ser um texto'
})
  .trim()
  .max(
    255,
    'A observação deve ter no máximo 255 caracteres'
  )
  .nullable()

export const createRequisicaoCompraSchema = z.object({
  id_empresa: idSchema,

  id_local_estoque: idSchema,

  id_setor_solicitante: idSchema,

  // NOVO: usuário que está solicitando a requisição
  id_usuario_solicitante: idSchema,

  numero: z.string({
    error: 'O número deve ser um texto'
  })
    .trim()
    .min(1, 'O número é obrigatório')
    .max(
      50,
      'O número deve ter no máximo 50 caracteres'
    ),

  status: z.enum(REQUISICAO_COMPRA_STATUS)
    .default('RASCUNHO'),

  data_solicitacao: dateSchema,

  observacao: observacaoSchema.optional(),
}).strict()

export const updateRequisicaoCompraSchema = z.object({
  id_empresa: idSchema.optional(),

  id_local_estoque: idSchema.optional(),

  id_setor_solicitante: idSchema.optional(),

  // NOVO
  id_usuario_solicitante: idSchema.optional(),

  status: z.enum(REQUISICAO_COMPRA_STATUS).optional(),

  data_solicitacao: dateSchema.optional(),

  observacao: observacaoSchema.optional(),
})
  .strict()
  .refine(
    (data) => Object.keys(data).length > 0,
    {
      message: 'Informe pelo menos um campo para atualização',
    }
  )

export const requisicaoCompraIdSchema = z.object({
  id: z.coerce.number()
    .int('O ID deve ser um número inteiro')
    .positive('O ID deve ser maior que zero'),
})

export const listRequisicaoCompraSchema = z.object({
  page: z.coerce.number()
    .int('A página deve ser um número inteiro')
    .min(1)
    .default(1),

  limit: z.coerce.number()
    .int('O limite deve ser um número inteiro')
    .min(1)
    .max(100)
    .default(20),

  id_empresa: z.coerce.number()
    .int()
    .positive()
    .optional(),

  id_setor_solicitante: z.coerce.number()
    .int()
    .positive()
    .optional(),

  status: z.enum(REQUISICAO_COMPRA_STATUS)
    .optional(),

  data_solicitacao_de: dateSchema.optional(),

  data_solicitacao_ate: dateSchema.optional(),
})
  .strict()
  .refine(
    (data) =>
      !data.data_solicitacao_de ||
      !data.data_solicitacao_ate ||
      data.data_solicitacao_de <= data.data_solicitacao_ate,
    {
      message: 'A data inicial não pode ser posterior à data final',
      path: ['data_solicitacao_de'],
    }
  )

export type CreateRequisicaoCompraInput =
  z.infer<typeof createRequisicaoCompraSchema>

export type UpdateRequisicaoCompraInput =
  z.infer<typeof updateRequisicaoCompraSchema>

export type ListRequisicaoCompraInput =
  z.infer<typeof listRequisicaoCompraSchema>
