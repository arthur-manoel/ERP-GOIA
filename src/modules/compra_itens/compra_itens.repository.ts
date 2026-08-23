import type { ResultSetHeader, RowDataPacket } from 'mysql2'
import db from '../../config/database.js'

export interface CompraItem {
  id: number
  id_compra: number
  id_produto: number
  id_cor: number | null
  id_tamanho: number | null
  quantidade: number
  valor_unitario: number
  valor_total: number
}
interface CompraItemRow extends RowDataPacket {
  id: number
  id_compra: number
  id_produto: number
  id_cor: number | null
  id_tamanho: number | null
  quantidade: number
  valor_unitario: string
  valor_total: string
}
interface CountRow extends RowDataPacket { total: number }
export interface CreateCompraItemData extends Omit<CompraItem, 'id'> {}
export interface UpdateCompraItemData {
  id_produto?: number
  id_cor?: number | null
  id_tamanho?: number | null
  quantidade?: number
  valor_unitario?: number
  valor_total?: number
}
export interface CompraItensFilters {
  idCompra?: number
  idProduto?: number
  idCor?: number
  idTamanho?: number
}
export interface CompraItensPagination { page: number; limit: number }

function mapItem(row: CompraItemRow): CompraItem {
  return { ...row, valor_unitario: Number(row.valor_unitario), valor_total: Number(row.valor_total) }
}

export async function create(data: CreateCompraItemData): Promise<CompraItem> {
  const [result] = await db.execute<ResultSetHeader>(
    `INSERT INTO compra_itens
      (id_compra, id_produto, id_cor, id_tamanho, quantidade, valor_unitario, valor_total)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [data.id_compra, data.id_produto, data.id_cor, data.id_tamanho,
      data.quantidade, data.valor_unitario, data.valor_total]
  )
  const item = await findById(result.insertId)
  if (!item) throw new Error('Erro ao recuperar item de compra criado')
  return item
}

export async function findAll(
  filters: CompraItensFilters,
  pagination: CompraItensPagination
): Promise<{ rows: CompraItem[]; count: number }> {
  const conditions: string[] = []
  const params: number[] = []
  const entries: Array<[number | undefined, string]> = [
    [filters.idCompra, 'id_compra'], [filters.idProduto, 'id_produto'],
    [filters.idCor, 'id_cor'], [filters.idTamanho, 'id_tamanho'],
  ]
  for (const [value, column] of entries) {
    if (value !== undefined) { conditions.push(`${column} = ?`); params.push(value) }
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
  const page = Math.max(1, Math.floor(Number(pagination.page)))
  const limit = Math.min(100, Math.max(1, Math.floor(Number(pagination.limit))))
  const offset = (page - 1) * limit
  const [rows] = await db.execute<CompraItemRow[]>(
    `SELECT id, id_compra, id_produto, id_cor, id_tamanho, quantidade, valor_unitario, valor_total
     FROM compra_itens ${where} ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`, params
  )
  const [countRows] = await db.execute<CountRow[]>(
    `SELECT COUNT(*) AS total FROM compra_itens ${where}`, params
  )
  return { rows: rows.map(mapItem), count: countRows[0]?.total ?? 0 }
}

export async function findById(id: number): Promise<CompraItem | null> {
  const [rows] = await db.execute<CompraItemRow[]>(
    `SELECT id, id_compra, id_produto, id_cor, id_tamanho, quantidade, valor_unitario, valor_total
     FROM compra_itens WHERE id = ? LIMIT 1`, [id]
  )
  return rows[0] ? mapItem(rows[0]) : null
}

export async function update(id: number, data: UpdateCompraItemData): Promise<CompraItem | null> {
  const fields: string[] = []
  const values: Array<number | null> = []
  for (const field of ['id_produto', 'id_cor', 'id_tamanho', 'quantidade',
    'valor_unitario', 'valor_total'] as const) {
    if (data[field] !== undefined) { fields.push(`${field} = ?`); values.push(data[field]) }
  }
  if (!fields.length) return findById(id)
  values.push(id)
  const [result] = await db.execute<ResultSetHeader>(
    `UPDATE compra_itens SET ${fields.join(', ')} WHERE id = ?`, values
  )
  return result.affectedRows > 0 ? findById(id) : null
}

export async function deleteCompraItem(id: number): Promise<boolean> {
  const [result] = await db.execute<ResultSetHeader>('DELETE FROM compra_itens WHERE id = ?', [id])
  return result.affectedRows > 0
}
