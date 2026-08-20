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

const valorSchema = z
  .number({
    error:
      'O valor deve ser um número',
  })
  .finite(
    'O valor deve ser válido'
  )
  .min(
    0,
    'O valor não pode ser negativo'
  )

const estoqueSchema = z
  .number({
    error:
      'O estoque deve ser um número',
  })
  .int(
    'O estoque deve ser um número inteiro'
  )
  .min(
    0,
    'O estoque não pode ser negativo'
  )

export const
  createProdutoEmpresaSchema =
    z
      .object({
        id_empresa:
          idSchema,

        id_produto:
          idSchema,

        codigo_interno: z
          .string({
            error:
              'O código interno deve ser uma string',
          })
          .trim()
          .min(
            1,
            'O código interno é obrigatório'
          )
          .max(
            100,
            'O código interno deve possuir no máximo 100 caracteres'
          ),

        preco_venda:
          valorSchema,

        custo_atual:
          valorSchema,

        valor_estoque_atual:
          valorSchema,

        estoque_minimo:
          estoqueSchema,

        estoque_maximo:
          estoqueSchema,

        status: z
          .enum([
            'ATIVO',
            'INATIVO',
          ])
          .optional()
          .default(
            'ATIVO'
          ),
      })
      .strict()
      .refine(
        (data) =>
          data.estoque_maximo >=
          data.estoque_minimo,
        {
          message:
            'O estoque máximo não pode ser menor que o estoque mínimo',

          path: [
            'estoque_maximo',
          ],
        }
      )

export const
  updateProdutoEmpresaSchema =
    z
      .object({
        id_empresa:
          idSchema.optional(),

        id_produto:
          idSchema.optional(),

        codigo_interno: z
          .string({
            error:
              'O código interno deve ser uma string',
          })
          .trim()
          .min(
            1,
            'O código interno não pode ser vazio'
          )
          .max(
            100,
            'O código interno deve possuir no máximo 100 caracteres'
          )
          .optional(),

        preco_venda:
          valorSchema.optional(),

        custo_atual:
          valorSchema.optional(),

        valor_estoque_atual:
          valorSchema.optional(),

        estoque_minimo:
          estoqueSchema.optional(),

        estoque_maximo:
          estoqueSchema.optional(),

        status: z
          .enum([
            'ATIVO',
            'INATIVO',
          ])
          .optional(),
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

export const
  produtoEmpresaIdSchema =
    z.object({
      id: z.coerce
        .number()
        .int(
          'O ID deve ser um número inteiro'
        )
        .positive(
          'O ID deve ser maior que zero'
        ),
    })

export const
  listProdutoEmpresaSchema =
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

      codigo_interno:
        z.string()
          .trim()
          .optional(),

      status:
        z.enum([
          'ATIVO',
          'INATIVO',
        ])
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

export type CreateProdutoEmpresaInput =
  z.infer<
    typeof createProdutoEmpresaSchema
  >

export type UpdateProdutoEmpresaInput =
  z.infer<
    typeof updateProdutoEmpresaSchema
  >

export type ListProdutoEmpresaInput =
  z.infer<
    typeof listProdutoEmpresaSchema
  >