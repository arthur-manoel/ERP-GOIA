import {
  z,
} from 'zod'

export const usuarioNivelAcessoSchema =
  z.enum([
    'ADMIN',
    'USUARIO',
  ])

export const usuarioStatusSchema =
  z.enum([
    'ATIVO',
    'INATIVO',
  ])

const senhaSchema =
  z
    .string()
    .min(
      8,
      'A senha deve possuir pelo menos 8 caracteres'
    )
    .regex(
      /[A-Z]/,
      'A senha deve possuir pelo menos uma letra maiúscula'
    )
    .regex(
      /[a-z]/,
      'A senha deve possuir pelo menos uma letra minúscula'
    )
    .regex(
      /[0-9]/,
      'A senha deve possuir pelo menos um número'
    )

const emailSchema =
  z
    .string()
    .trim()
    .email(
      'Email inválido'
    )
    .transform((value) =>
      value.toLowerCase()
    )

export const createUsuarioSchema =
  z
    .object({
      nome: z
        .string()
        .trim()
        .min(
          1,
          'Nome é obrigatório'
        ),

      email:
        emailSchema,

      senha:
        senhaSchema,

      nivel_acesso:
        usuarioNivelAcessoSchema,

      status:
        usuarioStatusSchema,
    })
    .strict()

export const updateUsuarioSchema =
  z
    .object({
      nome: z
        .string()
        .trim()
        .min(
          1,
          'Nome não pode ser vazio'
        )
        .optional(),

      email:
        emailSchema
          .optional(),

      senha:
        senhaSchema
          .optional(),

      nivel_acesso:
        usuarioNivelAcessoSchema
          .optional(),

      status:
        usuarioStatusSchema
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

export const usuarioIdParamSchema =
  z
    .object({
      id: z.coerce
        .number()
        .int()
        .positive(),
    })
    .strict()

export type UsuarioNivelAcesso =
  z.infer<
    typeof usuarioNivelAcessoSchema
  >

export type UsuarioStatus =
  z.infer<
    typeof usuarioStatusSchema
  >

export type CreateUsuarioInput =
  z.infer<
    typeof createUsuarioSchema
  >

export type UpdateUsuarioInput =
  z.infer<
    typeof updateUsuarioSchema
  >