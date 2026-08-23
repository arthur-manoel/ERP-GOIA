import {
  ResultSetHeader,
  RowDataPacket,
} from 'mysql2'

import db from '../../config/database.js'

export type LocalEstoqueStatus =
  | 'ATIVO'
  | 'INATIVO'

export interface LocalEstoque {
  id: number

  id_empresa: number

  nome: string

  descricao:
    string | null

  status:
    LocalEstoqueStatus
}

export interface LocalEstoqueRow
  extends RowDataPacket {
  id: number

  id_empresa: number

  nome: string

  descricao:
    string | null

  status:
    LocalEstoqueStatus
}

interface CountRow
  extends RowDataPacket {
  total: number
}

export interface CreateLocalEstoqueData {
  id_empresa: number

  nome: string

  descricao?:
    string | null

  status:
    LocalEstoqueStatus
}

export interface UpdateLocalEstoqueData {
  id_empresa?: number

  nome?: string

  descricao?:
    string | null

  status?:
    LocalEstoqueStatus
}

export interface LocaisEstoqueFilters {
  idEmpresa?: number

  status?:
    LocalEstoqueStatus
}

export interface LocaisEstoquePagination {
  page: number

  limit: number
}

function mapLocalEstoque(
  row: LocalEstoqueRow
): LocalEstoque {
  return {
    id:
      row.id,

    id_empresa:
      row.id_empresa,

    nome:
      row.nome,

    descricao:
      row.descricao,

    status:
      row.status,
  }
}

export async function create(
  data:
    CreateLocalEstoqueData
): Promise<LocalEstoque> {
  const [result] =
    await db.execute<ResultSetHeader>(
      `
        INSERT INTO locais_estoque (
          id_empresa,
          nome,
          descricao,
          status
        )
        VALUES (?, ?, ?, ?)
      `,
      [
        data.id_empresa,
        data.nome,
        data.descricao ??
          null,
        data.status,
      ]
    )

  const localEstoque =
    await findById(
      result.insertId
    )

  if (!localEstoque) {
    throw new Error(
      'Erro ao recuperar local de estoque criado'
    )
  }

  return localEstoque
}

export async function findAll(
  filters: LocaisEstoqueFilters,
  pagination: LocaisEstoquePagination
): Promise<{
  rows: LocalEstoque[]
  count: number
}> {
  const conditions: string[] = []

  const params: Array<string | number> = []

  if (filters.idEmpresa !== undefined) {
    conditions.push('id_empresa = ?')
    params.push(filters.idEmpresa)
  }

  if (filters.status !== undefined) {
    conditions.push('status = ?')
    params.push(filters.status)
  }

  const whereClause =
    conditions.length > 0
      ? `WHERE ${conditions.join(' AND ')}`
      : ''

  // Garante que os valores sejam inteiros válidos
  const page = Math.max(
    1,
    Math.floor(Number(pagination.page) || 1)
  )

  const limit = Math.max(
    1,
    Math.floor(Number(pagination.limit) || 10)
  )

  const offset = (page - 1) * limit

  const [rows] = await db.execute<LocalEstoqueRow[]>(
    `
      SELECT
        id,
        id_empresa,
        nome,
        descricao,
        status
      FROM locais_estoque
      ${whereClause}
      ORDER BY id DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `,
    params
  )

  const [countRows] = await db.execute<CountRow[]>(
    `
      SELECT
        COUNT(*) AS total
      FROM locais_estoque
      ${whereClause}
    `,
    params
  )

  return {
    rows: rows.map(mapLocalEstoque),
    count: countRows[0]?.total ?? 0,
  }
}

export async function findById(
  id: number
): Promise<
  LocalEstoque | null
> {
  const [rows] =
    await db.execute<
      LocalEstoqueRow[]
    >(
      `
        SELECT
          id,
          id_empresa,
          nome,
          descricao,
          status
        FROM locais_estoque
        WHERE id = ?
        LIMIT 1
      `,
      [
        id,
      ]
    )

  const row =
    rows[0]

  if (!row) {
    return null
  }

  return mapLocalEstoque(
    row
  )
}

export async function update(
  id: number,
  data:
    UpdateLocalEstoqueData
): Promise<
  LocalEstoque | null
> {
  const fields: string[] =
    []

  const values: Array<
    string |
    number |
    null
  > = []

  if (
    data.id_empresa !==
    undefined
  ) {
    fields.push(
      'id_empresa = ?'
    )

    values.push(
      data.id_empresa
    )
  }

  if (
    data.nome !==
    undefined
  ) {
    fields.push(
      'nome = ?'
    )

    values.push(
      data.nome
    )
  }

  if (
    data.descricao !==
    undefined
  ) {
    fields.push(
      'descricao = ?'
    )

    values.push(
      data.descricao
    )
  }

  if (
    data.status !==
    undefined
  ) {
    fields.push(
      'status = ?'
    )

    values.push(
      data.status
    )
  }

  if (
    fields.length === 0
  ) {
    return findById(id)
  }

  values.push(id)

  await db.execute<ResultSetHeader>(
    `
      UPDATE locais_estoque
      SET ${fields.join(', ')}
      WHERE id = ?
    `,
    values
  )

  return findById(id)
}

export async function softDelete(
  id: number
): Promise<boolean> {
  const [result] =
    await db.execute<ResultSetHeader>(
      `
        UPDATE locais_estoque
        SET status = 'INATIVO'
        WHERE id = ?
          AND status <> 'INATIVO'
      `,
      [
        id,
      ]
    )

  return (
    result.affectedRows >
    0
  )
}