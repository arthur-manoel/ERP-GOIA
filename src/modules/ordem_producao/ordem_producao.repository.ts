import {
  ResultSetHeader,
  RowDataPacket,
} from 'mysql2'

import db from '../../config/database.js'

export type OrdemProducaoStatus =
  | 'ABERTA'
  | 'EM_ANDAMENTO'
  | 'CONCLUIDA'
  | 'CANCELADA'

export interface OrdemProducao {
  id: number
  id_empresa: number
  id_local_estoque: number
  id_usuario: number
  id_setor: number
  numero: string
  status: OrdemProducaoStatus
  data_inicio: Date
  data_previsao: Date
  data_conclusao: Date | null
  observacao: string | null
}

export interface OrdemProducaoRow
  extends RowDataPacket {
  id: number
  id_empresa: number
  id_local_estoque: number
  id_usuario: number
  id_setor: number
  numero: string
  status: OrdemProducaoStatus
  data_inicio: Date
  data_previsao: Date
  data_conclusao: Date | null
  observacao: string | null
}

interface CountRow
  extends RowDataPacket {
  total: number
}

export interface CreateOrdemProducaoData {
  id_empresa: number
  id_local_estoque: number
  id_usuario: number
  id_setor: number
  numero: string
  status: OrdemProducaoStatus
  data_inicio: string
  data_previsao: string
  observacao?: string | null
}

export interface UpdateOrdemProducaoData {
  id_empresa?: number
  id_local_estoque?: number
  id_usuario?: number
  id_setor?: number
  status?: OrdemProducaoStatus
  data_inicio?: string
  data_previsao?: string
  observacao?: string | null
}

export interface OrdemProducaoFilters {
  idEmpresa?: number
  idSetor?: number
  status?: OrdemProducaoStatus
  dataInicioDe?: string
  dataInicioAte?: string
}

export interface OrdemProducaoPagination {
  page: number
  limit: number
}

function mapOrdemProducao(
  row: OrdemProducaoRow
): OrdemProducao {
  return {
    id: row.id,
    id_empresa: row.id_empresa,
    id_local_estoque: row.id_local_estoque,
    id_usuario: row.id_usuario,
    id_setor: row.id_setor,
    numero: row.numero,
    status: row.status,
    data_inicio: row.data_inicio,
    data_previsao: row.data_previsao,
    data_conclusao: row.data_conclusao,
    observacao: row.observacao,
  }
}

/**
 * Cria uma ordem de produção.
 */
export async function create(
  data: CreateOrdemProducaoData
): Promise<OrdemProducao> {
  const finalizada =
    data.status === 'CONCLUIDA' ||
    data.status === 'CANCELADA'

  const dataConclusao = finalizada
    ? 'CURRENT_DATE'
    : 'NULL'

  const [result] =
    await db.execute<ResultSetHeader>(
      `
        INSERT INTO ordem_producao (
          id_empresa,
          id_local_estoque,
          id_usuario,
          id_setor,
          numero,
          status,
          data_inicio,
          data_previsao,
          data_conclusao,
          observacao
        )
        VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?,
          ${dataConclusao},
          ?
        )
      `,
      [
        data.id_empresa,
        data.id_local_estoque,
        data.id_usuario,
        data.id_setor,
        data.numero,
        data.status,
        data.data_inicio,
        data.data_previsao,
        data.observacao ?? null,
      ]
    )

  const ordem = await findById(
    result.insertId
  )

  if (!ordem) {
    throw new Error(
      'Erro ao recuperar ordem de produção criada'
    )
  }

  return ordem
}

/**
 * Lista ordens de produção.
 */
export async function findAll(
  filters: OrdemProducaoFilters,
  pagination: OrdemProducaoPagination
): Promise<{
  rows: OrdemProducao[]
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
    filters.status !== undefined
  ) {
    conditions.push(
      'status = ?'
    )

    params.push(
      filters.status
    )
  }

  if (
    filters.dataInicioDe !== undefined
  ) {
    conditions.push(
      'data_inicio >= ?'
    )

    params.push(
      filters.dataInicioDe
    )
  }

  if (
    filters.dataInicioAte !== undefined
  ) {
    conditions.push(
      'data_inicio <= ?'
    )

    params.push(
      filters.dataInicioAte
    )
  }

  const whereClause =
    conditions.length > 0
      ? `WHERE ${conditions.join(' AND ')}`
      : ''

  /**
   * IMPORTANTE:
   * LIMIT e OFFSET não serão enviados como ?
   * para evitar ER_WRONG_ARGUMENTS / errno 1210
   */
  const page = Math.max(
    1,
    Math.trunc(
      Number(pagination.page)
    )
  )

  const limit = Math.min(
    100,
    Math.max(
      1,
      Math.trunc(
        Number(pagination.limit)
      )
    )
  )

  const offset =
    (page - 1) * limit

  const sql = `
    SELECT
      id,
      id_empresa,
      id_local_estoque,
      id_usuario,
      id_setor,
      numero,
      status,
      data_inicio,
      data_previsao,
      data_conclusao,
      observacao
    FROM ordem_producao
    ${whereClause}
    ORDER BY id DESC
    LIMIT ${limit}
    OFFSET ${offset}
  `

  const [rows] =
    await db.execute<OrdemProducaoRow[]>(
      sql,
      params
    )

  const [countRows] =
    await db.execute<CountRow[]>(
      `
        SELECT
          COUNT(*) AS total
        FROM ordem_producao
        ${whereClause}
      `,
      params
    )

  return {
    rows: rows.map(
      mapOrdemProducao
    ),
    count:
      Number(
        countRows[0]?.total ?? 0
      ),
  }
}

/**
 * Busca uma ordem pelo ID.
 */
export async function findById(
  id: number
): Promise<OrdemProducao | null> {
  const [rows] =
    await db.execute<OrdemProducaoRow[]>(
      `
        SELECT
          id,
          id_empresa,
          id_local_estoque,
          id_usuario,
          id_setor,
          numero,
          status,
          data_inicio,
          data_previsao,
          data_conclusao,
          observacao
        FROM ordem_producao
        WHERE id = ?
        LIMIT 1
      `,
      [id]
    )

  const row = rows[0]

  if (!row) {
    return null
  }

  return mapOrdemProducao(row)
}

/**
 * Busca uma ordem pelo número.
 */
export async function findByNumero(
  numero: string
): Promise<OrdemProducao | null> {
  const [rows] =
    await db.execute<OrdemProducaoRow[]>(
      `
        SELECT
          id,
          id_empresa,
          id_local_estoque,
          id_usuario,
          id_setor,
          numero,
          status,
          data_inicio,
          data_previsao,
          data_conclusao,
          observacao
        FROM ordem_producao
        WHERE numero = ?
        LIMIT 1
      `,
      [numero]
    )

  const row = rows[0]

  if (!row) {
    return null
  }

  return mapOrdemProducao(row)
}

/**
 * Atualiza uma ordem de produção.
 */
export async function update(
  id: number,
  data: UpdateOrdemProducaoData
): Promise<OrdemProducao | null> {
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
    data.id_local_estoque !==
    undefined
  ) {
    fields.push(
      'id_local_estoque = ?'
    )

    values.push(
      data.id_local_estoque
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
    data.status !== undefined
  ) {
    fields.push(
      'status = ?'
    )

    values.push(
      data.status
    )

    if (
      data.status ===
        'CONCLUIDA' ||
      data.status ===
        'CANCELADA'
    ) {
      fields.push(
        'data_conclusao = CURRENT_DATE'
      )
    } else {
      fields.push(
        'data_conclusao = NULL'
      )
    }
  }

  if (
    data.data_inicio !== undefined
  ) {
    fields.push(
      'data_inicio = ?'
    )

    values.push(
      data.data_inicio
    )
  }

  if (
    data.data_previsao !== undefined
  ) {
    fields.push(
      'data_previsao = ?'
    )

    values.push(
      data.data_previsao
    )
  }

  if (
    data.observacao !== undefined
  ) {
    fields.push(
      'observacao = ?'
    )

    values.push(
      data.observacao
    )
  }

  if (fields.length === 0) {
    return findById(id)
  }

  values.push(id)

  const [result] =
    await db.execute<ResultSetHeader>(
      `
        UPDATE ordem_producao
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
 * Cancela uma ordem de produção.
 */
export async function cancel(
  id: number
): Promise<boolean> {
  const [result] =
    await db.execute<ResultSetHeader>(
      `
        UPDATE ordem_producao
        SET
          status = 'CANCELADA',
          data_conclusao = CURRENT_DATE
        WHERE id = ?
      `,
      [id]
    )

  return result.affectedRows > 0
}