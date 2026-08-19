import {
  ResultSetHeader,
  RowDataPacket,
} from 'mysql2'

import db from '../../config/database.js'

export interface CorRow
  extends RowDataPacket {
  id: number
  nome: string
  codigo_hex: string
  ativo: boolean
  data_cadastro: Date
}

interface CountRow
  extends RowDataPacket {
  total: number
}

export interface CreateCorData {
  nome: string
  codigo_hex: string
  ativo?: boolean
}

export interface UpdateCorData {
  nome?: string
  codigo_hex?: string
  ativo?: boolean
}

export interface CorFilters {
  q?: string
  includeInativos?: boolean
}

export interface Pagination {
  page: number
  limit: number
}

export async function create(
  data: CreateCorData
): Promise<CorRow> {
  const [result] =
    await db.execute<ResultSetHeader>(
      `
        INSERT INTO cores (
          nome,
          codigo_hex,
          ativo
        )
        VALUES (?, ?, ?)
      `,
      [
        data.nome,
        data.codigo_hex,
        data.ativo ?? true,
      ]
    )

  const cor =
    await findById(
      result.insertId
    )

  if (!cor) {
    throw new Error(
      'Erro ao recuperar cor após cadastro'
    )
  }

  return cor
}

export async function findAll(
  filters: CorFilters,
  pagination: Pagination
): Promise<{
  rows: CorRow[]
  count: number
}> {
  const conditions:
    string[] = []

  const params:
    Array<
      string | number | boolean
    > = []

  if (
    !filters.includeInativos
  ) {
    conditions.push(
      'ativo = ?'
    )

    params.push(true)
  }

  if (filters.q) {
    conditions.push(
      'LOWER(nome) LIKE LOWER(?)'
    )

    params.push(
      `%${filters.q}%`
    )
  }

  const whereClause =
    conditions.length > 0
      ? `WHERE ${conditions.join(
          ' AND '
        )}`
      : ''

  const offset =
    (pagination.page - 1) *
    pagination.limit

  const [
    [rows],
    [countRows],
  ] = await Promise.all([
    db.execute<CorRow[]>(
      `
        SELECT
          id,
          nome,
          codigo_hex,
          ativo,
          data_cadastro
        FROM cores
        ${whereClause}
        ORDER BY nome ASC
        LIMIT ?
        OFFSET ?
      `,
      [
        ...params,
        pagination.limit,
        offset,
      ]
    ),

    db.execute<CountRow[]>(
      `
        SELECT
          COUNT(*) AS total
        FROM cores
        ${whereClause}
      `,
      params
    ),
  ])

  return {
    rows,
    count:
      countRows[0]?.total ??
      0,
  }
}

export async function findById(
  id: number
): Promise<CorRow | null> {
  const [rows] =
    await db.execute<
      CorRow[]
    >(
      `
        SELECT
          id,
          nome,
          codigo_hex,
          ativo,
          data_cadastro
        FROM cores
        WHERE id = ?
        LIMIT 1
      `,
      [id]
    )

  return rows[0] ?? null
}

export async function findByNome(
  nome: string
): Promise<CorRow | null> {
  const [rows] =
    await db.execute<
      CorRow[]
    >(
      `
        SELECT
          id,
          nome,
          codigo_hex,
          ativo,
          data_cadastro
        FROM cores
        WHERE LOWER(nome) =
          LOWER(?)
        LIMIT 1
      `,
      [nome]
    )

  return rows[0] ?? null
}

export async function update(
  id: number,
  data: UpdateCorData
): Promise<CorRow | null> {
  const fields:
    string[] = []

  const values:
    Array<
      string | boolean | number
    > = []

  if (
    data.nome !== undefined
  ) {
    fields.push(
      'nome = ?'
    )

    values.push(
      data.nome
    )
  }

  if (
    data.codigo_hex !==
    undefined
  ) {
    fields.push(
      'codigo_hex = ?'
    )

    values.push(
      data.codigo_hex
    )
  }

  if (
    data.ativo !==
    undefined
  ) {
    fields.push(
      'ativo = ?'
    )

    values.push(
      data.ativo
    )
  }

  if (
    fields.length === 0
  ) {
    return findById(id)
  }

  values.push(id)

  const [result] =
    await db.execute<ResultSetHeader>(
      `
        UPDATE cores
        SET ${fields.join(', ')}
        WHERE id = ?
      `,
      values
    )

  if (
    result.affectedRows === 0
  ) {
    return null
  }

  return findById(id)
}

export async function softDelete(
  id: number
): Promise<boolean> {
  const [result] =
    await db.execute<ResultSetHeader>(
      `
        UPDATE cores
        SET ativo = FALSE
        WHERE id = ?
      `,
      [id]
    )

  return (
    result.affectedRows > 0
  )
}