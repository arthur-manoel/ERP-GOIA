import {
  ResultSetHeader,
  RowDataPacket,
} from 'mysql2'

import db from '../../config/database.js'

export interface UserRow
  extends RowDataPacket {
  id: number
  nome: string
  email: string
  senha: string
  nivel_acesso: 'ADMIN' | 'USUARIO'
  status: 'ATIVO' | 'INATIVO'
}

export interface UserPublic
  extends RowDataPacket {
  id: number
  nome: string
  email: string
  nivel_acesso: 'ADMIN' | 'USUARIO'
  status: 'ATIVO' | 'INATIVO'
}

interface RefreshTokenRow
  extends RowDataPacket {
  id: number
  id_usuario: number
}

interface CreateUserData {
  nome: string
  email: string
  senha: string
}

interface CreateRefreshTokenData {
  userId: number
  token: string
  expiresAt: Date
  ip?: string | null
  userAgent?: string | null
}

interface RotateRefreshTokenData {
  oldToken: string

  newToken: {
    token: string
    expiresAt: Date
    ip?: string | null
    userAgent?: string | null
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
          nome,
          email,
          senha,
          nivel_acesso,
          status
        FROM usuarios
        WHERE email = ?
        LIMIT 1
      `,
      [email]
    )

  return rows[0] ?? null
}

export async function findUserById(
  id: number
): Promise<UserPublic | null> {
  const [rows] =
    await db.execute<UserPublic[]>(
      `
        SELECT
          id,
          nome,
          email,
          nivel_acesso,
          status
        FROM usuarios
        WHERE id = ?
        LIMIT 1
      `,
      [id]
    )

  return rows[0] ?? null
}

export async function createUser({
  nome,
  email,
  senha,
}: CreateUserData): Promise<number> {
  const [result] =
    await db.execute<ResultSetHeader>(
      `
        INSERT INTO usuarios (
          nome,
          email,
          senha,
          nivel_acesso,
          status
        )
        VALUES (
          ?,
          ?,
          ?,
          'USUARIO',
          'ATIVO'
        )
      `,
      [
        nome,
        email,
        senha,
      ]
    )

  return result.insertId
}

export async function createRefreshToken({
  userId,
  token,
  expiresAt,
  ip = null,
  userAgent = null,
}: CreateRefreshTokenData): Promise<void> {
  await db.execute<ResultSetHeader>(
    `
      INSERT INTO refresh_tokens (
        id_usuario,
        token,
        data_criacao,
        data_expiracao,
        ip,
        user_agent
      )
      VALUES (
        ?,
        ?,
        NOW(),
        ?,
        ?,
        ?
      )
    `,
    [
      userId,
      token,
      expiresAt,
      ip,
      userAgent,
    ]
  )
}

export async function rotateRefreshToken({
  oldToken,
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
            id_usuario
          FROM refresh_tokens
          WHERE token = ?
            AND revogado = 0
            AND data_expiracao > NOW()
          LIMIT 1
          FOR UPDATE
        `,
        [oldToken]
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
            nome,
            email,
            nivel_acesso,
            status
          FROM usuarios
          WHERE id = ?
          LIMIT 1
          FOR UPDATE
        `,
        [storedToken.id_usuario]
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

    if (user.status !== 'ATIVO') {
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
        SET
          revogado = 1,
          data_revogacao = NOW()
        WHERE id = ?
          AND revogado = 0
      `,
      [storedToken.id]
    )

    await connection.execute<ResultSetHeader>(
      `
        INSERT INTO refresh_tokens (
          id_usuario,
          token,
          data_criacao,
          data_expiracao,
          ip,
          user_agent
        )
        VALUES (
          ?,
          ?,
          NOW(),
          ?,
          ?,
          ?
        )
      `,
      [
        user.id,
        newToken.token,
        newToken.expiresAt,
        newToken.ip ?? null,
        newToken.userAgent ?? null,
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
  token: string
): Promise<void> {
  await db.execute<ResultSetHeader>(
    `
      UPDATE refresh_tokens
      SET
        revogado = 1,
        data_revogacao = NOW()
      WHERE token = ?
        AND revogado = 0
    `,
    [token]
  )
}