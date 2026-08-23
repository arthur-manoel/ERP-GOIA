import {
  ResultSetHeader,
  RowDataPacket,
} from 'mysql2'

import db from '../../config/database.js'

export interface Estoque {
  id: number
  id_empresa: number
  id_setor: number
  id_produto: number
  quantidade: number
  quantidade_reservada: number
  data_atualizacao: Date
}

export interface EstoqueRow
  extends RowDataPacket {
  id: number
  id_empresa: number
  id_setor: number
  id_produto: number
  quantidade: number
  quantidade_reservada: number
  data_atualizacao: Date
}

interface CountRow
  extends RowDataPacket {
  total: number
}

export interface CreateEstoqueData {
  id_empresa: number
  id_setor: number
  id_produto: number
  quantidade: number
  quantidade_reservada: number
}

export interface UpdateEstoqueData {
  id_empresa?: number
  id_setor?: number
  id_produto?: number
  quantidade?: number
  quantidade_reservada?: number
}

export interface EstoqueFilters {
  idEmpresa?: number
  idSetor?: number
  idProduto?: number
}

export interface EstoquePagination {
  page: number
  limit: number
}

function mapEstoque(
  row: EstoqueRow
): Estoque {
  return {
    id: row.id,
    id_empresa: row.id_empresa,
    id_setor: row.id_setor,
    id_produto: row.id_produto,
    quantidade: row.quantidade,
    quantidade_reservada:
      row.quantidade_reservada,
    data_atualizacao:
      row.data_atualizacao,
  }
}

export async function create(
  data: CreateEstoqueData
): Promise<Estoque> {
  const [result] =
    await db.execute<ResultSetHeader>(
      `
        INSERT INTO estoque (
          id_empresa,
          id_setor,
          id_produto,
          quantidade,
          quantidade_reservada
        )
        VALUES (?, ?, ?, ?, ?)
      `,
      [
        Number(data.id_empresa),
        Number(data.id_setor),
        Number(data.id_produto),
        data.quantidade,
        data.quantidade_reservada,
      ]
    )

  const estoque =
    await findById(
      result.insertId
    )

  if (!estoque) {
    throw new Error(
      'Erro ao recuperar estoque criado'
    )
  }

  return estoque
}

export async function findAll(
  filters: EstoqueFilters,
  pagination: EstoquePagination
): Promise<{
  rows: Estoque[]
  count: number
}> {
  const conditions: string[] = []

  const params: number[] = []

  // =========================
  // FILTRO EMPRESA
  // =========================

  if (
    filters.idEmpresa !==
    undefined
  ) {
    conditions.push(
      'id_empresa = ?'
    )

    params.push(
      Number(filters.idEmpresa)
    )
  }

  // =========================
  // FILTRO SETOR
  // =========================

  if (
    filters.idSetor !==
    undefined
  ) {
    conditions.push(
      'id_setor = ?'
    )

    params.push(
      Number(filters.idSetor)
    )
  }

  // =========================
  // FILTRO PRODUTO
  // =========================

  if (
    filters.idProduto !==
    undefined
  ) {
    conditions.push(
      'id_produto = ?'
    )

    params.push(
      Number(filters.idProduto)
    )
  }

  // =========================
  // WHERE
  // =========================

  const whereClause =
    conditions.length > 0
      ? `WHERE ${conditions.join(
          ' AND '
        )}`
      : ''

  // =========================
  // PAGINAÇÃO
  // =========================

  let page = Number(
    pagination?.page
  )

  let limit = Number(
    pagination?.limit
  )

  if (
    !Number.isFinite(page) ||
    page < 1
  ) {
    page = 1
  }

  if (
    !Number.isFinite(limit) ||
    limit < 1
  ) {
    limit = 20
  }

  page = Math.floor(page)
  limit = Math.floor(limit)

  // Limite máximo
  if (limit > 100) {
    limit = 100
  }

  const offset =
    (page - 1) * limit

  // =========================
  // SELECT
  // =========================

  const selectSql = `
    SELECT
      id,
      id_empresa,
      id_setor,
      id_produto,
      quantidade,
      quantidade_reservada,
      data_atualizacao
    FROM estoque
    ${whereClause}
    ORDER BY id DESC
    LIMIT ${limit}
    OFFSET ${offset}
  `

  // =========================
  // COUNT
  // =========================

  const countSql = `
    SELECT
      COUNT(*) AS total
    FROM estoque
    ${whereClause}
  `

  // =========================
  // EXECUÇÃO
  // =========================

  const [
    [rows],
    [countRows],
  ] = await Promise.all([
    db.execute<EstoqueRow[]>(
      selectSql,
      params
    ),

    db.execute<CountRow[]>(
      countSql,
      params
    ),
  ])

  return {
    rows: rows.map(mapEstoque),
    count: Number(
      countRows[0]?.total ?? 0
    ),
  }
}

export async function findById(
  id: number
): Promise<Estoque | null> {
  const [rows] =
    await db.execute<EstoqueRow[]>(
      `
        SELECT
          id,
          id_empresa,
          id_setor,
          id_produto,
          quantidade,
          quantidade_reservada,
          data_atualizacao
        FROM estoque
        WHERE id = ?
        LIMIT 1
      `,
      [
        Number(id),
      ]
    )

  const row =
    rows[0]

  if (!row) {
    return null
  }

  return mapEstoque(row)
}

export async function findByAssociacao(
  idEmpresa: number,
  idSetor: number,
  idProduto: number
): Promise<Estoque | null> {
  const [rows] =
    await db.execute<EstoqueRow[]>(
      `
        SELECT
          id,
          id_empresa,
          id_setor,
          id_produto,
          quantidade,
          quantidade_reservada,
          data_atualizacao
        FROM estoque
        WHERE id_empresa = ?
          AND id_setor = ?
          AND id_produto = ?
        LIMIT 1
      `,
      [
        Number(idEmpresa),
        Number(idSetor),
        Number(idProduto),
      ]
    )

  const row =
    rows[0]

  if (!row) {
    return null
  }

  return mapEstoque(row)
}

export async function update(
  id: number,
  data: UpdateEstoqueData
): Promise<Estoque | null> {
  const fields: string[] = []

  const values: Array<
    number
  > = []

  if (
    data.id_empresa !==
    undefined
  ) {
    fields.push(
      'id_empresa = ?'
    )

    values.push(
      Number(data.id_empresa)
    )
  }

  if (
    data.id_setor !==
    undefined
  ) {
    fields.push(
      'id_setor = ?'
    )

    values.push(
      Number(data.id_setor)
    )
  }

  if (
    data.id_produto !==
    undefined
  ) {
    fields.push(
      'id_produto = ?'
    )

    values.push(
      Number(data.id_produto)
    )
  }

  if (
    data.quantidade !==
    undefined
  ) {
    fields.push(
      'quantidade = ?'
    )

    values.push(
      data.quantidade
    )
  }

  if (
    data.quantidade_reservada !==
    undefined
  ) {
    fields.push(
      'quantidade_reservada = ?'
    )

    values.push(
      data.quantidade_reservada
    )
  }

  if (
    fields.length === 0
  ) {
    return findById(id)
  }

  values.push(
    Number(id)
  )

  const [result] =
    await db.execute<ResultSetHeader>(
      `
        UPDATE estoque
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

export async function deleteEstoque(
  id: number
): Promise<boolean> {
  const [result] =
    await db.execute<ResultSetHeader>(
      `
        DELETE FROM estoque
        WHERE id = ?
      `,
      [
        Number(id),
      ]
    )

  return (
    result.affectedRows > 0
  )
}