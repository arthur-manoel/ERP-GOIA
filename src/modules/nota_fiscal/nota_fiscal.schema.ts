import { z } from 'zod'

const idSchema = z
  .number()
  .int('O id deve ser um número inteiro')
  .positive('O id deve ser maior que zero')

const nullableIdSchema = z.union([
  idSchema,
  z.null(),
])

const numeroSchema = z
  .string()
  .trim()
  .min(
    1,
    'O número da nota fiscal é obrigatório'
  )
  .max(
    50,
    'O número deve possuir no máximo 50 caracteres'
  )

const serieSchema = z
  .string()
  .trim()
  .max(
    20,
    'A série deve possuir no máximo 20 caracteres'
  )
  .nullable()

const chaveAcessoSchema = z
  .string()
  .trim()
  .max(
    100,
    'A chave de acesso deve possuir no máximo 100 caracteres'
  )
  .nullable()

const statusSchema = z
  .string()
  .trim()
  .min(
    1,
    'O status é obrigatório'
  )
  .max(
    30,
    'O status deve possuir no máximo 30 caracteres'
  )

const dateSchema = z
  .string()
  .regex(
    /^\d{4}-\d{2}-\d{2}$/,
    'A data deve estar no formato YYYY-MM-DD'
  )

const dateTimeSchema = z
  .string()
  .trim()
  .regex(
    /^\d{4}-\d{2}-\d{2}([ T]\d{2}:\d{2}(:\d{2})?)?$/,
    'A data deve estar no formato YYYY-MM-DD ou YYYY-MM-DD HH:mm:ss'
  )

const valorTotalSchema = z
  .number()
  .finite(
    'O valor total deve ser válido'
  )
  .positive(
    'O valor total deve ser maior que zero'
  )
  .max(
    99999999.99,
    'O valor total excede o limite permitido'
  )

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

export const createNotaFiscalSchema =
  z
    .object({
      id_empresa:
        idSchema,

      id_fornecedor:
        idSchema,

      id_pedido_compra:
        nullableIdSchema
          .optional(),

      id_setor_destino:
        nullableIdSchema
          .optional(),

      numero:
        numeroSchema,

      serie:
        serieSchema
          .optional(),

      chave_acesso:
        chaveAcessoSchema
          .optional(),

      status:
        statusSchema,

      data_emissao:
        dateSchema,

      data_recebimento:
        dateSchema
          .nullable()
          .optional(),

      valor_total:
        valorTotalSchema,

      entrada_processada:
        z
          .boolean()
          .optional()
          .default(false),

      data_processamento:
        dateTimeSchema
          .nullable()
          .optional(),

      observacao:
        z
          .string()
          .trim()
          .max(
            1000,
            'A observação deve possuir no máximo 1000 caracteres'
          )
          .nullable()
          .optional(),
    })
    .strict()

export const updateNotaFiscalSchema =
  z
    .object({
      id_empresa:
        idSchema.optional(),

      id_fornecedor:
        idSchema.optional(),

      id_pedido_compra:
        nullableIdSchema
          .optional(),

      id_setor_destino:
        nullableIdSchema
          .optional(),

      numero:
        numeroSchema.optional(),

      serie:
        serieSchema.optional(),

      chave_acesso:
        chaveAcessoSchema
          .optional(),

      status:
        statusSchema.optional(),

      data_emissao:
        dateSchema.optional(),

      data_recebimento:
        dateSchema
          .nullable()
          .optional(),

      valor_total:
        valorTotalSchema
          .optional(),

      entrada_processada:
        z
          .boolean()
          .optional(),

      data_processamento:
        dateTimeSchema
          .nullable()
          .optional(),

      observacao:
        z
          .string()
          .trim()
          .max(
            1000,
            'A observação deve possuir no máximo 1000 caracteres'
          )
          .nullable()
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

export const listNotasFiscaisSchema =
  z.object({
    page: z.coerce
      .number()
      .int()
      .min(1)
      .default(1),

    limit: z.coerce
      .number()
      .int()
      .min(1)
      .max(100)
      .default(20),

    q: z
      .string()
      .trim()
      .optional()
      .transform(
        (value) =>
          value || undefined
      ),

    id_empresa:
      z.coerce
        .number()
        .int()
        .positive()
        .optional(),

    id_fornecedor:
      z.coerce
        .number()
        .int()
        .positive()
        .optional(),

    id_pedido_compra:
      z.coerce
        .number()
        .int()
        .positive()
        .optional(),

    id_setor_destino:
      z.coerce
        .number()
        .int()
        .positive()
        .optional(),

    status: z
      .string()
      .trim()
      .optional(),

    entrada_processada:
      booleanQuerySchema
        .optional(),
  })

export const notaFiscalIdSchema =
  z.object({
    id: z.coerce
      .number()
      .int()
      .positive(),
  })

export type CreateNotaFiscalInput =
  z.infer<
    typeof createNotaFiscalSchema
  >

export type UpdateNotaFiscalInput =
  z.infer<
    typeof updateNotaFiscalSchema
  >

export type ListNotasFiscaisInput =
  z.infer<
    typeof listNotasFiscaisSchema
  >