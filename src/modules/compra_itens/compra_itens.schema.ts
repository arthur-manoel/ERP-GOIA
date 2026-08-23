import { z } from 'zod'

const idSchema = z.number({ error: 'O ID deve ser um número' })
  .int('O ID deve ser um número inteiro').positive('O ID deve ser maior que zero')
const quantidadeSchema = z.number({ error: 'A quantidade deve ser um número' })
  .int('A quantidade deve ser um número inteiro').min(0, 'A quantidade não pode ser negativa')
const valorUnitarioSchema = z.number({ error: 'O valor unitário deve ser um número' })
  .finite('O valor unitário deve ser finito').min(0, 'O valor unitário não pode ser negativo')

export const createCompraItemSchema = z.object({
  id_compra: idSchema,
  id_produto: idSchema,
  id_cor: idSchema.nullable().optional(),
  id_tamanho: idSchema.nullable().optional(),
  quantidade: quantidadeSchema,
  valor_unitario: valorUnitarioSchema,
}).strict()

export const updateCompraItemSchema = z.object({
  id_produto: idSchema.optional(),
  id_cor: idSchema.nullable().optional(),
  id_tamanho: idSchema.nullable().optional(),
  quantidade: quantidadeSchema.optional(),
  valor_unitario: valorUnitarioSchema.optional(),
}).strict().refine((data) => Object.keys(data).length > 0, {
  message: 'Informe pelo menos um campo para atualização',
})

export const compraItemIdSchema = z.object({
  id: z.coerce.number().int('O ID deve ser um número inteiro').positive('O ID deve ser maior que zero'),
})

export const listCompraItensSchema = z.object({
  page: z.coerce.number().int('A página deve ser um número inteiro').min(1).default(1),
  limit: z.coerce.number().int('O limite deve ser um número inteiro').min(1).max(100).default(20),
  id_compra: z.coerce.number().int().positive().optional(),
  id_produto: z.coerce.number().int().positive().optional(),
  id_cor: z.coerce.number().int().positive().optional(),
  id_tamanho: z.coerce.number().int().positive().optional(),
}).strict()

export type CreateCompraItemInput = z.infer<typeof createCompraItemSchema>
export type UpdateCompraItemInput = z.infer<typeof updateCompraItemSchema>
export type ListCompraItensInput = z.infer<typeof listCompraItensSchema>
