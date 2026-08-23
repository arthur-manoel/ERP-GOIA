import {
  ResultSetHeader,
  RowDataPacket,
} from 'mysql2'

import db from '../../config/database.js'

export type VendaStatus =
  | 'RASCUNHO'
  | 'CONFIRMADA'
  | 'SEPARACAO'
  | 'FATURADA'
  | 'ENVIADA'
  | 'ENTREGUE'
  | 'CANCELADA'


export interface Venda {
  id: number
  id_empresa: number
  id_cliente: number
  id_usuario: number
  numero: string
  status: VendaStatus
  data_venda: Date
  data_entrega: Date | null
  valor_total: number
}

export interface VendaRow extends RowDataPacket {
  id: number
  id_empresa: number
  id_cliente: number
  id_usuario: number
  numero: string
  status: VendaStatus
  data_venda: Date
  data_entrega: Date | null
  valor_total: string
}

interface CountRow extends RowDataPacket {
  total: number
}

export interface CreateVendaData {
  id_empresa: number
  id_cliente: number
  id_usuario: number
  numero: string
  status: VendaStatus
  data_venda: string
  valor_total: number
}

export interface UpdateVendaData {
  id_empresa?: number
  id_cliente?: number
  id_usuario?: number
  status?: VendaStatus
  data_venda?: string
  valor_total?: number
}

export interface VendaFilters {
  idEmpresa?: number
  idCliente?: number
  status?: VendaStatus
  dataVendaDe?: string
  dataVendaAte?: string
}

export interface VendaPagination {
  page: number
  limit: number
}

function mapVenda(row: VendaRow): Venda {
  return {
    id: row.id,
    id_empresa: row.id_empresa,
    id_cliente: row.id_cliente,
    id_usuario: row.id_usuario,
    numero: row.numero,
    status: row.status,
    data_venda: row.data_venda,
    data_entrega: row.data_entrega,
    valor_total: Number(row.valor_total),
  }
}

export async function create(
  data: CreateVendaData
): Promise<Venda> {
  const entregue = data.status === 'ENTREGUE'

  const [result] = await db.execute<ResultSetHeader>(
    `
      INSERT INTO venda (
        id_empresa,
        id_cliente,
        id_usuario,
        numero,
        status,
        data_venda,
        data_entrega,
        valor_total
      )
      VALUES (
        ?, ?, ?, ?, ?, ?,
        ${entregue ? 'CURRENT_DATE' : 'NULL'},
        ?
      )
    `,
    [
      data.id_empresa,
      data.id_cliente,
      data.id_usuario,
      data.numero,
      data.status,
      data.data_venda,
      data.valor_total,
    ]
  )

  const venda = await findById(result.insertId)

  if (!venda) {
    throw new Error(
      'Erro ao recuperar venda criada'
    )
  }

  return venda
}

export async function findAll(
  filters: VendaFilters,
  pagination: VendaPagination
): Promise<{
  rows: Venda[]
  count: number
}> {
  const conditions: string[] = []

  const params: Array<string | number> = []

  if (filters.idEmpresa !== undefined) {
    conditions.push('id_empresa = ?')
    params.push(filters.idEmpresa)
  }

  if (filters.idCliente !== undefined) {
    conditions.push('id_cliente = ?')
    params.push(filters.idCliente)
  }

  if (filters.status !== undefined) {
    conditions.push('status = ?')
    params.push(filters.status)
  }

  if (filters.dataVendaDe !== undefined) {
    conditions.push('data_venda >= ?')
    params.push(filters.dataVendaDe)
  }

  if (filters.dataVendaAte !== undefined) {
    conditions.push('data_venda <= ?')
    params.push(filters.dataVendaAte)
  }

  const whereClause =
    conditions.length > 0
      ? `WHERE ${conditions.join(' AND ')}`
      : ''

  /*
   * IMPORTANTE:
   * LIMIT e OFFSET não são enviados como parâmetros
   * do prepared statement.
   *
   * Os valores são convertidos e validados antes
   * de serem inseridos na SQL.
   */
  const page = Math.max(
    1,
    Math.floor(Number(pagination.page) || 1)
  )

  const limit = Math.max(
    1,
    Math.floor(Number(pagination.limit) || 10)
  )

  const offset = (page - 1) * limit

  const [rows] = await db.execute<VendaRow[]>(
    `
      SELECT
        id,
        id_empresa,
        id_cliente,
        id_usuario,
        numero,
        status,
        data_venda,
        data_entrega,
        valor_total
      FROM venda
      ${whereClause}
      ORDER BY data_venda DESC, id DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `,
    params
  )

  const [countRows] = await db.execute<CountRow[]>(
    `
      SELECT
        COUNT(*) AS total
      FROM venda
      ${whereClause}
    `,
    params
  )

  return {
    rows: rows.map(mapVenda),
    count: countRows[0]?.total ?? 0,
  }
}

export async function findById(
  id: number
): Promise<Venda | null> {
  const [rows] = await db.execute<VendaRow[]>(
    `
      SELECT
        id,
        id_empresa,
        id_cliente,
        id_usuario,
        numero,
        status,
        data_venda,
        data_entrega,
        valor_total
      FROM venda
      WHERE id = ?
      LIMIT 1
    `,
    [id]
  )

  const row = rows[0]

  if (!row) {
    return null
  }

  return mapVenda(row)
}

export async function findByNumero(
  numero: string
): Promise<Venda | null> {
  const [rows] = await db.execute<VendaRow[]>(
    `
      SELECT
        id,
        id_empresa,
        id_cliente,
        id_usuario,
        numero,
        status,
        data_venda,
        data_entrega,
        valor_total
      FROM venda
      WHERE numero = ?
      LIMIT 1
    `,
    [numero]
  )

  const row = rows[0]

  if (!row) {
    return null
  }

  return mapVenda(row)
}

export async function update(
  id: number,
  data: UpdateVendaData
): Promise<Venda | null> {
  const fields: string[] = []

  const values: Array<string | number> = []

  if (data.id_empresa !== undefined) {
    fields.push('id_empresa = ?')
    values.push(data.id_empresa)
  }

  if (data.id_cliente !== undefined) {
    fields.push('id_cliente = ?')
    values.push(data.id_cliente)
  }

  if (data.id_usuario !== undefined) {
    fields.push('id_usuario = ?')
    values.push(data.id_usuario)
  }

  if (data.status !== undefined) {
    fields.push('status = ?')
    values.push(data.status)

    if (data.status === 'ENTREGUE') {
      fields.push(`
        data_entrega = COALESCE(
          data_entrega,
          CURRENT_DATE
        )
      `)
    }
  }

  if (data.data_venda !== undefined) {
    fields.push('data_venda = ?')
    values.push(data.data_venda)
  }

  if (data.valor_total !== undefined) {
    fields.push('valor_total = ?')
    values.push(data.valor_total)
  }

  if (fields.length === 0) {
    return findById(id)
  }

  values.push(id)

  await db.execute<ResultSetHeader>(
    `
      UPDATE venda
      SET ${fields.join(', ')}
      WHERE id = ?
    `,
    values
  )

  return findById(id)
}

export async function cancel(
  id: number
): Promise<boolean> {
  const [result] =
    await db.execute<ResultSetHeader>(
      `
        UPDATE venda
        SET status = 'CANCELADA'
        WHERE id = ?
          AND status <> 'CANCELADA'
      `,
      [id]
    )

  return result.affectedRows > 0
}
