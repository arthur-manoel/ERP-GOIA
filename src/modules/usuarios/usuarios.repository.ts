import type {
  ResultSetHeader,
  RowDataPacket,
} from 'mysql2'

import db from '../../config/database.js'

import type {
  UsuarioNivelAcesso,
  UsuarioStatus,
} from './usuarios.schema.js'

export interface UsuarioRow
  extends RowDataPacket {
  id: number
  nome: string
  email: string
  senha: string
  nivel_acesso: UsuarioNivelAcesso
  status: UsuarioStatus
  data_cadastro: Date | string
}

export interface UsuarioPublicRow
  extends RowDataPacket {
  id: number
  nome: string
  email: string
  nivel_acesso: UsuarioNivelAcesso
  status: UsuarioStatus
  data_cadastro: Date | string
}

interface CreateUsuarioData {
  nome: string
  email: string
  senhaHash: string
  nivelAcesso: UsuarioNivelAcesso
  status: UsuarioStatus
}

interface UpdateUsuarioData {
  id: number
  nome: string
  email: string
  senhaHash: string
  nivelAcesso: UsuarioNivelAcesso
  status: UsuarioStatus
}

export async function createUsuario(
  data: CreateUsuarioData
): Promise<number> {
  const [result] =
    await db.execute<ResultSetHeader>(
      `
        INSERT INTO usuarios (
          nome,
          email,
          senha,
          nivel_acesso,
          status,
          data_cadastro
        )
        VALUES (?, ?, ?, ?, ?, NOW())
      `,
      [
        data.nome,
        data.email,
        data.senhaHash,
        data.nivelAcesso,
        data.status,
      ]
    )

  return result.insertId
}

export async function findAllUsuarios(): Promise<
  UsuarioPublicRow[]
> {
  const [rows] =
    await db.execute<
      UsuarioPublicRow[]
    >(
      `
        SELECT
          id,
          nome,
          email,
          nivel_acesso,
          status,
          data_cadastro
        FROM usuarios
      `
    )

  return rows
}

export async function findUsuarioById(
  id: number
): Promise<UsuarioRow | null> {
  const [rows] =
    await db.execute<UsuarioRow[]>(
      `
        SELECT
          id,
          nome,
          email,
          senha,
          nivel_acesso,
          status,
          data_cadastro
        FROM usuarios
        WHERE id = ?
        LIMIT 1
      `,
      [
        id,
      ]
    )

  return rows[0] ?? null
}

export async function findUsuarioByEmail(
  email: string
): Promise<UsuarioRow | null> {
  const [rows] =
    await db.execute<UsuarioRow[]>(
      `
        SELECT
          id,
          nome,
          email,
          senha,
          nivel_acesso,
          status,
          data_cadastro
        FROM usuarios
        WHERE email = ?
        LIMIT 1
      `,
      [
        email,
      ]
    )

  return rows[0] ?? null
}

export async function updateUsuario(
  data: UpdateUsuarioData
): Promise<void> {
  await db.execute<ResultSetHeader>(
    `
      UPDATE usuarios
      SET
        nome = ?,
        email = ?,
        senha = ?,
        nivel_acesso = ?,
        status = ?
      WHERE id = ?
    `,
    [
      data.nome,
      data.email,
      data.senhaHash,
      data.nivelAcesso,
      data.status,
      data.id,
    ]
  )
}

export async function deleteUsuario(
  id: number
): Promise<void> {
  await db.execute<ResultSetHeader>(
    `
      UPDATE usuarios
      SET status = 'INATIVO'
      WHERE id = ?
    `,
    [
      id,
    ]
  )
}