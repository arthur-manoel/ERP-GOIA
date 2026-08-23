import {
  ResultSetHeader,
  RowDataPacket,
} from 'mysql2'

import db from '../../config/database.js'

export interface ConsumoProducao {
  id: number

  id_ordem_producao: number

  id_necessidade_producao: number

  id_reserva_estoque: number

  id_produto: number

  id_setor: number

  quantidade: number

  data_consumo: Date

  id_usuario: number
}

export interface ConsumoProducaoRow
  extends RowDataPacket {
  id: number

  id_ordem_producao: number

  id_necessidade_producao: number

  id_reserva_estoque: number

  id_produto: number

  id_setor: number

  quantidade: number

  data_consumo: Date

  id_usuario: number
}

interface CountRow
  extends RowDataPacket {
  total: number
}

interface SumQuantidadeRow
  extends RowDataPacket {
  total: number | string
}

export interface ReservaEstoqueContexto
  extends RowDataPacket {
  id: number

  id_setor: number

  id_produto: number

  id_ordem_producao:
    number | null

  id_necessidade_producao:
    number | null

  quantidade: number

  status: string
}

export interface NecessidadeProducaoContexto
  extends RowDataPacket {
  id: number

  id_ordem_producao: number

  id_produto: number

  quantidade_necessaria: number

  quantidade_reservada: number

  quantidade_consumida: number

  status: string
}

export interface CreateConsumoProducaoData {
  id_ordem_producao: number

  id_necessidade_producao: number

  id_reserva_estoque: number

  id_produto: number

  id_setor: number

  quantidade: number

  id_usuario: number
}

export interface UpdateConsumoProducaoData {
  id_ordem_producao?: number

  id_necessidade_producao?: number

  id_reserva_estoque?: number

  id_produto?: number

  id_setor?: number

  quantidade?: number

  id_usuario?: number
}

export interface ConsumoProducaoFilters {
  idOrdemProducao?: number

  idNecessidadeProducao?: number

  idReservaEstoque?: number

  idProduto?: number

  idSetor?: number
}

export interface ConsumoProducaoPagination {
  page: number

  limit: number
}

function mapConsumoProducao(
  row: ConsumoProducaoRow
): ConsumoProducao {
  return {
    id:
      row.id,

    id_ordem_producao:
      row.id_ordem_producao,

    id_necessidade_producao:
      row.id_necessidade_producao,

    id_reserva_estoque:
      row.id_reserva_estoque,

    id_produto:
      row.id_produto,

    id_setor:
      row.id_setor,

    quantidade:
      row.quantidade,

    data_consumo:
      row.data_consumo,

    id_usuario:
      row.id_usuario,
  }
}

export async function create(
  data:
    CreateConsumoProducaoData
): Promise<ConsumoProducao> {
  const [result] =
    await db.execute<ResultSetHeader>(
      `
        INSERT INTO consumo_producao (
          id_ordem_producao,
          id_necessidade_producao,
          id_reserva_estoque,
          id_produto,
          id_setor,
          quantidade,
          id_usuario
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        data.id_ordem_producao,
        data.id_necessidade_producao,
        data.id_reserva_estoque,
        data.id_produto,
        data.id_setor,
        data.quantidade,
        data.id_usuario,
      ]
    )

  const consumo =
    await findById(
      result.insertId
    )

  if (!consumo) {
    throw new Error(
      'Erro ao recuperar consumo de produção criado'
    )
  }

  return consumo
}

export async function findAll(
  filters: ConsumoProducaoFilters,
  pagination: ConsumoProducaoPagination
): Promise<{
  rows: ConsumoProducao[]
  count: number
}> {
  const conditions: string[] = []

  const params: number[] = []

  if (filters.idOrdemProducao !== undefined) {
    conditions.push('id_ordem_producao = ?')
    params.push(filters.idOrdemProducao)
  }

  if (filters.idNecessidadeProducao !== undefined) {
    conditions.push('id_necessidade_producao = ?')
    params.push(filters.idNecessidadeProducao)
  }

  if (filters.idReservaEstoque !== undefined) {
    conditions.push('id_reserva_estoque = ?')
    params.push(filters.idReservaEstoque)
  }

  if (filters.idProduto !== undefined) {
    conditions.push('id_produto = ?')
    params.push(filters.idProduto)
  }

  if (filters.idSetor !== undefined) {
    conditions.push('id_setor = ?')
    params.push(filters.idSetor)
  }

  const whereClause =
    conditions.length > 0
      ? `WHERE ${conditions.join(' AND ')}`
      : ''

  // Normaliza e valida a paginação
  const page = Math.max(
    1,
    Math.floor(Number(pagination.page) || 1)
  )

  const limit = Math.max(
    1,
    Math.floor(Number(pagination.limit) || 10)
  )

  const offset = (page - 1) * limit

  const [rows] = await db.execute<ConsumoProducaoRow[]>(
    `
      SELECT
        id,
        id_ordem_producao,
        id_necessidade_producao,
        id_reserva_estoque,
        id_produto,
        id_setor,
        quantidade,
        data_consumo,
        id_usuario
      FROM consumo_producao
      ${whereClause}
      ORDER BY data_consumo DESC, id DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `,
    params
  )

  const [countRows] = await db.execute<CountRow[]>(
    `
      SELECT
        COUNT(*) AS total
      FROM consumo_producao
      ${whereClause}
    `,
    params
  )

  return {
    rows: rows.map(mapConsumoProducao),
    count: countRows[0]?.total ?? 0,
  }
}

export async function findById(
  id: number
): Promise<
  ConsumoProducao | null
> {
  const [rows] =
    await db.execute<
      ConsumoProducaoRow[]
    >(
      `
        SELECT
          id,
          id_ordem_producao,
          id_necessidade_producao,
          id_reserva_estoque,
          id_produto,
          id_setor,
          quantidade,
          data_consumo,
          id_usuario
        FROM consumo_producao
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

  return mapConsumoProducao(
    row
  )
}

export async function findReservaById(
  id: number
): Promise<
  ReservaEstoqueContexto | null
> {
  const [rows] =
    await db.execute<
      ReservaEstoqueContexto[]
    >(
      `
        SELECT
          id,
          id_setor,
          id_produto,
          id_ordem_producao,
          id_necessidade_producao,
          quantidade,
          status
        FROM reserva_estoque
        WHERE id = ?
        LIMIT 1
      `,
      [
        id,
      ]
    )

  return rows[0] ?? null
}

export async function findNecessidadeById(
  id: number
): Promise<
  NecessidadeProducaoContexto | null
> {
  const [rows] =
    await db.execute<
      NecessidadeProducaoContexto[]
    >(
      `
        SELECT
          id,
          id_ordem_producao,
          id_produto,
          quantidade_necessaria,
          quantidade_reservada,
          quantidade_consumida,
          status
        FROM necessidade_producao
        WHERE id = ?
        LIMIT 1
      `,
      [
        id,
      ]
    )

  return rows[0] ?? null
}

export async function sumQuantidadeByReserva(
  idReservaEstoque: number,
  excludeId?: number
): Promise<number> {
  const conditions: string[] = [
    'id_reserva_estoque = ?',
  ]

  const params: number[] = [
    idReservaEstoque,
  ]

  if (
    excludeId !==
    undefined
  ) {
    conditions.push(
      'id <> ?'
    )

    params.push(
      excludeId
    )
  }

  const [rows] =
    await db.execute<
      SumQuantidadeRow[]
    >(
      `
        SELECT
          COALESCE(
            SUM(quantidade),
            0
          ) AS total
        FROM consumo_producao
        WHERE ${conditions.join(
          ' AND '
        )}
      `,
      params
    )

  return Number(
    rows[0]?.total ?? 0
  )
}

export async function update(
  id: number,
  data:
    UpdateConsumoProducaoData
): Promise<
  ConsumoProducao | null
> {
  const fields: string[] =
    []

  const values: number[] =
    []

  if (
    data.id_ordem_producao !==
    undefined
  ) {
    fields.push(
      'id_ordem_producao = ?'
    )

    values.push(
      data.id_ordem_producao
    )
  }

  if (
    data.id_necessidade_producao !==
    undefined
  ) {
    fields.push(
      'id_necessidade_producao = ?'
    )

    values.push(
      data.id_necessidade_producao
    )
  }

  if (
    data.id_reserva_estoque !==
    undefined
  ) {
    fields.push(
      'id_reserva_estoque = ?'
    )

    values.push(
      data.id_reserva_estoque
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
    data.id_usuario !==
    undefined
  ) {
    fields.push(
      'id_usuario = ?'
    )

    values.push(
      data.id_usuario
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
      UPDATE consumo_producao
      SET ${fields.join(', ')}
      WHERE id = ?
    `,
    values
  )

  return findById(id)
}

export async function deleteConsumoProducao(
  id: number
): Promise<boolean> {
  const [result] =
    await db.execute<ResultSetHeader>(
      `
        DELETE FROM consumo_producao
        WHERE id = ?
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