import { z } from 'zod'

const idEmpresaSchema = z
  .number()
  .int(
    'id_empresa deve ser um número inteiro'
  )
  .positive(
    'id_empresa deve ser maior que zero'
  )

const idFornecedorSchema = z
  .number()
  .int(
    'id_fornecedor deve ser um número inteiro'
  )
  .positive(
    'id_fornecedor deve ser maior que zero'
  )

const prazoPagamentoSchema = z
  .number()
  .int(
    'prazo_pagamento deve ser um número inteiro'
  )
  .nonnegative(
    'prazo_pagamento não pode ser negativo'
  )

const prazoEntregaSchema = z
  .number()
  .int(
    'prazo_entrega deve ser um número inteiro'
  )
  .nonnegative(
    'prazo_entrega não pode ser negativo'
  )

export const createEmpresaFornecedorSchema =
  z
    .object({
      id_empresa:
        idEmpresaSchema,

      id_fornecedor:
        idFornecedorSchema,

      prazo_pagamento:
        prazoPagamentoSchema
          .nullable()
          .optional(),

      prazo_entrega:
        prazoEntregaSchema
          .nullable()
          .optional(),

      observacao:
        z
          .string()
          .trim()
          .max(
            255,
            'observacao deve possuir no máximo 255 caracteres'
          )
          .nullable()
          .optional(),

      status:
        z
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

export const updateEmpresaFornecedorSchema =
  z
    .object({
      id_empresa:
        idEmpresaSchema
          .optional(),

      id_fornecedor:
        idFornecedorSchema
          .optional(),

      prazo_pagamento:
        prazoPagamentoSchema
          .nullable()
          .optional(),

      prazo_entrega:
        prazoEntregaSchema
          .nullable()
          .optional(),

      observacao:
        z
          .string()
          .trim()
          .max(
            255,
            'observacao deve possuir no máximo 255 caracteres'
          )
          .nullable()
          .optional(),

      status:
        z
          .enum([
            'ATIVO',
            'INATIVO',
          ])
          .optional(),
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

export const empresaFornecedorIdSchema =
  z
    .object({
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
    .strict()

export const listEmpresaFornecedorSchema =
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

    id_fornecedor:
      z.coerce
        .number()
        .int(
          'id_fornecedor deve ser um número inteiro'
        )
        .positive(
          'id_fornecedor deve ser maior que zero'
        )
        .optional(),

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

export type CreateEmpresaFornecedorInput =
  z.infer<
    typeof createEmpresaFornecedorSchema
  >

export type UpdateEmpresaFornecedorInput =
  z.infer<
    typeof updateEmpresaFornecedorSchema
  >

export type ListEmpresaFornecedorInput =
  z.infer<
    typeof listEmpresaFornecedorSchema
  >