import { z } from 'zod'

const idSchema = z.number({ error: 'O ID deve ser um número' })
  .int('O ID deve ser um número inteiro')
  .positive('O ID deve ser maior que zero')

const quantidadeSchema = z.number({ error: 'A quantidade deve ser um número' })
  .int('A quantidade deve ser um número inteiro')
  .min(0, 'A quantidade não pode ser negativa')

const observacaoSchema = z.string({ error: 'A observação deve ser um texto' })
  .trim()
  .max(255, 'A observação deve ter no máximo 255 caracteres')
  .nullable()

export const createItemRequisicaoCompraSchema = z.object({
  id_requisicao_compra: idSchema,
  id_produto: idSchema,
  quantidade: quantidadeSchema,
  observacao: observacaoSchema.optional(),
}).strict()

export const updateItemRequisicaoCompraSchema = z.object({
  id_produto: idSchema.optional(),
  quantidade: quantidadeSchema.optional(),
  observacao: observacaoSchema.optional(),
}).strict().refine((data) => Object.keys(data).length > 0, {
  message: 'Informe pelo menos um campo para atualização',
})

export const itemRequisicaoCompraIdSchema = z.object({
  id: z.coerce.number()
    .int('O ID deve ser um número inteiro')
    .positive('O ID deve ser maior que zero'),
})

export const listItemRequisicaoCompraSchema = z.object({
  page: z.coerce.number().int('A página deve ser um número inteiro')
    .min(1, 'A página deve ser maior ou igual a 1').default(1),
  limit: z.coerce.number().int('O limite deve ser um número inteiro')
    .min(1, 'O limite deve ser maior ou igual a 1')
    .max(100, 'O limite máximo é 100').default(20),
  id_requisicao_compra: z.coerce.number()
    .int('id_requisicao_compra deve ser um número inteiro')
    .positive('id_requisicao_compra deve ser maior que zero').optional(),
  id_produto: z.coerce.number().int('id_produto deve ser um número inteiro')
    .positive('id_produto deve ser maior que zero').optional(),
}).strict()

export type CreateItemRequisicaoCompraInput = z.infer<typeof createItemRequisicaoCompraSchema>
export type UpdateItemRequisicaoCompraInput = z.infer<typeof updateItemRequisicaoCompraSchema>
export type ListItemRequisicaoCompraInput = z.infer<typeof listItemRequisicaoCompraSchema>
