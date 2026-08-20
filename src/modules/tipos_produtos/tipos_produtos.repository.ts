import type {
  ResultSetHeader,
  RowDataPacket,
} from 'mysql2'

import db from '../../config/database.js'

export interface TipoProduto {
  id: number
  nome: string
  descricao: string | null
  ativo: boolean
  data_cadastro: Date
}

interface TipoProdutoRow
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

export interface CreateTipoProdutoData {
  nome: string
  descricao?: string | null
  ativo?: boolean
}

export interface UpdateTipoProdutoData {
  nome?: string
  descricao?: string | null
  ativo?: boolean
}

export interface TipoProdutoFilters {
  q?: string
  includeInativos?: boolean
}

export interface TipoProdutoPagination {
  page: number
  limit: number
}

function mapTipoProduto(
  row: TipoProdutoRow
): TipoProduto {
  return {
    id:
      row.id,

    nome:
      row.nome,

    descricao:
      row.descricao,

    ativo:
      Boolean(
        row.ativo
      ),

    data_cadastro:
      row.data_cadastro,
  }
}

export async function create(
  data: CreateTipoProdutoData
): Promise<TipoProduto> {
  const [result] =
    await db.execute<ResultSetHeader>(
      `
        INSERT INTO tipos_produtos (
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

  const tipoProduto =
    await findById(
      result.insertId
    )

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
  const conditions:
    string[] = []

  const params:
    Array<
      string |
      number |
      boolean
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

  const [
    rowsResult,
    countResult,
  ] =
    await Promise.all([
      db.execute<
        TipoProdutoRow[]
      >(
        `
          SELECT
            id,
            nome,
            descricao,
            ativo,
            data_cadastro
          FROM tipos_produtos
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

      db.execute<
        CountRow[]
      >(
        `
          SELECT
            COUNT(*) AS total
          FROM tipos_produtos
          ${whereClause}
        `,
        params
      ),
    ])

  const [rows] =
    rowsResult

  const [countRows] =
    countResult

  return {
    rows:
      rows.map(
        mapTipoProduto
      ),

    count:
      countRows[0]
        ?.total ?? 0,
  }
}

export async function findById(
  id: number
): Promise<TipoProduto | null> {
  const [rows] =
    await db.execute<
      TipoProdutoRow[]
    >(
      `
        SELECT
          id,
          nome,
          descricao,
          ativo,
          data_cadastro
        FROM tipos_produtos
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

  return mapTipoProduto(
    row
  )
}

export async function findByNome(
  nome: string
): Promise<TipoProduto | null> {
  const [rows] =
    await db.execute<
      TipoProdutoRow[]
    >(
      `
        SELECT
          id,
          nome,
          descricao,
          ativo,
          data_cadastro
        FROM tipos_produtos
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

  return mapTipoProduto(
    row
  )
}

export async function update(
  id: number,
  data: UpdateTipoProdutoData
): Promise<TipoProduto | null> {
  const fields:
    string[] = []

  const values:
    Array<
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
    return findById(
      id
    )
  }

  values.push(
    id
  )

  await db.execute<ResultSetHeader>(
    `
      UPDATE tipos_produtos
      SET ${fields.join(', ')}
      WHERE id = ?
    `,
    values
  )

  return findById(
    id
  )
}

export async function softDelete(
  id: number
): Promise<boolean> {
  const [result] =
    await db.execute<ResultSetHeader>(
      `
        UPDATE tipos_produtos
        SET ativo = 0
        WHERE id = ?
          AND ativo = 1
      `,
      [
        id,
      ]
    )

  return (
    result.affectedRows >
    0
  )
}