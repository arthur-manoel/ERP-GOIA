import {
  z,
} from 'zod'

const nomeSchema =
  z
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

const descricaoSchema =
  z
    .string()
    .trim()
    .max(
      255,
      'A descrição deve possuir no máximo 255 caracteres'
    )
    .nullable()

export const createTipoProdutoSchema =
  z
    .object({
      nome:
        nomeSchema,

      descricao:
        descricaoSchema
          .optional(),

      ativo:
        z
          .boolean()
          .optional()
          .default(true),
    })
    .strict()

export const updateTipoProdutoSchema =
  z
    .object({
      nome:
        nomeSchema
          .optional(),

      descricao:
        descricaoSchema
          .optional(),

      ativo:
        z
          .boolean()
          .optional(),


          
    },
    {
    error: (issui) => {
        if (
            issui.code === 'unrecognized_keys'
        ){
            return 'Não é permitido alterar id ou data_cadastro'
        }
            
        return undefined

        },
    }
)
    
    .refine(
      (data) =>
        Object.keys(data)
          .length > 0,
      {
        message:
          'Informe pelo menos um campo para atualização',
      }
    )

export const tipoProdutoIdSchema =
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

export const listTiposProdutosSchema =
  z.object({
    page:
      z.coerce
        .number()
        .int(
          'A página deve ser um número inteiro'
        )
        .positive(
          'A página deve ser maior que zero'
        )
        .default(1),

    limit:
      z.coerce
        .number()
        .int(
          'O limite deve ser um número inteiro'
        )
        .positive(
          'O limite deve ser maior que zero'
        )
        .max(
          100,
          'O limite máximo é 100 registros'
        )
        .default(20),

    q:
      z
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

    include_inativos:
      z
        .enum([
          'true',
          'false',
        ])
        .optional()
        .default('false')
        .transform(
          (value) =>
            value === 'true'
        ),
  })

export type CreateTipoProdutoInput =
  z.infer<
    typeof createTipoProdutoSchema
  >

export type UpdateTipoProdutoInput =
  z.infer<
    typeof updateTipoProdutoSchema
  >

export type ListTiposProdutosInput =
  z.infer<
    typeof listTiposProdutosSchema
  >

export type TipoProdutoIdInput =
  z.infer<
    typeof tipoProdutoIdSchema
  >