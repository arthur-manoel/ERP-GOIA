import {
  ResultSetHeader,
  RowDataPacket,
} from 'mysql2'

import db from '../../config/database.js'

export interface Categoria {
  id: number
  nome: string
  descricao: string | null
  ativo: boolean
  data_cadastro: Date
}

export interface CategoriaRow
  extends RowDataPacket {
  id: number
  nome: string
  descricao: string | null
  ativo: number
  data_cadastro: Date
}

interface CountRow
  extends RowDataPacket {
  total: number
}

export interface CreateCategoriaData {
  nome: string
  descricao?: string | null
  ativo?: boolean
}

export interface UpdateCategoriaData {
  nome?: string
  descricao?: string | null
  ativo?: boolean
}

export interface CategoriaFilters {
  q?: string
  includeInativos?: boolean
}

export interface CategoriaPagination {
  page: number
  limit: number
}

function mapCategoria(
  row: CategoriaRow
): Categoria {
  return {
    id: row.id,
    nome: row.nome,
    descricao: row.descricao,
    ativo: Boolean(row.ativo),
    data_cadastro:
      row.data_cadastro,
  }
}

export async function create(
  data: CreateCategoriaData
): Promise<Categoria> {
  const [result] =
    await db.execute<ResultSetHeader>(
      `
        INSERT INTO categoria (
          nome,
          descricao,
          ativo
        )
        VALUES (?, ?, ?)
      `,
      [
        data.nome,
        data.descricao ?? null,
        data.ativo ?? true,
      ]
    )

  const categoria =
    await findById(
      result.insertId
    )

  if (!categoria) {
    throw new Error(
      'Erro ao recuperar categoria criada'
    )
  }

  return categoria
}

export async function findAll(
  filters: CategoriaFilters,
  pagination: CategoriaPagination
): Promise<{
  rows: Categoria[]
  count: number
}> {
  const conditions: string[] =
    []

  const params: Array<
    string | number | boolean
  > = []

  if (
    !filters.includeInativos
  ) {
    conditions.push(
      'ativo = 1'
    )
  }

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
      ? `WHERE ${conditions.join(
          ' AND '
        )}`
      : ''

  const offset =
    (pagination.page - 1) *
    pagination.limit

  const [rows] =
    await db.execute<
      CategoriaRow[]
    >(
      `
        SELECT
          id,
          nome,
          descricao,
          ativo,
          data_cadastro
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

  const [countRows] =
    await db.execute<
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
    rows: rows.map(
      mapCategoria
    ),
    count:
      countRows[0]?.total ?? 0,
  }
}

export async function findById(
  id: number
): Promise<Categoria | null> {
  const [rows] =
    await db.execute<
      CategoriaRow[]
    >(
      `
        SELECT
          id,
          nome,
          descricao,
          ativo,
          data_cadastro
        FROM categoria
        WHERE id = ?
        LIMIT 1
      `,
      [
        id,
      ]
    )

  const row =
    rows[0]

  if (!row) {
    return null
  }

  return mapCategoria(row)
}

export async function findByNome(
  nome: string
): Promise<Categoria | null> {
  const [rows] =
    await db.execute<
      CategoriaRow[]
    >(
      `
        SELECT
          id,
          nome,
          descricao,
          ativo,
          data_cadastro
        FROM categoria
        WHERE LOWER(nome) =
              LOWER(?)
        LIMIT 1
      `,
      [
        nome,
      ]
    )

  const row =
    rows[0]

  if (!row) {
    return null
  }

  return mapCategoria(row)
}

export async function update(
  id: number,
  data: UpdateCategoriaData
): Promise<Categoria | null> {
  const fields: string[] =
    []

  const values: Array<
    string |
    number |
    boolean |
    null
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
    data.descricao !==
    undefined
  ) {
    fields.push(
      'descricao = ?'
    )

    values.push(
      data.descricao
    )
  }

  if (
    data.ativo !== undefined
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
        UPDATE categoria
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
        UPDATE categoria
        SET ativo = 0
        WHERE id = ?
          AND ativo = 1
      `,
      [
        id,
      ]
    )

  return (
    result.affectedRows > 0
  )
}