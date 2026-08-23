import { z } from 'zod'

export const PEDIDO_COMPRA_STATUS = ['RASCUNHO', 'EMITIDO', 'PARCIAL', 'RECEBIDO', 'CANCELADO'] as const

const idSchema = z.number({ error: 'O ID deve ser um número' })
  .int('O ID deve ser um número inteiro')
  .positive('O ID deve ser maior que zero')

const datePattern = /^\d{4}-\d{2}-\d{2}$/

function isValidDate(value: string): boolean {
  if (!datePattern.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
}

const dateSchema = z.string({ error: 'A data deve ser um texto' })
  .refine(isValidDate, 'A data informada é inválida. Utilize o formato YYYY-MM-DD')

const numeroSchema = z.string({ error: 'O número deve ser um texto' })
  .trim().min(1, 'O número é obrigatório').max(50, 'O número deve ter no máximo 50 caracteres')

const observacaoSchema = z.string({ error: 'A observação deve ser um texto' })
  .trim().max(255, 'A observação deve ter no máximo 255 caracteres').nullable()

export const createPedidoCompraSchema = z.object({
  id_empresa: idSchema,
  id_fornecedor: idSchema,
  id_requisicao_compra: idSchema.nullable().optional(),
  id_ordem_producao: idSchema.nullable().optional(),
  id_usuario: idSchema,
  numero: numeroSchema,
  data_pedido: dateSchema,
  status: z.enum(PEDIDO_COMPRA_STATUS).default('RASCUNHO'),
  observacao: observacaoSchema.optional(),
}).strict()

export const updatePedidoCompraSchema = z.object({
  id_empresa: idSchema.optional(),
  id_fornecedor: idSchema.optional(),
  id_requisicao_compra: idSchema.nullable().optional(),
  id_ordem_producao: idSchema.nullable().optional(),
  id_usuario: idSchema.optional(),
  data_pedido: dateSchema.optional(),
  status: z.enum(PEDIDO_COMPRA_STATUS).optional(),
  observacao: observacaoSchema.optional(),
}).strict().refine((data) => Object.keys(data).length > 0, {
  message: 'Informe pelo menos um campo para atualização',
})

export const pedidoCompraIdSchema = z.object({
  id: z.coerce.number().int('O ID deve ser um número inteiro').positive('O ID deve ser maior que zero'),
})

export const listPedidoCompraSchema = z.object({
  page: z.coerce.number().int('A página deve ser um número inteiro').min(1).default(1),
  limit: z.coerce.number().int('O limite deve ser um número inteiro').min(1).max(100).default(20),
  id_empresa: z.coerce.number().int().positive().optional(),
  id_fornecedor: z.coerce.number().int().positive().optional(),
  status: z.enum(PEDIDO_COMPRA_STATUS).optional(),
  data_pedido_de: dateSchema.optional(),
  data_pedido_ate: dateSchema.optional(),
}).strict().refine(
  (data) => !data.data_pedido_de || !data.data_pedido_ate || data.data_pedido_de <= data.data_pedido_ate,
  { message: 'A data inicial não pode ser posterior à data final', path: ['data_pedido_de'] }
)

export type CreatePedidoCompraInput = z.infer<typeof createPedidoCompraSchema>
export type UpdatePedidoCompraInput = z.infer<typeof updatePedidoCompraSchema>
export type ListPedidoCompraInput = z.infer<typeof listPedidoCompraSchema>
