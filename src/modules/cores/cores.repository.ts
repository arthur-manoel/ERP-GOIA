import type {
  ResultSetHeader,
  RowDataPacket,
} from 'mysql2'

import db from '../../config/database.js'

export interface CorRow extends RowDataPacket {
  id: number
  id_empresa: number
  nome: string
  codigo_hex: string
  status: 'ATIVO' | 'INATIVO'
}

export interface CreateCorData {
  id_empresa: number
  nome: string
  codigo_hex: string
  status: 'ATIVO' | 'INATIVO'
}

export interface UpdateCorData {
  id_empresa?: number
  nome?: string
  codigo_hex?: string
  status?: 'ATIVO' | 'INATIVO'
}

export interface CorFilters {
  q?: string
  id_empresa?: number
  includeInativos?: boolean
}

export interface Pagination {
  page: number
  limit: number
}

interface CountRow extends RowDataPacket {
  total: number
}

export async function createCor(
  data: CreateCorData
): Promise<CorRow> {
  const [result] =
    await db.execute<ResultSetHeader>(
      `
        INSERT INTO cores (
          id_empresa,
          nome,
          codigo_hex,
          status
        )
        VALUES (?, ?, ?, ?)
      `,
      [
        data.id_empresa,
        data.nome,
        data.codigo_hex,
        data.status,
      ]
    )

  const cor =
    await findCorById(result.insertId)

  if (!cor) {
    throw new Error(
      'Erro ao recuperar cor criada'
    )
  }

  return cor
}

export async function findAllCores(
  filters: CorFilters,
  pagination: Pagination
): Promise<{
  rows: CorRow[]
  count: number
}> {
  const conditions: string[] = []

  const params: Array<
    string | number
  > = []

  /*
   * Filtro de status.
   *
   * Não usamos "status = ?" aqui porque
   * o valor é fixo.
   */
  if (!filters.includeInativos) {
    conditions.push(
      "status = 'ATIVO'"
    )
  }

  if (
    filters.id_empresa !== undefined
  ) {
    conditions.push(
      'id_empresa = ?'
    )

    params.push(
      filters.id_empresa
    )
  }

  if (filters.q) {
    conditions.push(
      `
        (
          LOWER(nome) LIKE ?
          OR LOWER(codigo_hex) LIKE ?
        )
      `
    )

    const search =
      `%${filters.q.toLowerCase()}%`

    params.push(
      search,
      search
    )
  }

  const whereClause =
    conditions.length > 0
      ? `WHERE ${conditions.join(
          ' AND '
        )}`
      : ''

  /*
   * IMPORTANTE:
   *
   * Não usamos LIMIT ? OFFSET ? com
   * mysql2.execute().
   *
   * Transformamos os valores em inteiros
   * antes de colocá-los na SQL.
   */
  const page = Math.max(
    1,
    Math.floor(Number(pagination.page))
  )

  const limit = Math.max(
    1,
    Math.floor(Number(pagination.limit))
  )

  const offset =
    (page - 1) * limit

  const [rows] =
    await db.execute<CorRow[]>(
      `
        SELECT
          id,
          id_empresa,
          nome,
          codigo_hex,
          status
        FROM cores
        ${whereClause}
        ORDER BY nome ASC
        LIMIT ${limit}
        OFFSET ${offset}
      `,
      params
    )

  const [countRows] =
    await db.execute<CountRow[]>(
      `
        SELECT
          COUNT(*) AS total
        FROM cores
        ${whereClause}
      `,
      params
    )

  return {
    rows,
    count:
      countRows[0]?.total ?? 0,
  }
}

export async function findCorById(
  id: number
): Promise<CorRow | null> {
  const [rows] =
    await db.execute<CorRow[]>(
      `
        SELECT
          id,
          id_empresa,
          nome,
          codigo_hex,
          status
        FROM cores
        WHERE id = ?
        LIMIT 1
      `,
      [id]
    )

  return rows[0] ?? null
}

export async function findCorByNome(
  nome: string,
  idEmpresa: number
): Promise<CorRow | null> {
  const [rows] =
    await db.execute<CorRow[]>(
      `
        SELECT
          id,
          id_empresa,
          nome,
          codigo_hex,
          status
        FROM cores
        WHERE LOWER(nome) = LOWER(?)
          AND id_empresa = ?
        LIMIT 1
      `,
      [
        nome,
        idEmpresa,
      ]
    )

  return rows[0] ?? null
}

export async function updateCor(
  id: number,
  data: UpdateCorData
): Promise<CorRow | null> {
  const fields: string[] = []

  const values: Array<
    string | number
  > = []

  if (
    data.id_empresa !== undefined
  ) {
    fields.push(
      'id_empresa = ?'
    )

    values.push(
      data.id_empresa
    )
  }

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
    data.codigo_hex !== undefined
  ) {
    fields.push(
      'codigo_hex = ?'
    )

    values.push(
      data.codigo_hex
    )
  }

  if (
    data.status !== undefined
  ) {
    fields.push(
      'status = ?'
    )

    values.push(
      data.status
    )
  }

  if (fields.length === 0) {
    return findCorById(id)
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

  return findCorById(id)
}

export async function softDeleteCor(
  id: number
): Promise<boolean> {
  const [result] =
    await db.execute<ResultSetHeader>(
      `
        UPDATE cores
        SET status = 'INATIVO'
        WHERE id = ?
      `,
      [id]
    )

  return (
    result.affectedRows > 0
  )
}