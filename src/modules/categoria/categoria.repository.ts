import {
  ResultSetHeader,
  RowDataPacket,
} from 'mysql2'

import db from '../../config/database.js'

export interface CategoriaRow extends RowDataPacket {
  id: number
  id_empresa: number
  nome: string
  descricao: string | null
  status: 'ATIVO' | 'INATIVO'
}

interface CountRow extends RowDataPacket {
  total: number
}

export interface CreateCategoriaData {
  id_empresa: number
  nome: string
  descricao?: string | null
  status?: 'ATIVO' | 'INATIVO'
}

export interface UpdateCategoriaData {
  id_empresa?: number
  nome?: string
  descricao?: string | null
  status?: 'ATIVO' | 'INATIVO'
}

export interface CategoriaFilters {
  id_empresa?: number
  q?: string
  include_inativos?: boolean
}

export interface CategoriaPagination {
  page: number
  limit: number
}

export async function createCategoria(
  data: CreateCategoriaData
): Promise<CategoriaRow> {
  const [result] = await db.execute<ResultSetHeader>(
    `
      INSERT INTO categoria (
        id_empresa,
        nome,
        descricao,
        status
      )
      VALUES (?, ?, ?, ?)
    `,
    [
      data.id_empresa,
      data.nome,
      data.descricao ?? null,
      data.status ?? 'ATIVO',
    ]
  )

  const categoria = await findCategoriaById(
    result.insertId
  )

  if (!categoria) {
    throw new Error(
      'Erro ao recuperar categoria criada'
    )
  }

  return categoria
}

export async function findAllCategorias(
  filters: CategoriaFilters,
  pagination: CategoriaPagination
): Promise<{
  rows: CategoriaRow[]
  count: number
}> {
  const conditions: string[] = []
  const params: Array<string | number> = []

  if (!filters.include_inativos) {
    conditions.push(`status = 'ATIVO'`)
  }

  if (filters.id_empresa !== undefined) {
    conditions.push('id_empresa = ?')
    params.push(filters.id_empresa)
  }

  if (filters.q) {
    conditions.push('LOWER(nome) LIKE ?')
    params.push(
      `%${filters.q.toLowerCase()}%`
    )
  }

  const whereClause =
    conditions.length > 0
      ? `WHERE ${conditions.join(' AND ')}`
      : ''

  const offset =
    (pagination.page - 1) *
    pagination.limit

  const [rows] = await db.execute<
    CategoriaRow[]
  >(
    `
      SELECT
        id,
        id_empresa,
        nome,
        descricao,
        status
      FROM categoria
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
  )

  const [countRows] = await db.execute<
    CountRow[]
  >(
    `
      SELECT
        COUNT(*) AS total
      FROM categoria
      ${whereClause}
    `,
    params
  )

  return {
    rows,
    count: countRows[0]?.total ?? 0,
  }
}

export async function findCategoriaById(
  id: number
): Promise<CategoriaRow | null> {
  const [rows] = await db.execute<
    CategoriaRow[]
  >(
    `
      SELECT
        id,
        id_empresa,
        nome,
        descricao,
        status
      FROM categoria
      WHERE id = ?
      LIMIT 1
    `,
    [id]
  )

  return rows[0] ?? null
}

export async function findCategoriaByNome(
  nome: string,
  idEmpresa: number
): Promise<CategoriaRow | null> {
  const [rows] = await db.execute<
    CategoriaRow[]
  >(
    `
      SELECT
        id,
        id_empresa,
        nome,
        descricao,
        status
      FROM categoria
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

export async function updateCategoria(
  id: number,
  data: UpdateCategoriaData
): Promise<CategoriaRow | null> {
  const fields: string[] = []

  const values: Array<
    string | number | null
  > = []

  if (data.id_empresa !== undefined) {
    fields.push('id_empresa = ?')
    values.push(data.id_empresa)
  }

  if (data.nome !== undefined) {
    fields.push('nome = ?')
    values.push(data.nome)
  }

  if (data.descricao !== undefined) {
    fields.push('descricao = ?')
    values.push(data.descricao)
  }

  if (data.status !== undefined) {
    fields.push('status = ?')
    values.push(data.status)
  }

  if (fields.length === 0) {
    return findCategoriaById(id)
  }

  values.push(id)

  const [result] = await db.execute<ResultSetHeader>(
    `
      UPDATE categoria
      SET ${fields.join(', ')}
      WHERE id = ?
    `,
    values
  )

  if (result.affectedRows === 0) {
    return null
  }

  return findCategoriaById(id)
}

export async function softDeleteCategoria(
  id: number
): Promise<boolean> {
  const [result] = await db.execute<ResultSetHeader>(
    `
      UPDATE categoria
      SET status = 'INATIVO'
      WHERE id = ?
    `,
    [id]
  )

  return result.affectedRows > 0
}