import type { ResultSetHeader, RowDataPacket } from 'mysql2'
import db from '../../config/database.js'
import type { PEDIDO_COMPRA_STATUS } from './pedido_compra.schema.js'

export type PedidoCompraStatus = typeof PEDIDO_COMPRA_STATUS[number]

export interface PedidoCompra {
  id: number
  id_empresa: number
  id_fornecedor: number
  id_requisicao_compra: number | null
  id_ordem_producao: number | null
  id_usuario: number
  numero: string
  data_pedido: string
  status: PedidoCompraStatus
  observacao: string | null
}

interface PedidoCompraRow extends RowDataPacket, PedidoCompra {}
interface CountRow extends RowDataPacket { total: number }

export interface CreatePedidoCompraData extends Omit<PedidoCompra, 'id'> {}
export interface UpdatePedidoCompraData {
  id_empresa?: number
  id_fornecedor?: number
  id_requisicao_compra?: number | null
  id_ordem_producao?: number | null
  id_usuario?: number
  data_pedido?: string
  status?: PedidoCompraStatus
  observacao?: string | null
}
export interface PedidoCompraFilters {
  idEmpresa?: number
  idFornecedor?: number
  status?: PedidoCompraStatus
  dataPedidoDe?: string
  dataPedidoAte?: string
}
export interface PedidoCompraPagination { page: number; limit: number }

const columns = `id, id_empresa, id_fornecedor, id_requisicao_compra,
  id_ordem_producao, id_usuario, numero, DATE_FORMAT(data_pedido, '%Y-%m-%d') AS data_pedido,
  status, observacao`

function mapPedido(row: PedidoCompraRow): PedidoCompra { return { ...row } }

export async function create(data: CreatePedidoCompraData): Promise<PedidoCompra> {
  const [result] = await db.execute<ResultSetHeader>(
    `INSERT INTO pedido_compra
      (id_empresa, id_fornecedor, id_requisicao_compra, id_ordem_producao,
       id_usuario, numero, data_pedido, status, observacao)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [data.id_empresa, data.id_fornecedor, data.id_requisicao_compra,
      data.id_ordem_producao, data.id_usuario, data.numero, data.data_pedido,
      data.status, data.observacao]
  )
  const pedido = await findById(result.insertId)
  if (!pedido) throw new Error('Erro ao recuperar pedido de compra criado')
  return pedido
}

export async function findAll(
  filters: PedidoCompraFilters,
  pagination: PedidoCompraPagination
): Promise<{ rows: PedidoCompra[]; count: number }> {
  const conditions: string[] = []
  const params: Array<number | string> = []
  if (filters.idEmpresa !== undefined) { conditions.push('id_empresa = ?'); params.push(filters.idEmpresa) }
  if (filters.idFornecedor !== undefined) { conditions.push('id_fornecedor = ?'); params.push(filters.idFornecedor) }
  if (filters.status !== undefined) { conditions.push('status = ?'); params.push(filters.status) }
  if (filters.dataPedidoDe !== undefined) { conditions.push('data_pedido >= ?'); params.push(filters.dataPedidoDe) }
  if (filters.dataPedidoAte !== undefined) { conditions.push('data_pedido <= ?'); params.push(filters.dataPedidoAte) }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
  const page = Math.max(1, Math.floor(Number(pagination.page)))
  const limit = Math.min(100, Math.max(1, Math.floor(Number(pagination.limit))))
  const offset = (page - 1) * limit
  const [rows] = await db.execute<PedidoCompraRow[]>(
    `SELECT ${columns} FROM pedido_compra ${where} ORDER BY data_pedido DESC, id DESC
     LIMIT ${limit} OFFSET ${offset}`,
    params
  )
  const [countRows] = await db.execute<CountRow[]>(
    `SELECT COUNT(*) AS total FROM pedido_compra ${where}`, params
  )
  return { rows: rows.map(mapPedido), count: countRows[0]?.total ?? 0 }
}

export async function findById(id: number): Promise<PedidoCompra | null> {
  const [rows] = await db.execute<PedidoCompraRow[]>(
    `SELECT ${columns} FROM pedido_compra WHERE id = ? LIMIT 1`, [id]
  )
  return rows[0] ? mapPedido(rows[0]) : null
}

export async function findByNumero(numero: string): Promise<PedidoCompra | null> {
  const [rows] = await db.execute<PedidoCompraRow[]>(
    `SELECT ${columns} FROM pedido_compra WHERE numero = ? LIMIT 1`, [numero]
  )
  return rows[0] ? mapPedido(rows[0]) : null
}

export async function update(id: number, data: UpdatePedidoCompraData): Promise<PedidoCompra | null> {
  const fields: string[] = []
  const values: Array<number | string | null> = []
  for (const field of ['id_empresa', 'id_fornecedor', 'id_requisicao_compra',
    'id_ordem_producao', 'id_usuario', 'data_pedido', 'status', 'observacao'] as const) {
    if (data[field] !== undefined) { fields.push(`${field} = ?`); values.push(data[field]) }
  }
  if (!fields.length) return findById(id)
  values.push(id)
  const [result] = await db.execute<ResultSetHeader>(
    `UPDATE pedido_compra SET ${fields.join(', ')} WHERE id = ?`, values
  )
  return result.affectedRows > 0 ? findById(id) : null
}

export async function cancel(id: number): Promise<boolean> {
  const [result] = await db.execute<ResultSetHeader>(
    `UPDATE pedido_compra SET status = 'CANCELADO' WHERE id = ?`, [id]
  )
  return result.affectedRows > 0
}
