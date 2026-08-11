import {
  ResultSetHeader,
  RowDataPacket,
} from 'mysql2'

import db from '../../config/database.js'

export interface EmpresaRow
  extends RowDataPacket {
  id: number
  razao_social: string
  nome_fantasia: string | null
  cnpj: string
  telefone: string | null
  email: string | null
  endereco: string | null
  cidade: string | null
  estado: string | null
  cep: string | null
  ativo: number
  data_cadastro: Date
}

export interface CreateEmpresaData {
  razao_social: string
  nome_fantasia?: string | null
  cnpj: string
  telefone?: string | null
  email?: string | null
  endereco?: string | null
  cidade?: string | null
  estado?: string | null
  cep?: string | null
  ativo: boolean
}

export interface UpdateEmpresaData {
  razao_social?: string
  nome_fantasia?: string | null
  cnpj?: string
  telefone?: string | null
  email?: string | null
  endereco?: string | null
  cidade?: string | null
  estado?: string | null
  cep?: string | null
  ativo?: boolean
}

export async function findAllActiveEmpresas():
Promise<EmpresaRow[]> {
  const [rows] =
    await db.execute<EmpresaRow[]>(
      `
        SELECT
          id,
          razao_social,
          nome_fantasia,
          cnpj,
          telefone,
          email,
          endereco,
          cidade,
          estado,
          cep,
          ativo,
          data_cadastro
        FROM empresas
        WHERE ativo = 1
        ORDER BY razao_social ASC
      `
    )

  return rows
}

export async function findEmpresaById(
  id: number
): Promise<EmpresaRow | null> {
  const [rows] =
    await db.execute<EmpresaRow[]>(
      `
        SELECT
          id,
          razao_social,
          nome_fantasia,
          cnpj,
          telefone,
          email,
          endereco,
          cidade,
          estado,
          cep,
          ativo,
          data_cadastro
        FROM empresas
        WHERE id = ?
        LIMIT 1
      `,
      [id]
    )

  return rows[0] ?? null
}

export async function findEmpresaByCnpj(
  cnpj: string
): Promise<EmpresaRow | null> {
  const [rows] =
    await db.execute<EmpresaRow[]>(
      `
        SELECT
          id,
          razao_social,
          nome_fantasia,
          cnpj,
          telefone,
          email,
          endereco,
          cidade,
          estado,
          cep,
          ativo,
          data_cadastro
        FROM empresas
        WHERE
          REPLACE(
            REPLACE(
              REPLACE(cnpj, '.', ''),
              '/',
              ''
            ),
            '-',
            ''
          ) = ?
        LIMIT 1
      `,
      [cnpj]
    )

  return rows[0] ?? null
}

export async function createEmpresa(
  data: CreateEmpresaData
): Promise<number> {
  const [result] =
    await db.execute<ResultSetHeader>(
      `
        INSERT INTO empresas (
          razao_social,
          nome_fantasia,
          cnpj,
          telefone,
          email,
          endereco,
          cidade,
          estado,
          cep,
          ativo
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        data.razao_social,
        data.nome_fantasia ?? null,
        data.cnpj,
        data.telefone ?? null,
        data.email ?? null,
        data.endereco ?? null,
        data.cidade ?? null,
        data.estado ?? null,
        data.cep ?? null,
        data.ativo ? 1 : 0,
      ]
    )

  return result.insertId
}

export async function updateEmpresa(
  id: number,
  data: UpdateEmpresaData
): Promise<boolean> {
  const fields: string[] = []

  const values: Array<
    string | number | null
  > = []

  if (
    data.razao_social !== undefined
  ) {
    fields.push('razao_social = ?')
    values.push(data.razao_social)
  }

  if (
    data.nome_fantasia !== undefined
  ) {
    fields.push('nome_fantasia = ?')
    values.push(data.nome_fantasia)
  }

  if (data.cnpj !== undefined) {
    fields.push('cnpj = ?')
    values.push(data.cnpj)
  }

  if (
    data.telefone !== undefined
  ) {
    fields.push('telefone = ?')
    values.push(data.telefone)
  }

  if (data.email !== undefined) {
    fields.push('email = ?')
    values.push(data.email)
  }

  if (
    data.endereco !== undefined
  ) {
    fields.push('endereco = ?')
    values.push(data.endereco)
  }

  if (
    data.cidade !== undefined
  ) {
    fields.push('cidade = ?')
    values.push(data.cidade)
  }

  if (
    data.estado !== undefined
  ) {
    fields.push('estado = ?')
    values.push(data.estado)
  }

  if (data.cep !== undefined) {
    fields.push('cep = ?')
    values.push(data.cep)
  }

  if (data.ativo !== undefined) {
    fields.push('ativo = ?')

    values.push(
      data.ativo ? 1 : 0
    )
  }

  if (fields.length === 0) {
    return false
  }

  values.push(id)

  const [result] =
    await db.execute<ResultSetHeader>(
      `
        UPDATE empresas
        SET ${fields.join(', ')}
        WHERE id = ?
      `,
      values
    )

  return result.affectedRows > 0
}

export async function deactivateEmpresa(
  id: number
): Promise<boolean> {
  const [result] =
    await db.execute<ResultSetHeader>(
      `
        UPDATE empresas
        SET ativo = 0
        WHERE id = ?
          AND ativo = 1
      `,
      [id]
    )

  return result.affectedRows > 0
}