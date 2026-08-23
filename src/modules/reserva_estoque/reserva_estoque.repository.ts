import {
  ResultSetHeader,
  RowDataPacket,
} from 'mysql2'

import db from '../../config/database.js'

export type ReservaEstoqueTipoOrigem =
  | 'VENDA'
  | 'ORDEM_PRODUCAO'
  | 'NECESSIDADE_PRODUCAO'

export type ReservaEstoqueStatus =
  | 'RESERVADO'
  | 'FINALIZADO'
  | 'CANCELADO'

export interface ReservaEstoque {
  id: number
  id_empresa: number
  id_setor: number
  id_produto: number
  tipo_origem: ReservaEstoqueTipoOrigem
  id_venda: number | null
  id_ordem_producao: number | null
  id_necessidade_producao: number | null
  quantidade: number
  status: ReservaEstoqueStatus
  id_usuario: number
  data_reserva: Date
  data_finalizacao: Date | null
}

export interface ReservaEstoqueRow
  extends RowDataPacket {
  id: number
  id_empresa: number
  id_setor: number
  id_produto: number
  tipo_origem: ReservaEstoqueTipoOrigem
  id_venda: number | null
  id_ordem_producao: number | null
  id_necessidade_producao: number | null
  quantidade: number
  status: ReservaEstoqueStatus
  id_usuario: number
  data_reserva: Date
  data_finalizacao: Date | null
}

interface CountRow
  extends RowDataPacket {
  total: number
}

export interface CreateReservaEstoqueData {
  id_empresa: number
  id_setor: number
  id_produto: number
  tipo_origem: ReservaEstoqueTipoOrigem
  id_venda?: number | null
  id_ordem_producao?: number | null
  id_necessidade_producao?: number | null
  quantidade: number
  status: ReservaEstoqueStatus
  id_usuario: number
}

export interface UpdateReservaEstoqueData {
  id_empresa?: number
  id_setor?: number
  id_produto?: number
  tipo_origem?: ReservaEstoqueTipoOrigem
  id_venda?: number | null
  id_ordem_producao?: number | null
  id_necessidade_producao?: number | null
  quantidade?: number
  status?: ReservaEstoqueStatus
  id_usuario?: number
}

export interface ReservaEstoqueFilters {
  idEmpresa?: number
  idSetor?: number
  idProduto?: number
  status?: ReservaEstoqueStatus
}

export interface ReservaEstoquePagination {
  page: number
  limit: number
}

function mapReservaEstoque(
  row: ReservaEstoqueRow
): ReservaEstoque {
  return {
    id: row.id,
    id_empresa: row.id_empresa,
    id_setor: row.id_setor,
    id_produto: row.id_produto,
    tipo_origem: row.tipo_origem,
    id_venda: row.id_venda,
    id_ordem_producao:
      row.id_ordem_producao,
    id_necessidade_producao:
      row.id_necessidade_producao,
    quantidade: row.quantidade,
    status: row.status,
    id_usuario: row.id_usuario,
    data_reserva: row.data_reserva,
    data_finalizacao:
      row.data_finalizacao,
  }
}

/**
 * Cria uma reserva de estoque.
 */
export async function create(
  data: CreateReservaEstoqueData
): Promise<ReservaEstoque> {
  const finalizaReserva =
    data.status === 'FINALIZADO' ||
    data.status === 'CANCELADO'

  const [result] =
    await db.execute<ResultSetHeader>(
      `
        INSERT INTO reserva_estoque (
          id_empresa,
          id_setor,
          id_produto,
          tipo_origem,
          id_venda,
          id_ordem_producao,
          id_necessidade_producao,
          quantidade,
          status,
          id_usuario,
          data_finalizacao
        )
        VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
          ${
            finalizaReserva
              ? 'CURRENT_TIMESTAMP'
              : 'NULL'
          }
        )
      `,
      [
        data.id_empresa,
        data.id_setor,
        data.id_produto,
        data.tipo_origem,
        data.id_venda ?? null,
        data.id_ordem_producao ?? null,
        data.id_necessidade_producao ??
          null,
        data.quantidade,
        data.status,
        data.id_usuario,
      ]
    )

  const reserva = await findById(
    result.insertId
  )

  if (!reserva) {
    throw new Error(
      'Erro ao recuperar reserva de estoque criada'
    )
  }

  return reserva
}

/**
 * Lista reservas de estoque.
 */
export async function findAll(
  filters: ReservaEstoqueFilters,
  pagination: ReservaEstoquePagination
): Promise<{
  rows: ReservaEstoque[]
  count: number
}> {
  const conditions: string[] = []

  const params: Array<
    string | number
  > = []

  if (
    filters.idEmpresa !== undefined
  ) {
    conditions.push(
      'id_empresa = ?'
    )

    params.push(
      filters.idEmpresa
    )
  }

  if (
    filters.idSetor !== undefined
  ) {
    conditions.push(
      'id_setor = ?'
    )

    params.push(
      filters.idSetor
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
    filters.status !== undefined
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
      ? `WHERE ${conditions.join(' AND ')}`
      : ''

  /**
   * Garante que paginação seja válida.
   */
  const page = Math.max(
    1,
    Math.floor(
      Number(pagination.page) || 1
    )
  )

  const limit = Math.min(
    100,
    Math.max(
      1,
      Math.floor(
        Number(pagination.limit) || 10
      )
    )
  )

  const offset =
    (page - 1) * limit

  /**
   * IMPORTANTE:
   *
   * LIMIT e OFFSET são colocados diretamente
   * na query depois de serem convertidos e
   * validados como números.
   *
   * Isso evita o ER_WRONG_ARGUMENTS 1210
   * do mysqld_stmt_execute.
   */
  const [rows] =
    await db.execute<
      ReservaEstoqueRow[]
    >(
      `
        SELECT
          id,
          id_empresa,
          id_setor,
          id_produto,
          tipo_origem,
          id_venda,
          id_ordem_producao,
          id_necessidade_producao,
          quantidade,
          status,
          id_usuario,
          data_reserva,
          data_finalizacao
        FROM reserva_estoque
        ${whereClause}
        ORDER BY data_reserva DESC, id DESC
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
        FROM reserva_estoque
        ${whereClause}
      `,
      params
    )

  return {
    rows: rows.map(
      mapReservaEstoque
    ),
    count:
      countRows[0]?.total ?? 0,
  }
}

/**
 * Busca uma reserva pelo ID.
 */
export async function findById(
  id: number
): Promise<ReservaEstoque | null> {
  const [rows] =
    await db.execute<
      ReservaEstoqueRow[]
    >(
      `
        SELECT
          id,
          id_empresa,
          id_setor,
          id_produto,
          tipo_origem,
          id_venda,
          id_ordem_producao,
          id_necessidade_producao,
          quantidade,
          status,
          id_usuario,
          data_reserva,
          data_finalizacao
        FROM reserva_estoque
        WHERE id = ?
        LIMIT 1
      `,
      [id]
    )

  const row = rows[0]

  if (!row) {
    return null
  }

  return mapReservaEstoque(row)
}

/**
 * Atualiza uma reserva.
 */
export async function update(
  id: number,
  data: UpdateReservaEstoqueData
): Promise<ReservaEstoque | null> {
  const fields: string[] = []

  const values: Array<
    string | number | null
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
    data.id_setor !== undefined
  ) {
    fields.push(
      'id_setor = ?'
    )

    values.push(
      data.id_setor
    )
  }

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
    data.tipo_origem !== undefined
  ) {
    fields.push(
      'tipo_origem = ?'
    )

    values.push(
      data.tipo_origem
    )
  }

  if (
    data.id_venda !== undefined
  ) {
    fields.push(
      'id_venda = ?'
    )

    values.push(
      data.id_venda
    )
  }

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
    data.id_necessidade_producao !==
    undefined
  ) {
    fields.push(
      'id_necessidade_producao = ?'
    )

    values.push(
      data.id_necessidade_producao
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
    data.id_usuario !== undefined
  ) {
    fields.push(
      'id_usuario = ?'
    )

    values.push(
      data.id_usuario
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

    if (
      data.status === 'FINALIZADO' ||
      data.status === 'CANCELADO'
    ) {
      fields.push(
        'data_finalizacao = CURRENT_TIMESTAMP'
      )
    } else {
      fields.push(
        'data_finalizacao = NULL'
      )
    }
  }

  if (fields.length === 0) {
    return findById(id)
  }

  values.push(id)

  const [result] =
    await db.execute<ResultSetHeader>(
      `
        UPDATE reserva_estoque
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
 * Cancela uma reserva logicamente.
 */
export async function cancel(
  id: number
): Promise<boolean> {
  const [result] =
    await db.execute<ResultSetHeader>(
      `
        UPDATE reserva_estoque
        SET
          status = 'CANCELADO',
          data_finalizacao = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      [id]
    )

  return result.affectedRows > 0
}