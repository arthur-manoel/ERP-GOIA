import {
  ResultSetHeader,
  RowDataPacket,
} from 'mysql2'

import db from '../../config/database.js'

export type MovimentacaoEstoqueTipo =
  | 'ENTRADA'
  | 'SAIDA'
  | 'AJUSTE'

export type MovimentacaoEstoqueOrigemTipo =
  | 'VENDA'
  | 'COMPRA'
  | 'PRODUCAO'

export interface MovimentacaoEstoque {
  id: number
  id_empresa: number
  id_local_estoque: number
  id_setor: number
  id_produto: number
  tipo: MovimentacaoEstoqueTipo
  quantidade: number
  valor_total: number
  origem_tipo: MovimentacaoEstoqueOrigemTipo
  origem_id: number
  id_usuario: number
  data_movimentacao: Date
  observacao: string | null
}

export interface MovimentacaoEstoqueRow
  extends RowDataPacket {
  id: number
  id_empresa: number
  id_local_estoque: number
  id_setor: number
  id_produto: number
  tipo: MovimentacaoEstoqueTipo
  quantidade: number
  valor_total: string
  origem_tipo: MovimentacaoEstoqueOrigemTipo
  origem_id: number
  id_usuario: number
  data_movimentacao: Date
  observacao: string | null
}

interface CountRow extends RowDataPacket {
  total: number
}

export interface CreateMovimentacaoEstoqueData {
  id_empresa: number
  id_local_estoque: number
  id_setor: number
  id_produto: number
  tipo: MovimentacaoEstoqueTipo
  quantidade: number
  valor_total: number
  origem_tipo: MovimentacaoEstoqueOrigemTipo
  origem_id: number
  id_usuario: number
  observacao?: string | null
}

export interface UpdateMovimentacaoEstoqueData {
  id_empresa?: number
  id_local_estoque?: number
  id_setor?: number
  id_produto?: number
  tipo?: MovimentacaoEstoqueTipo
  quantidade?: number
  valor_total?: number
  origem_tipo?: MovimentacaoEstoqueOrigemTipo
  origem_id?: number
  id_usuario?: number
  observacao?: string | null
}

export interface MovimentacaoEstoqueFilters {
  idEmpresa?: number
  idSetor?: number
  idProduto?: number
  tipo?: MovimentacaoEstoqueTipo
  origemTipo?: MovimentacaoEstoqueOrigemTipo
}

export interface MovimentacaoEstoquePagination {
  page: number
  limit: number
}

function mapMovimentacaoEstoque(
  row: MovimentacaoEstoqueRow
): MovimentacaoEstoque {
  return {
    id: row.id,
    id_empresa: row.id_empresa,
    id_local_estoque: row.id_local_estoque,
    id_setor: row.id_setor,
    id_produto: row.id_produto,
    tipo: row.tipo,
    quantidade: Number(row.quantidade),
    valor_total: Number(row.valor_total),
    origem_tipo: row.origem_tipo,
    origem_id: row.origem_id,
    id_usuario: row.id_usuario,
    data_movimentacao: row.data_movimentacao,
    observacao: row.observacao,
  }
}

/**
 * Cria uma movimentação de estoque.
 */
export async function create(
  data: CreateMovimentacaoEstoqueData
): Promise<MovimentacaoEstoque> {
  const [result] =
    await db.execute<ResultSetHeader>(
      `
        INSERT INTO movimentacao_estoque (
          id_empresa,
          id_local_estoque,
          id_setor,
          id_produto,
          tipo,
          quantidade,
          valor_total,
          origem_tipo,
          origem_id,
          id_usuario,
          observacao
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        data.id_empresa,
        data.id_local_estoque,
        data.id_setor,
        data.id_produto,
        data.tipo,
        data.quantidade,
        data.valor_total,
        data.origem_tipo,
        data.origem_id,
        data.id_usuario,
        data.observacao ?? null,
      ]
    )

  const movimentacao =
    await findById(result.insertId)

  if (!movimentacao) {
    throw new Error(
      'Erro ao recuperar movimentação de estoque criada'
    )
  }

  return movimentacao
}

/**
 * Lista movimentações de estoque.
 */
export async function findAll(
  filters: MovimentacaoEstoqueFilters,
  pagination: MovimentacaoEstoquePagination
): Promise<{
  rows: MovimentacaoEstoque[]
  count: number
}> {
  const conditions: string[] = []

  const params: Array<string | number> = []

  if (filters.idEmpresa !== undefined) {
    conditions.push('id_empresa = ?')
    params.push(filters.idEmpresa)
  }

  if (filters.idSetor !== undefined) {
    conditions.push('id_setor = ?')
    params.push(filters.idSetor)
  }

  if (filters.idProduto !== undefined) {
    conditions.push('id_produto = ?')
    params.push(filters.idProduto)
  }

  if (filters.tipo !== undefined) {
    conditions.push('tipo = ?')
    params.push(filters.tipo)
  }

  if (filters.origemTipo !== undefined) {
    conditions.push('origem_tipo = ?')
    params.push(filters.origemTipo)
  }

  const whereClause =
    conditions.length > 0
      ? `WHERE ${conditions.join(' AND ')}`
      : ''

  /**
   * Normaliza a paginação.
   */
  const page = Math.max(
    1,
    Math.floor(Number(pagination.page) || 1)
  )

  const limit = Math.min(
    100,
    Math.max(
      1,
      Math.floor(Number(pagination.limit) || 10)
    )
  )

  const offset = (page - 1) * limit

  /**
   * IMPORTANTE:
   *
   * Não usamos:
   *
   * LIMIT ?
   * OFFSET ?
   *
   * O LIMIT e OFFSET são números inteiros
   * validados antes de serem inseridos na SQL.
   */
  const sql = `
    SELECT
      id,
      id_empresa,
      id_local_estoque,
      id_setor,
      id_produto,
      tipo,
      quantidade,
      valor_total,
      origem_tipo,
      origem_id,
      id_usuario,
      data_movimentacao,
      observacao
    FROM movimentacao_estoque
    ${whereClause}
    ORDER BY data_movimentacao DESC, id DESC
    LIMIT ${limit}
    OFFSET ${offset}
  `

  const [rows] =
    await db.execute<MovimentacaoEstoqueRow[]>(
      sql,
      params
    )

  const countSql = `
    SELECT
      COUNT(*) AS total
    FROM movimentacao_estoque
    ${whereClause}
  `

  const [countRows] =
    await db.execute<CountRow[]>(
      countSql,
      params
    )

  return {
    rows: rows.map(mapMovimentacaoEstoque),
    count: Number(countRows[0]?.total ?? 0),
  }
}

/**
 * Busca uma movimentação pelo ID.
 */
export async function findById(
  id: number
): Promise<MovimentacaoEstoque | null> {
  const [rows] =
    await db.execute<MovimentacaoEstoqueRow[]>(
      `
        SELECT
          id,
          id_empresa,
          id_local_estoque,
          id_setor,
          id_produto,
          tipo,
          quantidade,
          valor_total,
          origem_tipo,
          origem_id,
          id_usuario,
          data_movimentacao,
          observacao
        FROM movimentacao_estoque
        WHERE id = ?
        LIMIT 1
      `,
      [id]
    )

  const row = rows[0]

  if (!row) {
    return null
  }

  return mapMovimentacaoEstoque(row)
}

/**
 * Atualiza uma movimentação.
 */
export async function update(
  id: number,
  data: UpdateMovimentacaoEstoqueData
): Promise<MovimentacaoEstoque | null> {
  const fields: string[] = []

  const values: Array<
    string | number | null
  > = []

  if (data.id_empresa !== undefined) {
    fields.push('id_empresa = ?')
    values.push(data.id_empresa)
  }

  if (data.id_local_estoque !== undefined) {
    fields.push('id_local_estoque = ?')
    values.push(data.id_local_estoque)
  }

  if (data.id_setor !== undefined) {
    fields.push('id_setor = ?')
    values.push(data.id_setor)
  }

  if (data.id_produto !== undefined) {
    fields.push('id_produto = ?')
    values.push(data.id_produto)
  }

  if (data.tipo !== undefined) {
    fields.push('tipo = ?')
    values.push(data.tipo)
  }

  if (data.quantidade !== undefined) {
    fields.push('quantidade = ?')
    values.push(data.quantidade)
  }

  if (data.valor_total !== undefined) {
    fields.push('valor_total = ?')
    values.push(data.valor_total)
  }

  if (data.origem_tipo !== undefined) {
    fields.push('origem_tipo = ?')
    values.push(data.origem_tipo)
  }

  if (data.origem_id !== undefined) {
    fields.push('origem_id = ?')
    values.push(data.origem_id)
  }

  if (data.id_usuario !== undefined) {
    fields.push('id_usuario = ?')
    values.push(data.id_usuario)
  }

  if (data.observacao !== undefined) {
    fields.push('observacao = ?')
    values.push(data.observacao)
  }

  if (fields.length === 0) {
    return findById(id)
  }

  values.push(id)

  const [result] =
    await db.execute<ResultSetHeader>(
      `
        UPDATE movimentacao_estoque
        SET ${fields.join(', ')}
        WHERE id = ?
      `,
      values
    )

  if (result.affectedRows === 0) {
    return null
  }

  return findById(id)
}

/**
 * Exclui uma movimentação.
 */
export async function deleteMovimentacaoEstoque(
  id: number
): Promise<boolean> {
  const [result] =
    await db.execute<ResultSetHeader>(
      `
        DELETE FROM movimentacao_estoque
        WHERE id = ?
      `,
      [id]
    )

  return result.affectedRows > 0
}