import type { ResultSetHeader, RowDataPacket } from 'mysql2'
import db from '../../config/database.js'

export interface ItemRequisicaoCompra {
  id: number
  id_requisicao_compra: number
  id_produto: number
  quantidade: number
  observacao: string | null
}

interface ItemRequisicaoCompraRow extends RowDataPacket, ItemRequisicaoCompra {}
interface CountRow extends RowDataPacket { total: number }

export interface CreateItemRequisicaoCompraData {
  id_requisicao_compra: number
  id_produto: number
  quantidade: number
  observacao?: string | null
}

export interface UpdateItemRequisicaoCompraData {
  id_produto?: number
  quantidade?: number
  observacao?: string | null
}

export interface ItemRequisicaoCompraFilters {
  idRequisicaoCompra?: number
  idProduto?: number
}

export interface ItemRequisicaoCompraPagination { page: number; limit: number }

function mapItem(row: ItemRequisicaoCompraRow): ItemRequisicaoCompra {
  return {
    id: row.id,
    id_requisicao_compra: row.id_requisicao_compra,
    id_produto: row.id_produto,
    quantidade: row.quantidade,
    observacao: row.observacao,
  }
}

export async function create(data: CreateItemRequisicaoCompraData): Promise<ItemRequisicaoCompra> {
  const [result] = await db.execute<ResultSetHeader>(
    `INSERT INTO item_requisicao_compra
      (id_requisicao_compra, id_produto, quantidade, observacao)
     VALUES (?, ?, ?, ?)`,
    [data.id_requisicao_compra, data.id_produto, data.quantidade, data.observacao ?? null]
  )
  const item = await findById(result.insertId)
  if (!item) throw new Error('Erro ao recuperar item da requisição de compra criado')
  return item
}

export async function findAll(
  filters: ItemRequisicaoCompraFilters,
  pagination: ItemRequisicaoCompraPagination
): Promise<{ rows: ItemRequisicaoCompra[]; count: number }> {
  const conditions: string[] = []
  const params: number[] = []

  if (filters.idRequisicaoCompra !== undefined) {
    conditions.push('id_requisicao_compra = ?')
    params.push(filters.idRequisicaoCompra)
  }
  if (filters.idProduto !== undefined) {
    conditions.push('id_produto = ?')
    params.push(filters.idProduto)
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
  const page = Math.max(1, Math.floor(Number(pagination.page)))
  const limit = Math.min(100, Math.max(1, Math.floor(Number(pagination.limit))))
  const offset = (page - 1) * limit

  const [rows] = await db.execute<ItemRequisicaoCompraRow[]>(
    `SELECT id, id_requisicao_compra, id_produto, quantidade, observacao
     FROM item_requisicao_compra ${where} ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`,
    params
  )
  const [countRows] = await db.execute<CountRow[]>(
    `SELECT COUNT(*) AS total FROM item_requisicao_compra ${where}`,
    params
  )
  return { rows: rows.map(mapItem), count: countRows[0]?.total ?? 0 }
}

export async function findById(id: number): Promise<ItemRequisicaoCompra | null> {
  const [rows] = await db.execute<ItemRequisicaoCompraRow[]>(
    `SELECT id, id_requisicao_compra, id_produto, quantidade, observacao
     FROM item_requisicao_compra WHERE id = ? LIMIT 1`,
    [id]
  )
  return rows[0] ? mapItem(rows[0]) : null
}

export async function update(
  id: number,
  data: UpdateItemRequisicaoCompraData
): Promise<ItemRequisicaoCompra | null> {
  const fields: string[] = []
  const values: Array<number | string | null> = []

  if (data.id_produto !== undefined) {
    fields.push('id_produto = ?')
    values.push(data.id_produto)
  }
  if (data.quantidade !== undefined) {
    fields.push('quantidade = ?')
    values.push(data.quantidade)
  }
  if (data.observacao !== undefined) {
    fields.push('observacao = ?')
    values.push(data.observacao)
  }

  if (!fields.length) return findById(id)
  values.push(id)
  const [result] = await db.execute<ResultSetHeader>(
    `UPDATE item_requisicao_compra SET ${fields.join(', ')} WHERE id = ?`,
    values
  )
  return result.affectedRows > 0 ? findById(id) : null
}

export async function deleteItemRequisicaoCompra(id: number): Promise<boolean> {
  const [result] = await db.execute<ResultSetHeader>(
    'DELETE FROM item_requisicao_compra WHERE id = ?',
    [id]
  )
  return result.affectedRows > 0
}
