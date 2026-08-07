import argon2 from 'argon2'
import jwt from 'jsonwebtoken'

import {
  createHash,
  randomBytes,
  randomUUID,
} from 'node:crypto'

import {
  createRefreshToken,
  createUser,
  findUserByEmail,
  revokeRefreshToken,
  rotateRefreshToken,
} from './auth.model.js'

const ACCESS_TOKEN_EXPIRES =
  '15m'

function createHttpError(
  message,
  statusCode
) {
  const error =
    new Error(message)

  error.statusCode =
    statusCode

  return error
}

function generateAccessToken(user) {
  return jwt.sign(
    {
      role: user.role,
    },
    process.env.JWT_ACCESS_SECRET,
    {
      subject: user.id,
      expiresIn:
        ACCESS_TOKEN_EXPIRES,
    }
  )
}

function generateRefreshToken() {
  return randomBytes(64)
    .toString('hex')
}

function hashToken(token) {
  return createHash('sha256')
    .update(token)
    .digest('hex')
}

function getRefreshExpiration() {
  const days = Number(
    process.env.REFRESH_TOKEN_DAYS
      ?? 7
  )

  const expiresAt =
    new Date()

  expiresAt.setDate(
    expiresAt.getDate() +
      days
  )

  return expiresAt
}

export async function register(data) {
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
    id:
      randomUUID(),

    name:
      data.name,

    email:
      data.email,

    passwordHash,
  }

  await createUser(user)

  return {
    id:
      user.id,

    name:
      user.name,

    email:
      user.email,

    role:
      'FUNCIONARIO',
  }
}

export async function login({
  email,
  password,
}) {
  const user =
    await findUserByEmail(
      email
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
      password
    )

  if (!passwordMatches) {
    throw createHttpError(
      'Email ou senha inválidos',
      401
    )
  }

  const accessToken =
    generateAccessToken(
      user
    )

  const refreshToken =
    generateRefreshToken()

  await createRefreshToken({
    id:
      randomUUID(),

    userId:
      user.id,

    tokenHash:
      hashToken(
        refreshToken
      ),

    expiresAt:
      getRefreshExpiration(),
  })

  return {
    user: {
      id:
        user.id,

      name:
        user.name,

      email:
        user.email,

      role:
        user.role,
    },

    accessToken,

    refreshToken,
  }
}

export async function refresh(
  refreshToken
) {
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
        id:
          randomUUID(),

        tokenHash:
          hashToken(
            newRefreshToken
          ),

        expiresAt:
          getRefreshExpiration(),
      },
    })

  const accessToken =
    generateAccessToken(
      user
    )

  return {
    accessToken,

    refreshToken:
      newRefreshToken,
  }
}

export async function logout(
  refreshToken
) {
  if (!refreshToken) {
    return
  }

  await revokeRefreshToken(
    hashToken(
      refreshToken
    )
  )
}