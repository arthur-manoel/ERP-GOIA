import { z } from 'zod'

const decimal153 = z
  .number({ error: 'Quantidade necessária deve ser numérica' })
  .finite('Quantidade necessária deve ser finita')
  .positive('Quantidade necessária deve ser maior que zero')
  .max(999999999999.999, 'Quantidade necessária excede DECIMAL(15,3)')
  .transform((value) => Math.round((value + Number.EPSILON) * 1000) / 1000)

export const ordemEmpresaParamsSchema = z
  .object({
    ordemId: z.coerce.number().int().positive(),
  })
  .strict()

export const consumoParamsSchema = z
  .object({
    ordemId: z.coerce.number().int().positive(),
    consumoId: z.coerce.number().int().positive(),
  })
  .strict()

export const empresaQuerySchema = z
  .object({
    empresaId: z.coerce.number().int().positive(),
  })
  .strict()

export const recalcularConsumoSchema = z
  .object({
    gerarPedidoCompra: z.boolean().optional().default(false),
  })
  .strict()

export const atualizarConsumoSchema = z
  .object({
    quantidadeNecessaria: decimal153,
    gerarPedidoCompra: z.boolean().optional().default(false),
  })
  .strict()

export const atualizarConsumosSchema = z
  .object({
    consumos: z
      .array(
        z
          .object({
            id: z.number().int().positive(),
            quantidadeNecessaria: decimal153,
          })
          .strict(),
      )
      .nonempty('Informe ao menos um consumo'),
    gerarPedidoCompra: z.boolean().optional().default(false),
  })
  .strict()
  .superRefine((data, context) => {
    const ids = new Set<number>()
    data.consumos.forEach((consumo, index) => {
      if (ids.has(consumo.id)) {
        context.addIssue({
          code: 'custom',
          path: ['consumos', index, 'id'],
          message: 'Não informe IDs de consumo repetidos',
        })
      }
      ids.add(consumo.id)
    })
  })

export type AtualizarConsumosInput = z.infer<typeof atualizarConsumosSchema>
