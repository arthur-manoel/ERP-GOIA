import { z } from 'zod'

const idSchema = z.number({ error: 'O ID deve ser um número' })
  .int('O ID deve ser um número inteiro')
  .positive('O ID deve ser maior que zero')

const quantidadeSchema = z.number({ error: 'A quantidade deve ser um número' })
  .int('A quantidade deve ser um número inteiro')
  .min(0, 'A quantidade não pode ser negativa')

const valorUnitarioSchema = z.number({ error: 'O valor unitário deve ser um número' })
  .finite('O valor unitário deve ser finito')
  .min(0, 'O valor unitário não pode ser negativo')

export const createItemVendaSchema = z.object({
  id_venda: idSchema,
  id_produto: idSchema,
  quantidade: quantidadeSchema,
  valor_unitario: valorUnitarioSchema,
}).strict()

export const updateItemVendaSchema = z.object({
  id_produto: idSchema.optional(),
  quantidade: quantidadeSchema.optional(),
  valor_unitario: valorUnitarioSchema.optional(),
}).strict().refine((data) => Object.keys(data).length > 0, {
  message: 'Informe pelo menos um campo para atualização',
})

export const itemVendaIdSchema = z.object({
  id: z.coerce.number()
    .int('O ID deve ser um número inteiro')
    .positive('O ID deve ser maior que zero'),
})

export const listItemVendaSchema = z.object({
  page: z.coerce.number().int('A página deve ser um número inteiro')
    .min(1, 'A página deve ser maior ou igual a 1').default(1),
  limit: z.coerce.number().int('O limite deve ser um número inteiro')
    .min(1, 'O limite deve ser maior ou igual a 1')
    .max(100, 'O limite máximo é 100').default(20),
  id_venda: z.coerce.number().int('id_venda deve ser um número inteiro')
    .positive('id_venda deve ser maior que zero').optional(),
  id_produto: z.coerce.number().int('id_produto deve ser um número inteiro')
    .positive('id_produto deve ser maior que zero').optional(),
}).strict()

export type CreateItemVendaInput = z.infer<typeof createItemVendaSchema>
export type UpdateItemVendaInput = z.infer<typeof updateItemVendaSchema>
export type ListItemVendaInput = z.infer<typeof listItemVendaSchema>
