import argon2 from 'argon2'
import jwt from 'jsonwebtoken'

import {
  createHash,
  randomBytes,
  randomUUID,
} from 'node:crypto'

import { env } from '../../config/env.js'

import {
  createRefreshToken,
  createUser,
  findUserByEmail,
  revokeRefreshToken,
  rotateRefreshToken,
  UserPublic,
} from './auth.model.js'

import type {
  RegisterInput,
  LoginInput,
} from './auth.schema.js'

const ACCESS_TOKEN_EXPIRES =
  '15m'

interface AccessTokenPayload {
  role: string
}

interface AuthUser {
  id: string
  name: string
  email: string
  role: string
}

function createHttpError(
  message: string,
  statusCode: number
): Error & {
  statusCode: number
} {
  const error =
    new Error(message) as Error & {
      statusCode: number
    }

  error.statusCode =
    statusCode

  return error
}

function generateAccessToken(
  user: UserPublic
): string {
  const payload:
    AccessTokenPayload = {
    role: user.role,
  }

  return jwt.sign(
    payload,
    env.JWT_ACCESS_SECRET,
    {
      subject: user.id,
      expiresIn:
        ACCESS_TOKEN_EXPIRES,
    }
  )
}

function generateRefreshToken(): string {
  return randomBytes(64)
    .toString('hex')
}

function hashToken(
  token: string
): string {
  return createHash('sha256')
    .update(token)
    .digest('hex')
}

function getRefreshExpiration(): Date {
  const expiresAt =
    new Date()

  expiresAt.setDate(
    expiresAt.getDate() +
      env.REFRESH_TOKEN_DAYS
  )

  return expiresAt
}

export async function register(
  data: RegisterInput
): Promise<AuthUser> {
  const existingUser =
    await findUserByEmail(
      data.email
    )

  if (existingUser) {
    throw createHttpError(
      'Este email já está cadastrado',
      409
    )
  }

  const passwordHash =
    await argon2.hash(
      data.password
    )

  const user = {
    id: randomUUID(),
    name: data.name,
    email: data.email,
    passwordHash,
  }

  await createUser(user)

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: 'FUNCIONARIO',
  }
}

export async function login(
  data: LoginInput
): Promise<{
  user: AuthUser
  accessToken: string
  refreshToken: string
}> {
  const user =
    await findUserByEmail(
      data.email
    )

  if (!user) {
    throw createHttpError(
      'Email ou senha inválidos',
      401
    )
  }

  if (!user.is_active) {
    throw createHttpError(
      'Usuário desativado',
      403
    )
  }

  const passwordMatches =
    await argon2.verify(
      user.password_hash,
      data.password
    )

  if (!passwordMatches) {
    throw createHttpError(
      'Email ou senha inválidos',
      401
    )
  }

  const accessToken =
    generateAccessToken(user)

  const refreshToken =
    generateRefreshToken()

  await createRefreshToken({
    id: randomUUID(),

    userId: user.id,

    tokenHash:
      hashToken(
        refreshToken
      ),

    expiresAt:
      getRefreshExpiration(),
  })

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },

    accessToken,

    refreshToken,
  }
}

export async function refresh(
  refreshToken: string | undefined
): Promise<{
  accessToken: string
  refreshToken: string
}> {
  if (!refreshToken) {
    throw createHttpError(
      'Refresh token não informado',
      401
    )
  }

  const newRefreshToken =
    generateRefreshToken()

  const user =
    await rotateRefreshToken({
      oldTokenHash:
        hashToken(
          refreshToken
        ),

      newToken: {
        id: randomUUID(),

        tokenHash:
          hashToken(
            newRefreshToken
          ),

        expiresAt:
          getRefreshExpiration(),
      },
    })

  const accessToken =
    generateAccessToken(user)

  return {
    accessToken,
    refreshToken:
      newRefreshToken,
  }
}

export async function logout(
  refreshToken:
    | string
    | undefined
): Promise<void> {
  if (!refreshToken) {
    return
  }

  await revokeRefreshToken(
    hashToken(refreshToken)
  )
}