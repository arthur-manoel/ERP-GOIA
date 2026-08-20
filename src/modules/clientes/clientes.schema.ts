import {
  z,
} from 'zod'

function isValidCpf(
  cpf: string
): boolean {
  if (!/^\d{11}$/.test(cpf)) {
    return false
  }

  if (
    /^(\d)\1{10}$/.test(cpf)
  ) {
    return false
  }

  let sum = 0

  for (
    let index = 0;
    index < 9;
    index++
  ) {
    sum +=
      Number(cpf[index]) *
      (10 - index)
  }

  let firstDigit =
    (sum * 10) % 11

  if (firstDigit === 10) {
    firstDigit = 0
  }

  if (
    firstDigit !==
    Number(cpf[9])
  ) {
    return false
  }

  sum = 0

  for (
    let index = 0;
    index < 10;
    index++
  ) {
    sum +=
      Number(cpf[index]) *
      (11 - index)
  }

  let secondDigit =
    (sum * 10) % 11

  if (secondDigit === 10) {
    secondDigit = 0
  }

  return (
    secondDigit ===
    Number(cpf[10])
  )
}

const cpfSchema =
  z
    .string()
    .trim()
    .min(
      1,
      'CPF é obrigatório'
    )
    .transform((value) =>
      value.replace(/\D/g, '')
    )
    .refine(
      (value) =>
        value.length === 11,
      {
        message:
          'CPF deve possuir 11 dígitos',
      }
    )
    .refine(
      isValidCpf,
      {
        message:
          'CPF inválido',
      }
    )

export const clienteStatusSchema =
  z.enum([
    'ATIVO',
    'INATIVO',
  ])

export const createClienteSchema =
  z
    .object({
      id_empresa: z
        .number()
        .int()
        .positive()
        .nullable(),

      nome_razao_social: z
        .string()
        .trim()
        .min(
          1,
          'Nome é obrigatório'
        ),

      cpf_cnpj:
        cpfSchema,

      email: z
        .string()
        .trim()
        .email(
          'Email inválido'
        )
        .nullable()
        .optional(),

      telefone: z
        .string()
        .trim()
        .min(
          1,
          'Telefone não pode ser vazio'
        )
        .nullable()
        .optional(),

      endereco: z
        .string()
        .trim()
        .min(
          1,
          'Endereço não pode ser vazio'
        )
        .nullable()
        .optional(),

      numero: z
        .string()
        .trim()
        .min(
          1,
          'Número não pode ser vazio'
        )
        .nullable()
        .optional(),

      complemento: z
        .string()
        .trim()
        .nullable()
        .optional(),

      bairro: z
        .string()
        .trim()
        .min(
          1,
          'Bairro não pode ser vazio'
        )
        .nullable()
        .optional(),

      cidade: z
        .string()
        .trim()
        .min(
          1,
          'Cidade não pode ser vazia'
        )
        .nullable()
        .optional(),

      estado: z
        .string()
        .trim()
        .length(
          2,
          'Estado deve possuir 2 caracteres'
        )
        .transform((value) =>
          value.toUpperCase()
        )
        .nullable()
        .optional(),

      cep: z
        .string()
        .trim()
        .transform((value) =>
          value.replace(/\D/g, '')
        )
        .refine(
          (value) =>
            value.length === 8,
          {
            message:
              'CEP deve possuir 8 dígitos',
          }
        )
        .nullable()
        .optional(),

      status:
        clienteStatusSchema,
    })
    .strict()

export const updateClienteSchema =
  z
    .object({
      id_empresa: z
        .number()
        .int()
        .positive()
        .nullable()
        .optional(),

      nome_razao_social: z
        .string()
        .trim()
        .min(
          1,
          'Nome não pode ser vazio'
        )
        .optional(),

      cpf_cnpj:
        cpfSchema
          .optional(),

      email: z
        .string()
        .trim()
        .email(
          'Email inválido'
        )
        .nullable()
        .optional(),

      telefone: z
        .string()
        .trim()
        .min(
          1,
          'Telefone não pode ser vazio'
        )
        .nullable()
        .optional(),

      endereco: z
        .string()
        .trim()
        .min(
          1,
          'Endereço não pode ser vazio'
        )
        .nullable()
        .optional(),

      numero: z
        .string()
        .trim()
        .min(
          1,
          'Número não pode ser vazio'
        )
        .nullable()
        .optional(),

      complemento: z
        .string()
        .trim()
        .nullable()
        .optional(),

      bairro: z
        .string()
        .trim()
        .min(
          1,
          'Bairro não pode ser vazio'
        )
        .nullable()
        .optional(),

      cidade: z
        .string()
        .trim()
        .min(
          1,
          'Cidade não pode ser vazia'
        )
        .nullable()
        .optional(),

      estado: z
        .string()
        .trim()
        .length(
          2,
          'Estado deve possuir 2 caracteres'
        )
        .transform((value) =>
          value.toUpperCase()
        )
        .nullable()
        .optional(),

      cep: z
        .string()
        .trim()
        .transform((value) =>
          value.replace(/\D/g, '')
        )
        .refine(
          (value) =>
            value.length === 8,
          {
            message:
              'CEP deve possuir 8 dígitos',
          }
        )
        .nullable()
        .optional(),

      status:
        clienteStatusSchema
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

export const clienteIdParamSchema =
  z
    .object({
      id: z.coerce
        .number()
        .int()
        .positive(),
    })
    .strict()

export type ClienteStatus =
  z.infer<
    typeof clienteStatusSchema
  >

export type CreateClienteInput =
  z.infer<
    typeof createClienteSchema
  >

export type UpdateClienteInput =
  z.infer<
    typeof updateClienteSchema
  >