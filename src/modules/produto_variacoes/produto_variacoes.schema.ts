import { z } from 'zod'

export const PRODUTO_VARIACAO_STATUS = ['ATIVO', 'INATIVO'] as const
const idSchema = z.number({ error: 'O ID deve ser um número' })
  .int('O ID deve ser um número inteiro').positive('O ID deve ser maior que zero')

export const createProdutoVariacaoSchema = z.object({
  id_empresa: idSchema,
  id_produto: idSchema,
  id_cor: idSchema.nullable().optional(),
  id_tamanho: idSchema.nullable().optional(),
  status: z.enum(PRODUTO_VARIACAO_STATUS).default('ATIVO'),
}).strict()

export const updateProdutoVariacaoSchema = z.object({
  id_empresa: idSchema.optional(),
  id_produto: idSchema.optional(),
  id_cor: idSchema.nullable().optional(),
  id_tamanho: idSchema.nullable().optional(),
  status: z.enum(PRODUTO_VARIACAO_STATUS).optional(),
}).strict().refine((data) => Object.keys(data).length > 0, {
  message: 'Informe pelo menos um campo para atualização',
})

export const produtoVariacaoIdSchema = z.object({
  id: z.coerce.number().int('O ID deve ser um número inteiro').positive('O ID deve ser maior que zero'),
})

export const listProdutoVariacoesSchema = z.object({
  page: z.coerce.number().int('A página deve ser um número inteiro').min(1).default(1),
  limit: z.coerce.number().int('O limite deve ser um número inteiro').min(1).max(100).default(20),
  id_empresa: z.coerce.number().int().positive().optional(),
  id_produto: z.coerce.number().int().positive().optional(),
  id_cor: z.coerce.number().int().positive().optional(),
  id_tamanho: z.coerce.number().int().positive().optional(),
  status: z.enum(PRODUTO_VARIACAO_STATUS).optional(),
}).strict()

export type CreateProdutoVariacaoInput = z.infer<typeof createProdutoVariacaoSchema>
export type UpdateProdutoVariacaoInput = z.infer<typeof updateProdutoVariacaoSchema>
export type ListProdutoVariacoesInput = z.infer<typeof listProdutoVariacoesSchema>
