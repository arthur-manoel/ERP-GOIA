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

const precoSchema = z
  .number({
    error:
      'O preço deve ser um número',
  })
  .finite(
    'O preço deve ser válido'
  )
  .positive(
    'O preço deve ser maior que zero'
  )
  .max(
    99999999.99,
    'O preço excede o limite permitido'
  )

const inteiroNaoNegativoSchema =
  z
    .number({
      error:
        'O valor deve ser um número',
    })
    .int(
      'O valor deve ser um número inteiro'
    )
    .min(
      0,
      'O valor não pode ser negativo'
    )

const statusSchema =
  z.enum([
    'ATIVO',
    'INATIVO',
    'SUSPENSO',
  ])

export const createProdutoFornecedorSchema =
  z
    .object({
      id_empresa:
        idSchema,

      id_produto:
        idSchema,

      codigo_produto_fornecedor:
        z
          .string({
            error:
              'O código do produto no fornecedor deve ser uma string',
          })
          .trim()
          .min(
            1,
            'O código do produto no fornecedor é obrigatório'
          )
          .max(
            100,
            'O código do produto no fornecedor deve possuir no máximo 100 caracteres'
          ),

      preco_ultima_compra:
        precoSchema,

      prazo_entrega_dias:
        inteiroNaoNegativoSchema,

      quantidade_minima:
        inteiroNaoNegativoSchema,

      fornecedor_principal:
        z
          .boolean({
            error:
              'fornecedor_principal deve ser um valor booleano',
          })
          .optional()
          .default(false),

      status:
        statusSchema,
    })
    .strict()

export const updateProdutoFornecedorSchema =
  z
    .object({
      id_empresa:
        idSchema.optional(),

      id_produto:
        idSchema.optional(),

      codigo_produto_fornecedor:
        z
          .string({
            error:
              'O código do produto no fornecedor deve ser uma string',
          })
          .trim()
          .min(
            1,
            'O código do produto no fornecedor não pode ser vazio'
          )
          .max(
            100,
            'O código do produto no fornecedor deve possuir no máximo 100 caracteres'
          )
          .optional(),

      preco_ultima_compra:
        precoSchema.optional(),

      prazo_entrega_dias:
        inteiroNaoNegativoSchema
          .optional(),

      quantidade_minima:
        inteiroNaoNegativoSchema
          .optional(),

      fornecedor_principal:
        z
          .boolean({
            error:
              'fornecedor_principal deve ser um valor booleano',
          })
          .optional(),

      status:
        statusSchema.optional(),
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

export const produtoFornecedorIdSchema =
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

export const listProdutoFornecedorSchema =
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
        .int()
        .positive()
        .optional(),

    id_produto:
      z.coerce
        .number()
        .int()
        .positive()
        .optional(),

    include_inativos:
      z
        .union([
          z.boolean(),

          z.enum([
            'true',
            'false',
          ]),
        ])
        .transform(
          (value) =>
            value === true ||
            value === 'true'
        )
        .optional()
        .default(false),
  })

export type CreateProdutoFornecedorInput =
  z.infer<
    typeof createProdutoFornecedorSchema
  >

export type UpdateProdutoFornecedorInput =
  z.infer<
    typeof updateProdutoFornecedorSchema
  >

export type ListProdutoFornecedorInput =
  z.infer<
    typeof listProdutoFornecedorSchema
  >