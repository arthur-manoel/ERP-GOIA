import {
  ResultSetHeader,
  RowDataPacket,
} from 'mysql2'

import db from '../../config/database.js'

export interface UserRow
  extends RowDataPacket {
  id: string
  name: string
  email: string
  password_hash: string
  role: string
  is_active: boolean
}

export interface UserPublic
  extends RowDataPacket {
  id: string
  name: string
  email: string
  role: string
  is_active: boolean
}

interface RefreshTokenRow
  extends RowDataPacket {
  id: string
  user_id: string
}

interface CreateUserData {
  id: string
  name: string
  email: string
  passwordHash: string
}

interface CreateRefreshTokenData {
  id: string
  userId: string
  tokenHash: string
  expiresAt: Date
}

interface RotateRefreshTokenData {
  oldTokenHash: string

  newToken: {
    id: string
    tokenHash: string
    expiresAt: Date
  }
}

export async function findUserByEmail(
  email: string
): Promise<UserRow | null> {
  const [rows] =
    await db.execute<UserRow[]>(
      `
        SELECT
          id,
          name,
          email,
          password_hash,
          role,
          is_active
        FROM users
        WHERE email = ?
        LIMIT 1
      `,
      [email]
    )

  return rows[0] ?? null
}

export async function findUserById(
  id: string
): Promise<UserPublic | null> {
  const [rows] =
    await db.execute<UserPublic[]>(
      `
        SELECT
          id,
          name,
          email,
          role,
          is_active
        FROM users
        WHERE id = ?
        LIMIT 1
      `,
      [id]
    )

  return rows[0] ?? null
}

export async function createUser({
  id,
  name,
  email,
  passwordHash,
}: CreateUserData): Promise<void> {
  await db.execute<ResultSetHeader>(
    `
      INSERT INTO users (
        id,
        name,
        email,
        password_hash,
        role
      )
      VALUES (?, ?, ?, ?, 'FUNCIONARIO')
    `,
    [
      id,
      name,
      email,
      passwordHash,
    ]
  )
}

export async function createRefreshToken({
  id,
  userId,
  tokenHash,
  expiresAt,
}: CreateRefreshTokenData): Promise<void> {
  await db.execute<ResultSetHeader>(
    `
      INSERT INTO refresh_tokens (
        id,
        user_id,
        token_hash,
        expires_at
      )
      VALUES (?, ?, ?, ?)
    `,
    [
      id,
      userId,
      tokenHash,
      expiresAt,
    ]
  )
}

export async function rotateRefreshToken({
  oldTokenHash,
  newToken,
}: RotateRefreshTokenData): Promise<UserPublic> {
  const connection =
    await db.getConnection()

  try {
    await connection.beginTransaction()

    const [tokenRows] =
      await connection.execute<
        RefreshTokenRow[]
      >(
        `
          SELECT
            id,
            user_id
          FROM refresh_tokens
          WHERE token_hash = ?
            AND revoked_at IS NULL
            AND expires_at > NOW()
          LIMIT 1
          FOR UPDATE
        `,
        [oldTokenHash]
      )

    const storedToken =
      tokenRows[0]

    if (!storedToken) {
      const error =
        new Error(
          'Refresh token inválido ou expirado'
        )

      error.name =
        'RefreshTokenError'

      throw error
    }

    const [userRows] =
      await connection.execute<
        UserPublic[]
      >(
        `
          SELECT
            id,
            name,
            email,
            role,
            is_active
          FROM users
          WHERE id = ?
          LIMIT 1
          FOR UPDATE
        `,
        [storedToken.user_id]
      )

    const user =
      userRows[0]

    if (!user) {
      const error =
        new Error(
          'Usuário não encontrado'
        )

      error.name =
        'RefreshTokenError'

      throw error
    }

    if (!user.is_active) {
      const error =
        new Error(
          'Usuário desativado'
        )

      error.name =
        'InactiveUserError'

      throw error
    }

    await connection.execute<ResultSetHeader>(
      `
        UPDATE refresh_tokens
        SET revoked_at = NOW()
        WHERE id = ?
          AND revoked_at IS NULL
      `,
      [storedToken.id]
    )

    await connection.execute<ResultSetHeader>(
      `
        INSERT INTO refresh_tokens (
          id,
          user_id,
          token_hash,
          expires_at
        )
        VALUES (?, ?, ?, ?)
      `,
      [
        newToken.id,
        user.id,
        newToken.tokenHash,
        newToken.expiresAt,
      ]
    )

    await connection.commit()

    return user
  } catch (error) {
    await connection.rollback()

    throw error
  } finally {
    connection.release()
  }
}

export async function revokeRefreshToken(
  tokenHash: string
): Promise<void> {
  await db.execute<ResultSetHeader>(
    `
      UPDATE refresh_tokens
      SET revoked_at = NOW()
      WHERE token_hash = ?
        AND revoked_at IS NULL
    `,
    [tokenHash]
  )
}