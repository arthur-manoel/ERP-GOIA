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

const statusSchema = z.enum([
  'RASCUNHO',
  'CONFIRMADA',
  'SEPARACAO',
  'FATURADA',
  'ENVIADA',
  'ENTREGUE',
  'CANCELADA'
])

const dataSchema = z
  .string({
    error:
      'A data deve ser uma string',
  })
  .trim()
  .min(
    1,
    'A data é obrigatória'
  )
  .max(
    10,
    'A data deve estar no formato YYYY-MM-DD'
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

export const createVendaSchema =
  z
    .object({
      id_empresa:
        idSchema,

      id_cliente:
        idSchema,

      id_usuario:
        idSchema,

      numero:
        z
          .string({
            error:
              'O número da venda deve ser uma string',
          })
          .trim()
          .min(
            1,
            'O número da venda é obrigatório'
          )
          .max(
            50,
            'O número da venda deve possuir no máximo 50 caracteres'
          ),

      status:
        statusSchema
          .optional()
          .default(
            'RASCUNHO'
          ),

      data_venda:
        dataSchema,

      valor_total:
        valorTotalSchema,
    })
    .strict()

export const updateVendaSchema =
  z
    .object({
      id_empresa:
        idSchema.optional(),

      id_cliente:
        idSchema.optional(),

      id_usuario:
        idSchema.optional(),

      status:
        statusSchema.optional(),

      data_venda:
        dataSchema.optional(),

      valor_total:
        valorTotalSchema.optional(),
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

export const vendaIdSchema =
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

export const listVendaSchema =
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

    id_cliente:
      z.coerce
        .number()
        .int(
          'id_cliente deve ser um número inteiro'
        )
        .positive(
          'id_cliente deve ser maior que zero'
        )
        .optional(),

    status:
      statusSchema.optional(),

    data_venda_de:
      dataSchema.optional(),

    data_venda_ate:
      dataSchema.optional(),
  })

export type CreateVendaInput =
  z.infer<
    typeof createVendaSchema
  >

export type UpdateVendaInput =
  z.infer<
    typeof updateVendaSchema
  >

export type ListVendaInput =
  z.infer<
    typeof listVendaSchema
  >