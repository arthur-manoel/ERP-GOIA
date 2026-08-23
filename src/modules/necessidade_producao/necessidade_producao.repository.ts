import {
  ResultSetHeader,
  RowDataPacket,
} from 'mysql2'

import db from '../../config/database.js'

export type NecessidadeProducaoStatus =
  | 'PENDENTE'
  | 'RESERVADO'
  | 'CONSUMIDO'
  | 'CANCELADO'

export interface NecessidadeProducao {
  id: number
  id_ordem_producao: number
  id_produto: number
  quantidade_necessaria: number
  quantidade_reservada: number
  quantidade_consumida: number
  status: NecessidadeProducaoStatus
}

export interface NecessidadeProducaoRow
  extends RowDataPacket {
  id: number
  id_ordem_producao: number
  id_produto: number
  quantidade_necessaria: number
  quantidade_reservada: number
  quantidade_consumida: number
  status: NecessidadeProducaoStatus
}

interface CountRow
  extends RowDataPacket {
  total: number
}

export interface CreateNecessidadeProducaoData {
  id_ordem_producao: number
  id_produto: number
  quantidade_necessaria: number
  quantidade_reservada: number
  quantidade_consumida: number
  status: NecessidadeProducaoStatus
}

export interface UpdateNecessidadeProducaoData {
  id_ordem_producao?: number
  id_produto?: number
  quantidade_necessaria?: number
  quantidade_reservada?: number
  quantidade_consumida?: number
  status?: NecessidadeProducaoStatus
}

export interface NecessidadeProducaoFilters {
  idOrdemProducao?: number
  idProduto?: number
  status?: NecessidadeProducaoStatus
}

export interface NecessidadeProducaoPagination {
  page: number
  limit: number
}

function mapNecessidadeProducao(
  row: NecessidadeProducaoRow
): NecessidadeProducao {
  return {
    id: row.id,
    id_ordem_producao:
      row.id_ordem_producao,
    id_produto:
      row.id_produto,
    quantidade_necessaria:
      row.quantidade_necessaria,
    quantidade_reservada:
      row.quantidade_reservada,
    quantidade_consumida:
      row.quantidade_consumida,
    status: row.status,
  }
}

/**
 * Cria uma necessidade de produção.
 */
export async function create(
  data: CreateNecessidadeProducaoData
): Promise<NecessidadeProducao> {
  const [result] =
    await db.execute<ResultSetHeader>(
      `
        INSERT INTO necessidade_producao (
          id_ordem_producao,
          id_produto,
          quantidade_necessaria,
          quantidade_reservada,
          quantidade_consumida,
          status
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        data.id_ordem_producao,
        data.id_produto,
        data.quantidade_necessaria,
        data.quantidade_reservada,
        data.quantidade_consumida,
        data.status,
      ]
    )

  const necessidade =
    await findById(
      result.insertId
    )

  if (!necessidade) {
    throw new Error(
      'Erro ao recuperar necessidade de produção criada'
    )
  }

  return necessidade
}

/**
 * Lista necessidades de produção.
 */
export async function findAll(
  filters: NecessidadeProducaoFilters,
  pagination: NecessidadeProducaoPagination
): Promise<{
  rows: NecessidadeProducao[]
  count: number
}> {
  const conditions: string[] = []

  const params: Array<
    string | number
  > = []

  if (
    filters.idOrdemProducao !==
    undefined
  ) {
    conditions.push(
      'id_ordem_producao = ?'
    )

    params.push(
      filters.idOrdemProducao
    )
  }

  if (
    filters.idProduto !==
    undefined
  ) {
    conditions.push(
      'id_produto = ?'
    )

    params.push(
      filters.idProduto
    )
  }

  if (
    filters.status !==
    undefined
  ) {
    conditions.push(
      'status = ?'
    )

    params.push(
      filters.status
    )
  }

  const whereClause =
    conditions.length > 0
      ? `WHERE ${conditions.join(
          ' AND '
        )}`
      : ''

  /*
   * LIMIT e OFFSET não são enviados
   * como parâmetros (?) porque isso pode
   * causar ER_WRONG_ARGUMENTS no mysql2.
   */
  const page = Math.max(
    1,
    Math.floor(
      Number(pagination.page)
    )
  )

  const limit = Math.max(
    1,
    Math.floor(
      Number(pagination.limit)
    )
  )

  const offset =
    (page - 1) * limit

  const sql = `
    SELECT
      id,
      id_ordem_producao,
      id_produto,
      quantidade_necessaria,
      quantidade_reservada,
      quantidade_consumida,
      status
    FROM necessidade_producao
    ${whereClause}
    ORDER BY id DESC
    LIMIT ${limit}
    OFFSET ${offset}
  `

  const [rows] =
    await db.execute<
      NecessidadeProducaoRow[]
    >(
      sql,
      params
    )

  const [countRows] =
    await db.execute<
      CountRow[]
    >(
      `
        SELECT
          COUNT(*) AS total
        FROM necessidade_producao
        ${whereClause}
      `,
      params
    )

  return {
    rows: rows.map(
      mapNecessidadeProducao
    ),
    count:
      countRows[0]?.total ?? 0,
  }
}

/**
 * Busca uma necessidade pelo ID.
 */
export async function findById(
  id: number
): Promise<
  NecessidadeProducao | null
> {
  const [rows] =
    await db.execute<
      NecessidadeProducaoRow[]
    >(
      `
        SELECT
          id,
          id_ordem_producao,
          id_produto,
          quantidade_necessaria,
          quantidade_reservada,
          quantidade_consumida,
          status
        FROM necessidade_producao
        WHERE id = ?
        LIMIT 1
      `,
      [id]
    )

  const row = rows[0]

  if (!row) {
    return null
  }

  return mapNecessidadeProducao(
    row
  )
}

/**
 * Atualiza uma necessidade de produção.
 */
export async function update(
  id: number,
  data: UpdateNecessidadeProducaoData
): Promise<
  NecessidadeProducao | null
> {
  const fields: string[] = []

  const values: Array<
    string | number
  > = []

  if (
    data.id_ordem_producao !==
    undefined
  ) {
    fields.push(
      'id_ordem_producao = ?'
    )

    values.push(
      data.id_ordem_producao
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
      data.id_produto
    )
  }

  if (
    data.quantidade_necessaria !==
    undefined
  ) {
    fields.push(
      'quantidade_necessaria = ?'
    )

    values.push(
      data.quantidade_necessaria
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
    data.quantidade_consumida !==
    undefined
  ) {
    fields.push(
      'quantidade_consumida = ?'
    )

    values.push(
      data.quantidade_consumida
    )
  }

  if (
    data.status !==
    undefined
  ) {
    fields.push(
      'status = ?'
    )

    values.push(
      data.status
    )
  }

  /*
   * Nenhum campo para atualizar.
   */
  if (fields.length === 0) {
    return findById(id)
  }

  values.push(id)

  const [result] =
    await db.execute<ResultSetHeader>(
      `
        UPDATE necessidade_producao
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

/**
 * Cancela uma necessidade de produção.
 */
export async function cancel(
  id: number
): Promise<boolean> {
  const [result] =
    await db.execute<ResultSetHeader>(
      `
        UPDATE necessidade_producao
        SET status = 'CANCELADO'
        WHERE id = ?
          AND status <> 'CANCELADO'
      `,
      [id]
    )

  return (
    result.affectedRows > 0
  )
}