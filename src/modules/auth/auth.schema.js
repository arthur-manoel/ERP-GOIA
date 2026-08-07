import { z } from 'zod'

export const registerSchema =
  z.object({
    name: z
      .string()
      .trim()
      .min(
        3,
        'O nome precisa ter pelo menos 3 caracteres'
      )
      .max(
        100,
        'O nome pode ter no máximo 100 caracteres'
      ),

    email: z
      .string()
      .trim()
      .email(
        'Email inválido'
      )
      .max(
        255,
        'Email muito longo'
      )
      .transform(
        (email) =>
          email.toLowerCase()
      ),

    password: z
      .string()
      .min(
        8,
        'A senha precisa ter pelo menos 8 caracteres'
      )
      .max(
        100,
        'A senha pode ter no máximo 100 caracteres'
      ),
  })

export const loginSchema =
  z.object({
    email: z
      .string()
      .trim()
      .email(
        'Email inválido'
      )
      .transform(
        (email) =>
          email.toLowerCase()
      ),

    password: z
      .string()
      .min(
        1,
        'A senha é obrigatória'
      ),
  })