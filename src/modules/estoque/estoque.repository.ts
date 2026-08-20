import {
  ResultSetHeader,
  RowDataPacket,
} from 'mysql2'

import db from '../../config/database.js'

export interface Estoque {
  id: number

  id_empresa: number

  id_setor: number

  id_produto: number

  quantidade: number

  quantidade_reservada: number

  data_atualizacao: Date
}

export interface EstoqueRow
  extends RowDataPacket {
  id: number

  id_empresa: number

  id_setor: number

  id_produto: number

  quantidade: number

  quantidade_reservada: number

  data_atualizacao: Date
}

interface CountRow
  extends RowDataPacket {
  total: number
}

export interface CreateEstoqueData {
  id_empresa: number

  id_setor: number

  id_produto: number

  quantidade: number

  quantidade_reservada: number
}

export interface UpdateEstoqueData {
  id_empresa?: number

  id_setor?: number

  id_produto?: number

  quantidade?: number

  quantidade_reservada?: number
}

export interface EstoqueFilters {
  idEmpresa?: number

  idSetor?: number

  idProduto?: number
}

export interface EstoquePagination {
  page: number

  limit: number
}

function mapEstoque(
  row: EstoqueRow
): Estoque {
  return {
    id:
      row.id,

    id_empresa:
      row.id_empresa,

    id_setor:
      row.id_setor,

    id_produto:
      row.id_produto,

    quantidade:
      row.quantidade,

    quantidade_reservada:
      row.quantidade_reservada,

    data_atualizacao:
      row.data_atualizacao,
  }
}

export async function create(
  data: CreateEstoqueData
): Promise<Estoque> {
  const [result] =
    await db.execute<ResultSetHeader>(
      `
        INSERT INTO estoque (
          id_empresa,
          id_setor,
          id_produto,
          quantidade,
          quantidade_reservada
        )
        VALUES (?, ?, ?, ?, ?)
      `,
      [
        data.id_empresa,
        data.id_setor,
        data.id_produto,
        data.quantidade,
        data.quantidade_reservada,
      ]
    )

  const estoque =
    await findById(
      result.insertId
    )

  if (!estoque) {
    throw new Error(
      'Erro ao recuperar estoque criado'
    )
  }

  return estoque
}

export async function findAll(
  filters: EstoqueFilters,
  pagination: EstoquePagination
): Promise<{
  rows: Estoque[]
  count: number
}> {
  const conditions: string[] =
    []

  const params: number[] =
    []

  if (
    filters.idEmpresa !==
    undefined
  ) {
    conditions.push(
      'id_empresa = ?'
    )

    params.push(
      filters.idEmpresa
    )
  }

  if (
    filters.idSetor !==
    undefined
  ) {
    conditions.push(
      'id_setor = ?'
    )

    params.push(
      filters.idSetor
    )
  }

  if (
    filters.idProduto !==
    undefined
  ) {
    conditions.push(
      'id_produto = ?'
    )

    params.push(
      filters.idProduto
    )
  }

  const whereClause =
    conditions.length > 0
      ? `WHERE ${conditions.join(
          ' AND '
        )}`
      : ''

  const offset =
    (
      pagination.page - 1
    ) *
    pagination.limit

  const [rows] =
    await db.execute<
      EstoqueRow[]
    >(
      `
        SELECT
          id,
          id_empresa,
          id_setor,
          id_produto,
          quantidade,
          quantidade_reservada,
          data_atualizacao
        FROM estoque
        ${whereClause}
        ORDER BY id DESC
        LIMIT ?
        OFFSET ?
      `,
      [
        ...params,
        pagination.limit,
        offset,
      ]
    )

  const [countRows] =
    await db.execute<
      CountRow[]
    >(
      `
        SELECT
          COUNT(*) AS total
        FROM estoque
        ${whereClause}
      `,
      params
    )

  return {
    rows:
      rows.map(
        mapEstoque
      ),

    count:
      countRows[0]?.total ??
      0,
  }
}

export async function findById(
  id: number
): Promise<Estoque | null> {
  const [rows] =
    await db.execute<
      EstoqueRow[]
    >(
      `
        SELECT
          id,
          id_empresa,
          id_setor,
          id_produto,
          quantidade,
          quantidade_reservada,
          data_atualizacao
        FROM estoque
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

  return mapEstoque(
    row
  )
}

export async function findByAssociacao(
  idEmpresa: number,
  idSetor: number,
  idProduto: number
): Promise<Estoque | null> {
  const [rows] =
    await db.execute<
      EstoqueRow[]
    >(
      `
        SELECT
          id,
          id_empresa,
          id_setor,
          id_produto,
          quantidade,
          quantidade_reservada,
          data_atualizacao
        FROM estoque
        WHERE id_empresa = ?
          AND id_setor = ?
          AND id_produto = ?
        LIMIT 1
      `,
      [
        idEmpresa,
        idSetor,
        idProduto,
      ]
    )

  const row =
    rows[0]

  if (!row) {
    return null
  }

  return mapEstoque(
    row
  )
}

export async function update(
  id: number,
  data: UpdateEstoqueData
): Promise<Estoque | null> {
  const fields: string[] =
    []

  const values: number[] =
    []

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
    data.id_setor !==
    undefined
  ) {
    fields.push(
      'id_setor = ?'
    )

    values.push(
      data.id_setor
    )
  }

  if (
    data.id_produto !==
    undefined
  ) {
    fields.push(
      'id_produto = ?'
    )

    values.push(
      data.id_produto
    )
  }

  if (
    data.quantidade !==
    undefined
  ) {
    fields.push(
      'quantidade = ?'
    )

    values.push(
      data.quantidade
    )
  }

  if (
    data.quantidade_reservada !==
    undefined
  ) {
    fields.push(
      'quantidade_reservada = ?'
    )

    values.push(
      data.quantidade_reservada
    )
  }

  if (
    fields.length === 0
  ) {
    return findById(id)
  }

  values.push(id)

  const [result] =
    await db.execute<ResultSetHeader>(
      `
        UPDATE estoque
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

export async function deleteEstoque(
  id: number
): Promise<boolean> {
  const [result] =
    await db.execute<ResultSetHeader>(
      `
        DELETE FROM estoque
        WHERE id = ?
      `,
      [
        id,
      ]
    )

  return (
    result.affectedRows > 0
  )
}