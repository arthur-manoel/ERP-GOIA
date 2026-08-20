import { z } from 'zod'

export const produtoStatusSchema =
  z.enum([
    'ATIVO',
    'INATIVO',
  ])

const idSchema = (
  campo: string
) =>
  z
    .number({
      error:
        `${campo} deve ser um número`,
    })
    .int(
      `${campo} deve ser um número inteiro`
    )
    .positive(
      `${campo} deve ser maior que zero`
    )

const nomeSchema = z
  .string()
  .trim()
  .min(
    2,
    'O nome deve possuir pelo menos 2 caracteres'
  )
  .max(
    150,
    'O nome deve possuir no máximo 150 caracteres'
  )

const codigoSchema = z
  .string()
  .trim()
  .min(
    1,
    'O código é obrigatório'
  )
  .max(
    100,
    'O código deve possuir no máximo 100 caracteres'
  )

const descricaoSchema = z
  .string()
  .trim()
  .max(
    255,
    'A descrição deve possuir no máximo 255 caracteres'
  )
  .nullable()

const unidadeSchema = z
  .string()
  .trim()
  .min(
    1,
    'A unidade é obrigatória'
  )
  .max(
    20,
    'A unidade deve possuir no máximo 20 caracteres'
  )

const booleanSchema = (
  campo: string
) =>
  z.boolean({
    error:
      `${campo} deve ser um valor booleano`,
  })

const booleanQuerySchema = z
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

export const createProdutoSchema =
  z
    .object({
      id_tipo_produto:
        idSchema(
          'id_tipo_produto'
        ),

      id_categoria:
        idSchema(
          'id_categoria'
        ),

      id_modelo:
        idSchema(
          'id_modelo'
        ),

      nome: nomeSchema,

      codigo: codigoSchema,

      descricao:
        descricaoSchema.optional(),

      unidade:
        unidadeSchema,

      controla_estoque:
        booleanSchema(
          'controla_estoque'
        ),

      permite_venda:
        booleanSchema(
          'permite_venda'
        ),

      permite_compra:
        booleanSchema(
          'permite_compra'
        ),

      permite_producao:
        booleanSchema(
          'permite_producao'
        ),

      status:
        produtoStatusSchema
          .optional()
          .default('ATIVO'),
    })
    .strict()

export const updateProdutoSchema =
  z
    .object({
      id_tipo_produto:
        idSchema(
          'id_tipo_produto'
        ).optional(),

      id_categoria:
        idSchema(
          'id_categoria'
        ).optional(),

      id_modelo:
        idSchema(
          'id_modelo'
        ).optional(),

      nome:
        nomeSchema.optional(),

      codigo:
        codigoSchema.optional(),

      descricao:
        descricaoSchema.optional(),

      unidade:
        unidadeSchema.optional(),

      controla_estoque:
        booleanSchema(
          'controla_estoque'
        ).optional(),

      permite_venda:
        booleanSchema(
          'permite_venda'
        ).optional(),

      permite_compra:
        booleanSchema(
          'permite_compra'
        ).optional(),

      permite_producao:
        booleanSchema(
          'permite_producao'
        ).optional(),

      status:
        produtoStatusSchema.optional(),
    })
    .strict()
    .refine(
      (data) =>
        Object.keys(data).length >
        0,
      {
        message:
          'Informe pelo menos um campo para atualização',
      }
    )

export const listProdutosSchema =
  z.object({
    page: z.coerce
      .number()
      .int(
        'A página deve ser um número inteiro'
      )
      .min(
        1,
        'A página deve ser maior ou igual a 1'
      )
      .default(1),

    limit: z.coerce
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

    q: z
      .string()
      .trim()
      .max(
        150,
        'A busca deve possuir no máximo 150 caracteres'
      )
      .optional()
      .transform(
        (value) =>
          value || undefined
      ),

    id_tipo_produto:
      z.coerce
        .number()
        .int()
        .positive()
        .optional(),

    id_categoria:
      z.coerce
        .number()
        .int()
        .positive()
        .optional(),

    id_modelo:
      z.coerce
        .number()
        .int()
        .positive()
        .optional(),

    status:
      produtoStatusSchema
        .optional(),

    include_inativos:
      booleanQuerySchema
        .optional()
        .default(false),
  })

export const produtoIdSchema =
  z.object({
    id: z.coerce
      .number()
      .int(
        'O id deve ser um número inteiro'
      )
      .positive(
        'O id deve ser maior que zero'
      ),
  })

export type CreateProdutoInput =
  z.infer<
    typeof createProdutoSchema
  >

export type UpdateProdutoInput =
  z.infer<
    typeof updateProdutoSchema
  >

export type ListProdutosInput =
  z.infer<
    typeof listProdutosSchema
  >

export type ProdutoIdInput =
  z.infer<
    typeof produtoIdSchema
  >