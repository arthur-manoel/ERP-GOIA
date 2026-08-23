import {
  ResultSetHeader,
  RowDataPacket,
} from 'mysql2'

import db from '../../config/database.js'

export interface OrdemProducaoItem {
  id: number
  id_ordem_producao: number
  id_produto: number
  id_modelo: number | null
  id_cor: number | null
  id_tamanho: number | null
  quantidade: number
  quantidade_produzida: number
}

export interface OrdemProducaoItemRow
  extends RowDataPacket {
  id: number
  id_ordem_producao: number
  id_produto: number
  id_modelo: number | null
  id_cor: number | null
  id_tamanho: number | null
  quantidade: number
  quantidade_produzida: number
}

interface CountRow extends RowDataPacket {
  total: number
}

export interface CreateOrdemProducaoItemData {
  id_ordem_producao: number
  id_produto: number
  id_modelo?: number | null
  id_cor?: number | null
  id_tamanho?: number | null
  quantidade: number
  quantidade_produzida: number
}

export interface UpdateOrdemProducaoItemData {
  id_produto?: number
  id_modelo?: number | null
  id_cor?: number | null
  id_tamanho?: number | null
  quantidade?: number
  quantidade_produzida?: number
}

export interface OrdemProducaoItemFilters {
  idOrdemProducao?: number
  idProduto?: number
  idModelo?: number
  idCor?: number
  idTamanho?: number
}

export interface OrdemProducaoItemPagination {
  page: number
  limit: number
}

function mapOrdemProducaoItem(
  row: OrdemProducaoItemRow
): OrdemProducaoItem {
  return {
    id: row.id,
    id_ordem_producao: row.id_ordem_producao,
    id_produto: row.id_produto,
    id_modelo: row.id_modelo,
    id_cor: row.id_cor,
    id_tamanho: row.id_tamanho,
    quantidade: row.quantidade,
    quantidade_produzida:
      row.quantidade_produzida,
  }
}

/**
 * Cria um item da ordem de produção.
 */
export async function create(
  data: CreateOrdemProducaoItemData
): Promise<OrdemProducaoItem> {
  const [result] =
    await db.execute<ResultSetHeader>(
      `
        INSERT INTO ordem_producao_item (
          id_ordem_producao,
          id_produto,
          id_modelo,
          id_cor,
          id_tamanho,
          quantidade,
          quantidade_produzida
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        data.id_ordem_producao,
        data.id_produto,
        data.id_modelo ?? null,
        data.id_cor ?? null,
        data.id_tamanho ?? null,
        data.quantidade,
        data.quantidade_produzida,
      ]
    )

  const item = await findById(
    result.insertId
  )

  if (!item) {
    throw new Error(
      'Erro ao recuperar item da ordem de produção criado'
    )
  }

  return item
}

/**
 * Lista itens da ordem de produção.
 */
export async function findAll(
  filters: OrdemProducaoItemFilters,
  pagination: OrdemProducaoItemPagination
): Promise<{
  rows: OrdemProducaoItem[]
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
    filters.idProduto !== undefined
  ) {
    conditions.push(
      'id_produto = ?'
    )

    params.push(
      filters.idProduto
    )
  }

  if (
    filters.idModelo !== undefined
  ) {
    conditions.push(
      'id_modelo = ?'
    )

    params.push(
      filters.idModelo
    )
  }

  if (
    filters.idCor !== undefined
  ) {
    conditions.push(
      'id_cor = ?'
    )

    params.push(
      filters.idCor
    )
  }

  if (
    filters.idTamanho !== undefined
  ) {
    conditions.push(
      'id_tamanho = ?'
    )

    params.push(
      filters.idTamanho
    )
  }

  const whereClause =
    conditions.length > 0
      ? `WHERE ${conditions.join(
          ' AND '
        )}`
      : ''

  /**
   * IMPORTANTE:
   * LIMIT/OFFSET não são enviados como ?
   * no execute(), pois isso pode gerar
   * ER_WRONG_ARGUMENTS (1210) no MySQL2.
   */
  const page = Math.max(
    1,
    Math.floor(
      Number(pagination.page)
    )
  )

  const limit = Math.min(
    100,
    Math.max(
      1,
      Math.floor(
        Number(pagination.limit)
      )
    )
  )

  const offset =
    (page - 1) * limit

  const sql = `
    SELECT
      id,
      id_ordem_producao,
      id_produto,
      id_modelo,
      id_cor,
      id_tamanho,
      quantidade,
      quantidade_produzida
    FROM ordem_producao_item
    ${whereClause}
    ORDER BY id DESC
    LIMIT ${limit}
    OFFSET ${offset}
  `

  const [rows] =
    await db.execute<
      OrdemProducaoItemRow[]
    >(
      sql,
      params
    )

  const [countRows] =
    await db.execute<CountRow[]>(
      `
        SELECT
          COUNT(*) AS total
        FROM ordem_producao_item
        ${whereClause}
      `,
      params
    )

  return {
    rows: rows.map(
      mapOrdemProducaoItem
    ),
    count:
      countRows[0]?.total ?? 0,
  }
}

/**
 * Busca um item pelo ID.
 */
export async function findById(
  id: number
): Promise<
  OrdemProducaoItem | null
> {
  const [rows] =
    await db.execute<
      OrdemProducaoItemRow[]
    >(
      `
        SELECT
          id,
          id_ordem_producao,
          id_produto,
          id_modelo,
          id_cor,
          id_tamanho,
          quantidade,
          quantidade_produzida
        FROM ordem_producao_item
        WHERE id = ?
        LIMIT 1
      `,
      [id]
    )

  const row = rows[0]

  if (!row) {
    return null
  }

  return mapOrdemProducaoItem(
    row
  )
}

/**
 * Atualiza um item da ordem de produção.
 */
export async function update(
  id: number,
  data: UpdateOrdemProducaoItemData
): Promise<
  OrdemProducaoItem | null
> {
  const fields: string[] = []

  const values: Array<
    number | null
  > = []

  if (
    data.id_produto !== undefined
  ) {
    fields.push(
      'id_produto = ?'
    )

    values.push(
      data.id_produto
    )
  }

  if (
    data.id_modelo !== undefined
  ) {
    fields.push(
      'id_modelo = ?'
    )

    values.push(
      data.id_modelo
    )
  }

  if (
    data.id_cor !== undefined
  ) {
    fields.push(
      'id_cor = ?'
    )

    values.push(
      data.id_cor
    )
  }

  if (
    data.id_tamanho !== undefined
  ) {
    fields.push(
      'id_tamanho = ?'
    )

    values.push(
      data.id_tamanho
    )
  }

  if (
    data.quantidade !== undefined
  ) {
    fields.push(
      'quantidade = ?'
    )

    values.push(
      data.quantidade
    )
  }

  if (
    data.quantidade_produzida !==
    undefined
  ) {
    fields.push(
      'quantidade_produzida = ?'
    )

    values.push(
      data.quantidade_produzida
    )
  }

  if (fields.length === 0) {
    return findById(id)
  }

  values.push(id)

  const [result] =
    await db.execute<ResultSetHeader>(
      `
        UPDATE ordem_producao_item
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
 * Exclui um item da ordem de produção.
 */
export async function deleteOrdemProducaoItem(
  id: number
): Promise<boolean> {
  const [result] =
    await db.execute<ResultSetHeader>(
      `
        DELETE FROM ordem_producao_item
        WHERE id = ?
      `,
      [id]
    )

  return (
    result.affectedRows > 0
  )
}