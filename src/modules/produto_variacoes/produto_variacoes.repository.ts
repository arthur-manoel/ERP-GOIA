import type { ResultSetHeader, RowDataPacket } from 'mysql2'
import db from '../../config/database.js'
import type { PRODUTO_VARIACAO_STATUS } from './produto_variacoes.schema.js'

export type ProdutoVariacaoStatus = typeof PRODUTO_VARIACAO_STATUS[number]
export interface ProdutoVariacao {
  id: number
  id_empresa: number
  id_produto: number
  id_cor: number | null
  id_tamanho: number | null
  status: ProdutoVariacaoStatus
}
interface ProdutoVariacaoRow extends RowDataPacket, ProdutoVariacao {}
interface CountRow extends RowDataPacket { total: number }
export interface CreateProdutoVariacaoData extends Omit<ProdutoVariacao, 'id'> {}
export interface UpdateProdutoVariacaoData {
  id_empresa?: number
  id_produto?: number
  id_cor?: number | null
  id_tamanho?: number | null
  status?: ProdutoVariacaoStatus
}
export interface ProdutoVariacoesFilters {
  idEmpresa?: number
  idProduto?: number
  idCor?: number
  idTamanho?: number
  status?: ProdutoVariacaoStatus
}
export interface ProdutoVariacoesPagination { page: number; limit: number }

const columns = 'id, id_empresa, id_produto, id_cor, id_tamanho, status'

export async function create(data: CreateProdutoVariacaoData): Promise<ProdutoVariacao> {
  const [result] = await db.execute<ResultSetHeader>(
    `INSERT INTO produto_variacoes (id_empresa, id_produto, id_cor, id_tamanho, status)
     VALUES (?, ?, ?, ?, ?)`,
    [data.id_empresa, data.id_produto, data.id_cor, data.id_tamanho, data.status]
  )
  const variacao = await findById(result.insertId)
  if (!variacao) throw new Error('Erro ao recuperar variação de produto criada')
  return variacao
}

export async function findAll(
  filters: ProdutoVariacoesFilters,
  pagination: ProdutoVariacoesPagination
): Promise<{ rows: ProdutoVariacao[]; count: number }> {
  const conditions: string[] = []
  const params: Array<number | string> = []
  const entries: Array<[number | string | undefined, string]> = [
    [filters.idEmpresa, 'id_empresa'], [filters.idProduto, 'id_produto'],
    [filters.idCor, 'id_cor'], [filters.idTamanho, 'id_tamanho'], [filters.status, 'status'],
  ]
  for (const [value, column] of entries) {
    if (value !== undefined) { conditions.push(`${column} = ?`); params.push(value) }
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
  const page = Math.max(1, Math.floor(Number(pagination.page)))
  const limit = Math.min(100, Math.max(1, Math.floor(Number(pagination.limit))))
  const offset = (page - 1) * limit
  const [rows] = await db.execute<ProdutoVariacaoRow[]>(
    `SELECT ${columns} FROM produto_variacoes ${where} ORDER BY id DESC
     LIMIT ${limit} OFFSET ${offset}`, params
  )
  const [countRows] = await db.execute<CountRow[]>(
    `SELECT COUNT(*) AS total FROM produto_variacoes ${where}`, params
  )
  return { rows: rows.map((row) => ({ ...row })), count: countRows[0]?.total ?? 0 }
}

export async function findById(id: number): Promise<ProdutoVariacao | null> {
  const [rows] = await db.execute<ProdutoVariacaoRow[]>(
    `SELECT ${columns} FROM produto_variacoes WHERE id = ? LIMIT 1`, [id]
  )
  return rows[0] ? { ...rows[0] } : null
}

export async function findByCombination(
  idProduto: number, idCor: number | null, idTamanho: number | null, excludeId?: number
): Promise<ProdutoVariacao | null> {
  const exclude = excludeId === undefined ? '' : 'AND id <> ?'
  const params = excludeId === undefined
    ? [idProduto, idCor, idTamanho]
    : [idProduto, idCor, idTamanho, excludeId]
  const [rows] = await db.execute<ProdutoVariacaoRow[]>(
    `SELECT ${columns} FROM produto_variacoes
     WHERE id_produto = ? AND id_cor <=> ? AND id_tamanho <=> ? ${exclude} LIMIT 1`, params
  )
  return rows[0] ? { ...rows[0] } : null
}

export async function update(
  id: number, data: UpdateProdutoVariacaoData
): Promise<ProdutoVariacao | null> {
  const fields: string[] = []
  const values: Array<number | string | null> = []
  for (const field of ['id_empresa', 'id_produto', 'id_cor', 'id_tamanho', 'status'] as const) {
    if (data[field] !== undefined) { fields.push(`${field} = ?`); values.push(data[field]) }
  }
  if (!fields.length) return findById(id)
  values.push(id)
  const [result] = await db.execute<ResultSetHeader>(
    `UPDATE produto_variacoes SET ${fields.join(', ')} WHERE id = ?`, values
  )
  return result.affectedRows > 0 ? findById(id) : null
}

export async function deleteProdutoVariacao(id: number): Promise<boolean> {
  const [result] = await db.execute<ResultSetHeader>(
    `UPDATE produto_variacoes SET status = 'INATIVO' WHERE id = ?`, [id]
  )
  return result.affectedRows > 0
}
