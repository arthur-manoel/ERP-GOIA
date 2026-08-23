import type { ResultSetHeader, RowDataPacket } from 'mysql2'
import db from '../../config/database.js'

export interface ItemPedidoCompra {
  id: number
  id_pedido_compra: number
  id_produto: number
  quantidade: number
  valor_unitario: number
  valor_total: number
}

interface ItemPedidoCompraRow extends RowDataPacket {
  id: number
  id_pedido_compra: number
  id_produto: number
  quantidade: number
  valor_unitario: string
  valor_total: string
}

interface CountRow extends RowDataPacket { total: number }

export interface CreateItemPedidoCompraData {
  id_pedido_compra: number
  id_produto: number
  quantidade: number
  valor_unitario: number
  valor_total: number
}

export interface UpdateItemPedidoCompraData {
  id_produto?: number
  quantidade?: number
  valor_unitario?: number
  valor_total?: number
}

export interface ItemPedidoCompraFilters {
  idPedidoCompra?: number
  idProduto?: number
}

export interface ItemPedidoCompraPagination { page: number; limit: number }

function mapItem(row: ItemPedidoCompraRow): ItemPedidoCompra {
  return {
    id: row.id,
    id_pedido_compra: row.id_pedido_compra,
    id_produto: row.id_produto,
    quantidade: row.quantidade,
    valor_unitario: Number(row.valor_unitario),
    valor_total: Number(row.valor_total),
  }
}

export async function create(data: CreateItemPedidoCompraData): Promise<ItemPedidoCompra> {
  const [result] = await db.execute<ResultSetHeader>(
    `INSERT INTO item_pedido_compra
      (id_pedido_compra, id_produto, quantidade, valor_unitario, valor_total)
     VALUES (?, ?, ?, ?, ?)`,
    [data.id_pedido_compra, data.id_produto, data.quantidade, data.valor_unitario, data.valor_total]
  )
  const item = await findById(result.insertId)
  if (!item) throw new Error('Erro ao recuperar item do pedido de compra criado')
  return item
}

export async function findAll(
  filters: ItemPedidoCompraFilters,
  pagination: ItemPedidoCompraPagination
): Promise<{ rows: ItemPedidoCompra[]; count: number }> {
  const conditions: string[] = []
  const params: number[] = []

  if (filters.idPedidoCompra !== undefined) {
    conditions.push('id_pedido_compra = ?')
    params.push(filters.idPedidoCompra)
  }
  if (filters.idProduto !== undefined) {
    conditions.push('id_produto = ?')
    params.push(filters.idProduto)
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
  const page = Math.max(1, Math.floor(Number(pagination.page)))
  const limit = Math.min(100, Math.max(1, Math.floor(Number(pagination.limit))))
  const offset = (page - 1) * limit

  const [rows] = await db.execute<ItemPedidoCompraRow[]>(
    `SELECT id, id_pedido_compra, id_produto, quantidade, valor_unitario, valor_total
     FROM item_pedido_compra ${where} ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`,
    params
  )
  const [countRows] = await db.execute<CountRow[]>(
    `SELECT COUNT(*) AS total FROM item_pedido_compra ${where}`,
    params
  )
  return { rows: rows.map(mapItem), count: countRows[0]?.total ?? 0 }
}

export async function findById(id: number): Promise<ItemPedidoCompra | null> {
  const [rows] = await db.execute<ItemPedidoCompraRow[]>(
    `SELECT id, id_pedido_compra, id_produto, quantidade, valor_unitario, valor_total
     FROM item_pedido_compra WHERE id = ? LIMIT 1`,
    [id]
  )
  return rows[0] ? mapItem(rows[0]) : null
}

export async function update(
  id: number,
  data: UpdateItemPedidoCompraData
): Promise<ItemPedidoCompra | null> {
  const fields: string[] = []
  const values: number[] = []
  for (const field of ['id_produto', 'quantidade', 'valor_unitario', 'valor_total'] as const) {
    if (data[field] !== undefined) {
      fields.push(`${field} = ?`)
      values.push(data[field])
    }
  }
  if (!fields.length) return findById(id)
  values.push(id)
  const [result] = await db.execute<ResultSetHeader>(
    `UPDATE item_pedido_compra SET ${fields.join(', ')} WHERE id = ?`,
    values
  )
  return result.affectedRows > 0 ? findById(id) : null
}

export async function deleteItemPedidoCompra(id: number): Promise<boolean> {
  const [result] = await db.execute<ResultSetHeader>(
    'DELETE FROM item_pedido_compra WHERE id = ?',
    [id]
  )
  return result.affectedRows > 0
}
