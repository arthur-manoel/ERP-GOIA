import type {
  ResultSetHeader,
  RowDataPacket,
} from 'mysql2'

import db from '../../config/database.js'

export interface TipoProduto {
  id: number
  nome: string
  descricao: string | null
}

interface TipoProdutoRow
  extends RowDataPacket {
  id: number
  nome: string
  descricao: string | null
}

interface CountRow
  extends RowDataPacket {
  total: number
}

export interface CreateTipoProdutoData {
  nome: string
  descricao?: string | null
}

export interface UpdateTipoProdutoData {
  nome?: string
  descricao?: string | null
}

export interface TipoProdutoFilters {
  q?: string
}

export interface TipoProdutoPagination {
  page: number
  limit: number
}

function mapTipoProduto(
  row: TipoProdutoRow
): TipoProduto {
  return {
    id: row.id,
    nome: row.nome,
    descricao: row.descricao,
  }
}

export async function create(
  data: CreateTipoProdutoData
): Promise<TipoProduto> {
  const [result] =
    await db.execute<ResultSetHeader>(
      `
        INSERT INTO tipos_produto (
          nome,
          descricao
        )
        VALUES (?, ?)
      `,
      [
        data.nome,
        data.descricao ?? null,
      ]
    )

  const tipoProduto =
    await findById(result.insertId)

  if (!tipoProduto) {
    throw new Error(
      'Erro ao recuperar tipo de produto criado'
    )
  }

  return tipoProduto
}

export async function findAll(
  filters: TipoProdutoFilters,
  pagination: TipoProdutoPagination
): Promise<{
  rows: TipoProduto[]
  count: number
}> {
  const conditions: string[] = []
  const params: string[] = []

  if (filters.q) {
    conditions.push(
      'LOWER(nome) LIKE ?'
    )

    params.push(
      `%${filters.q.toLowerCase()}%`
    )
  }

  const whereClause =
    conditions.length > 0
      ? `WHERE ${conditions.join(' AND ')}`
      : ''

  const page = Math.max(
    1,
    Number(pagination.page) || 1
  )

  const limit = Math.min(
    100,
    Math.max(
      1,
      Number(pagination.limit) || 20
    )
  )

  const offset =
    (page - 1) * limit

  /*
   * LIMIT e OFFSET entram diretamente
   * na query porque já foram convertidos
   * e validados como números.
   */
  const [rowsResult, countResult] =
    await Promise.all([
      db.query<TipoProdutoRow[]>(
        `
          SELECT
            id,
            nome,
            descricao
          FROM tipos_produto
          ${whereClause}
          ORDER BY nome ASC
          LIMIT ${limit}
          OFFSET ${offset}
        `,
        params
      ),

      db.query<CountRow[]>(
        `
          SELECT
            COUNT(*) AS total
          FROM tipos_produto
          ${whereClause}
        `,
        params
      ),
    ])

  const [rows] = rowsResult
  const [countRows] = countResult

  return {
    rows: rows.map(
      mapTipoProduto
    ),
    count:
      countRows[0]?.total ?? 0,
  }
}

export async function findById(
  id: number
): Promise<TipoProduto | null> {
  const [rows] =
    await db.execute<TipoProdutoRow[]>(
      `
        SELECT
          id,
          nome,
          descricao
        FROM tipos_produto
        WHERE id = ?
        LIMIT 1
      `,
      [id]
    )

  const row = rows[0]

  if (!row) {
    return null
  }

  return mapTipoProduto(row)
}

export async function findByNome(
  nome: string
): Promise<TipoProduto | null> {
  const [rows] =
    await db.execute<TipoProdutoRow[]>(
      `
        SELECT
          id,
          nome,
          descricao
        FROM tipos_produto
        WHERE LOWER(nome) = LOWER(?)
        LIMIT 1
      `,
      [nome]
    )

  const row = rows[0]

  if (!row) {
    return null
  }

  return mapTipoProduto(row)
}

export async function update(
  id: number,
  data: UpdateTipoProdutoData
): Promise<TipoProduto | null> {
  const fields: string[] = []

  const values: Array<
    string | number | null
  > = []

  if (data.nome !== undefined) {
    fields.push('nome = ?')
    values.push(data.nome)
  }

  if (data.descricao !== undefined) {
    fields.push('descricao = ?')
    values.push(data.descricao)
  }

  if (fields.length === 0) {
    return findById(id)
  }

  values.push(id)

  await db.execute<ResultSetHeader>(
    `
      UPDATE tipos_produto
      SET ${fields.join(', ')}
      WHERE id = ?
    `,
    values
  )

  return findById(id)
}

export async function remove(
  id: number
): Promise<boolean> {
  const [result] =
    await db.execute<ResultSetHeader>(
      `
        DELETE FROM tipos_produto
        WHERE id = ?
      `,
      [id]
    )

  return result.affectedRows > 0
}