import db from '../../config/database.js'

export async function findUserByEmail(email) {
  const [rows] = await db.execute(
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

export async function findUserById(id) {
  const [rows] = await db.execute(
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
}) {
  await db.execute(
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
}) {
  await db.execute(
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
}) {
  const connection =
    await db.getConnection()

  try {
    await connection.beginTransaction()

    const [tokenRows] =
      await connection.execute(
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
      const error = new Error(
        'Refresh token inválido ou expirado'
      )

      error.statusCode = 401

      throw error
    }

    const [userRows] =
      await connection.execute(
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
      const error = new Error(
        'Usuário não encontrado'
      )

      error.statusCode = 401

      throw error
    }

    if (!user.is_active) {
      const error = new Error(
        'Usuário desativado'
      )

      error.statusCode = 403

      throw error
    }

    await connection.execute(
      `
        UPDATE refresh_tokens
        SET revoked_at = NOW()
        WHERE id = ?
          AND revoked_at IS NULL
      `,
      [storedToken.id]
    )

    await connection.execute(
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
  tokenHash
) {
  await db.execute(
    `
      UPDATE refresh_tokens
      SET revoked_at = NOW()
      WHERE token_hash = ?
        AND revoked_at IS NULL
    `,
    [tokenHash]
  )
}