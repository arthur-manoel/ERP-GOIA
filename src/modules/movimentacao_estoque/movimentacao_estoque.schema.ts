import { z } from 'zod'

const idSchema = z
  .number({
    error:
      'O ID deve ser um número',
  })
  .int(
    'O ID deve ser um número inteiro'
  )
  .positive(
    'O ID deve ser maior que zero'
  )

const quantidadeSchema = z
  .number({
    error:
      'A quantidade deve ser um número',
  })
  .int(
    'A quantidade deve ser um número inteiro'
  )
  .min(
    0,
    'A quantidade não pode ser negativa'
  )

const valorTotalSchema = z
  .number({
    error:
      'O valor total deve ser um número',
  })
  .finite(
    'O valor total deve ser válido'
  )
  .min(
    0,
    'O valor total não pode ser negativo'
  )
  .max(
    99999999.99,
    'O valor total excede o limite permitido'
  )

const tipoSchema = z.enum([
  'ENTRADA',
  'SAIDA',
  'AJUSTE',
])

const origemTipoSchema = z.enum([
  'VENDA',
  'COMPRA',
  'PRODUCAO',
])

export const createMovimentacaoEstoqueSchema =
  z
    .object({
      id_empresa:
        idSchema,

      id_local_estoque:
        idSchema,

      id_setor:
        idSchema,

      id_produto:
        idSchema,

      tipo:
        tipoSchema,

      quantidade:
        quantidadeSchema,

      valor_total:
        valorTotalSchema,

      origem_tipo:
        origemTipoSchema,

      origem_id:
        idSchema,

      id_usuario:
        idSchema,

      observacao:
        z
          .string({
            error:
              'A observação deve ser uma string',
          })
          .trim()
          .max(
            255,
            'A observação deve possuir no máximo 255 caracteres'
          )
          .optional()
          .nullable(),
    })
    .strict()

export const updateMovimentacaoEstoqueSchema =
  z
    .object({
      id_empresa:
        idSchema.optional(),

      id_local_estoque:
        idSchema.optional(),

      id_setor:
        idSchema.optional(),

      id_produto:
        idSchema.optional(),

      tipo:
        tipoSchema.optional(),

      quantidade:
        quantidadeSchema
          .optional(),

      valor_total:
        valorTotalSchema
          .optional(),

      origem_tipo:
        origemTipoSchema
          .optional(),

      origem_id:
        idSchema.optional(),

      id_usuario:
        idSchema.optional(),

      observacao:
        z
          .string({
            error:
              'A observação deve ser uma string',
          })
          .trim()
          .max(
            255,
            'A observação deve possuir no máximo 255 caracteres'
          )
          .optional()
          .nullable(),
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

export const movimentacaoEstoqueIdSchema =
  z.object({
    id:
      z.coerce
        .number()
        .int(
          'O ID deve ser um número inteiro'
        )
        .positive(
          'O ID deve ser maior que zero'
        ),
  })

export const listMovimentacaoEstoqueSchema =
  z.object({
    page:
      z.coerce
        .number()
        .int(
          'A página deve ser um número inteiro'
        )
        .min(
          1,
          'A página deve ser maior ou igual a 1'
        )
        .default(1),

    limit:
      z.coerce
        .number()
        .int(
          'O limite deve ser um número inteiro'
        )
        .min(
          1,
          'O limite deve ser maior ou igual a 1'
        )
        .max(
          100,
          'O limite máximo é 100'
        )
        .default(20),

    id_empresa:
      z.coerce
        .number()
        .int(
          'id_empresa deve ser um número inteiro'
        )
        .positive(
          'id_empresa deve ser maior que zero'
        )
        .optional(),

    id_setor:
      z.coerce
        .number()
        .int(
          'id_setor deve ser um número inteiro'
        )
        .positive(
          'id_setor deve ser maior que zero'
        )
        .optional(),

    id_produto:
      z.coerce
        .number()
        .int(
          'id_produto deve ser um número inteiro'
        )
        .positive(
          'id_produto deve ser maior que zero'
        )
        .optional(),

    tipo:
      tipoSchema.optional(),

    origem_tipo:
      origemTipoSchema.optional(),
  })

export type CreateMovimentacaoEstoqueInput =
  z.infer<
    typeof createMovimentacaoEstoqueSchema
  >

export type UpdateMovimentacaoEstoqueInput =
  z.infer<
    typeof updateMovimentacaoEstoqueSchema
  >

export type ListMovimentacaoEstoqueInput =
  z.infer<
    typeof listMovimentacaoEstoqueSchema
  >