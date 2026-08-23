import type { ResultSetHeader, RowDataPacket } from 'mysql2'
import db from '../../config/database.js'
import type { REQUISICAO_COMPRA_STATUS } from './requisicao_compra.schema.js'

export type RequisicaoCompraStatus = typeof REQUISICAO_COMPRA_STATUS[number]

export interface RequisicaoCompra {
  id: number
  id_empresa: number
  id_local_estoque: number
  id_setor_solicitante: number
  id_usuario_solicitante: number
  numero: string
  status: RequisicaoCompraStatus
  data_solicitacao: string
  observacao: string | null
}

interface RequisicaoCompraRow extends RowDataPacket, RequisicaoCompra {}
interface CountRow extends RowDataPacket { total: number }

export interface CreateRequisicaoCompraData
  extends Omit<RequisicaoCompra, 'id'> {}

export interface UpdateRequisicaoCompraData {
  id_empresa?: number
  id_local_estoque?: number
  id_setor_solicitante?: number
  id_usuario_solicitante?: number
  status?: RequisicaoCompraStatus
  data_solicitacao?: string
  observacao?: string | null
}

export interface RequisicaoCompraFilters {
  idEmpresa?: number
  idSetorSolicitante?: number
  status?: RequisicaoCompraStatus
  dataSolicitacaoDe?: string
  dataSolicitacaoAte?: string
}

export interface RequisicaoCompraPagination {
  page: number
  limit: number
}

const columns = `
  id,
  id_empresa,
  id_local_estoque,
  id_setor_solicitante,
  id_usuario_solicitante,
  numero,
  status,
  DATE_FORMAT(data_solicitacao, '%Y-%m-%d') AS data_solicitacao,
  observacao
`

export async function create(
  data: CreateRequisicaoCompraData
): Promise<RequisicaoCompra> {
  const [result] = await db.execute<ResultSetHeader>(
    `INSERT INTO requisicao_compra
      (
        id_empresa,
        id_local_estoque,
        id_setor_solicitante,
        id_usuario_solicitante,
        numero,
        status,
        data_solicitacao,
        observacao
      )
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.id_empresa,
      data.id_local_estoque,
      data.id_setor_solicitante,
      data.id_usuario_solicitante,
      data.numero,
      data.status,
      data.data_solicitacao,
      data.observacao
    ]
  )

  const requisicao = await findById(result.insertId)

  if (!requisicao) {
    throw new Error('Erro ao recuperar requisição de compra criada')
  }

  return requisicao
}

export async function findAll(
  filters: RequisicaoCompraFilters,
  pagination: RequisicaoCompraPagination
): Promise<{ rows: RequisicaoCompra[]; count: number }> {
  const conditions: string[] = []
  const params: Array<number | string> = []

  if (filters.idEmpresa !== undefined) {
    conditions.push('id_empresa = ?')
    params.push(filters.idEmpresa)
  }

  if (filters.idSetorSolicitante !== undefined) {
    conditions.push('id_setor_solicitante = ?')
    params.push(filters.idSetorSolicitante)
  }

  if (filters.status !== undefined) {
    conditions.push('status = ?')
    params.push(filters.status)
  }

  if (filters.dataSolicitacaoDe !== undefined) {
    conditions.push('data_solicitacao >= ?')
    params.push(filters.dataSolicitacaoDe)
  }

  if (filters.dataSolicitacaoAte !== undefined) {
    conditions.push('data_solicitacao <= ?')
    params.push(filters.dataSolicitacaoAte)
  }

  const where = conditions.length
    ? `WHERE ${conditions.join(' AND ')}`
    : ''

  const page = Math.max(
    1,
    Math.floor(Number(pagination.page))
  )

  const limit = Math.min(
    100,
    Math.max(1, Math.floor(Number(pagination.limit)))
  )

  const offset = (page - 1) * limit

  const [rows] = await db.execute<RequisicaoCompraRow[]>(
    `SELECT ${columns}
     FROM requisicao_compra
     ${where}
     ORDER BY data_solicitacao DESC, id DESC
     LIMIT ${limit} OFFSET ${offset}`,
    params
  )

  const [countRows] = await db.execute<CountRow[]>(
    `SELECT COUNT(*) AS total
     FROM requisicao_compra
     ${where}`,
    params
  )

  return {
    rows: rows.map((row) => ({ ...row })),
    count: countRows[0]?.total ?? 0
  }
}

export async function findById(
  id: number
): Promise<RequisicaoCompra | null> {
  const [rows] = await db.execute<RequisicaoCompraRow[]>(
    `SELECT ${columns}
     FROM requisicao_compra
     WHERE id = ?
     LIMIT 1`,
    [id]
  )

  return rows[0] ? { ...rows[0] } : null
}

export async function findByNumero(
  numero: string
): Promise<RequisicaoCompra | null> {
  const [rows] = await db.execute<RequisicaoCompraRow[]>(
    `SELECT ${columns}
     FROM requisicao_compra
     WHERE numero = ?
     LIMIT 1`,
    [numero]
  )

  return rows[0] ? { ...rows[0] } : null
}

export async function update(
  id: number,
  data: UpdateRequisicaoCompraData
): Promise<RequisicaoCompra | null> {
  const fields: string[] = []
  const values: Array<number | string | null> = []

  for (
    const field of [
      'id_empresa',
      'id_local_estoque',
      'id_setor_solicitante',
      'id_usuario_solicitante',
      'status',
      'data_solicitacao',
      'observacao'
    ] as const
  ) {
    if (data[field] !== undefined) {
      fields.push(`${field} = ?`)
      values.push(data[field])
    }
  }

  if (!fields.length) {
    return findById(id)
  }

  values.push(id)

  const [result] = await db.execute<ResultSetHeader>(
    `UPDATE requisicao_compra
     SET ${fields.join(', ')}
     WHERE id = ?`,
    values
  )

  return result.affectedRows > 0
    ? findById(id)
    : null
}

export async function cancel(id: number): Promise<boolean> {
  const [result] = await db.execute<ResultSetHeader>(
    `UPDATE requisicao_compra
     SET status = 'CANCELADA'
     WHERE id = ?`,
    [id]
  )

  return result.affectedRows > 0
}
