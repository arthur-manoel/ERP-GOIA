import {
  ResultSetHeader,
  RowDataPacket,
} from 'mysql2'

import db from '../../config/database.js'

export type ProdutoFornecedorStatus =
  | 'ATIVO'
  | 'INATIVO'
  | 'SUSPENSO'

export interface ProdutoFornecedor {
  id: number

  id_empresa: number

  id_produto: number

  codigo_produto_fornecedor: string

  preco_ultima_compra: number

  prazo_entrega_dias: number

  quantidade_minima: number

  fornecedor_principal: boolean

  status:
    ProdutoFornecedorStatus
}

export interface ProdutoFornecedorRow
  extends RowDataPacket {
  id: number

  id_empresa: number

  id_produto: number

  codigo_produto_fornecedor: string

  preco_ultima_compra: string

  prazo_entrega_dias: number

  quantidade_minima: number

  fornecedor_principal: number

  status:
    ProdutoFornecedorStatus
}

interface CountRow
  extends RowDataPacket {
  total: number
}

export interface CreateProdutoFornecedorData {
  id_empresa: number

  id_produto: number

  codigo_produto_fornecedor: string

  preco_ultima_compra: number

  prazo_entrega_dias: number

  quantidade_minima: number

  fornecedor_principal?: boolean

  status:
    ProdutoFornecedorStatus
}

export interface UpdateProdutoFornecedorData {
  id_empresa?: number

  id_produto?: number

  codigo_produto_fornecedor?: string

  preco_ultima_compra?: number

  prazo_entrega_dias?: number

  quantidade_minima?: number

  fornecedor_principal?: boolean

  status?:
    ProdutoFornecedorStatus
}

export interface ProdutoFornecedorFilters {
  idEmpresa?: number

  idProduto?: number

  includeInativos?: boolean
}

export interface ProdutoFornecedorPagination {
  page: number

  limit: number
}

function mapProdutoFornecedor(
  row: ProdutoFornecedorRow
): ProdutoFornecedor {
  return {
    id:
      row.id,

    id_empresa:
      row.id_empresa,

    id_produto:
      row.id_produto,

    codigo_produto_fornecedor:
      row.codigo_produto_fornecedor,

    preco_ultima_compra:
      Number(
        row.preco_ultima_compra
      ),

    prazo_entrega_dias:
      row.prazo_entrega_dias,

    quantidade_minima:
      row.quantidade_minima,

    fornecedor_principal:
      Boolean(
        row.fornecedor_principal
      ),

    status:
      row.status,
  }
}

export async function create(
  data:
    CreateProdutoFornecedorData
): Promise<ProdutoFornecedor> {
  const [result] =
    await db.execute<ResultSetHeader>(
      `
        INSERT INTO produto_fornecedor (
          id_empresa,
          id_produto,
          codigo_produto_fornecedor,
          preco_ultima_compra,
          prazo_entrega_dias,
          quantidade_minima,
          fornecedor_principal,
          status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        data.id_empresa,
        data.id_produto,
        data.codigo_produto_fornecedor,
        data.preco_ultima_compra,
        data.prazo_entrega_dias,
        data.quantidade_minima,
        data.fornecedor_principal ??
          false,
        data.status,
      ]
    )

  const produtoFornecedor =
    await findById(
      result.insertId
    )

  if (!produtoFornecedor) {
    throw new Error(
      'Erro ao recuperar produto fornecedor criado'
    )
  }

  return produtoFornecedor
}

export async function findAll(
  filters: {
    idEmpresa?: number
    idProduto?: number
    includeInativos?: boolean
  },
  pagination: {
    page: number
    limit: number
  }
): Promise<{
  rows: ProdutoFornecedor[]
  count: number
}> {
  const page = Math.max(
    1,
    Number(pagination.page) || 1
  )

  const limit = Math.min(
    100,
    Math.max(
      1,
      Number(pagination.limit) || 20
    )
  )

  const offset =
    (page - 1) * limit

  const conditions: string[] = []
  const params: Array<number> = []

  if (
    filters.idEmpresa !== undefined
  ) {
    conditions.push(
      'id_empresa = ?'
    )

    params.push(
      Number(filters.idEmpresa)
    )
  }

  if (
    filters.idProduto !== undefined
  ) {
    conditions.push(
      'id_produto = ?'
    )

    params.push(
      Number(filters.idProduto)
    )
  }

  if (
    !filters.includeInativos
  ) {
    conditions.push(
      "status = 'ATIVO'"
    )
  }

  const whereClause =
    conditions.length > 0
      ? `WHERE ${conditions.join(' AND ')}`
      : ''

  const sql = `
    SELECT
      id,
      id_empresa,
      id_produto,
      codigo_produto_fornecedor,
      preco_ultima_compra,
      prazo_entrega_dias,
      quantidade_minima,
      fornecedor_principal,
      status
    FROM produto_fornecedor
    ${whereClause}
    ORDER BY id DESC
    LIMIT ${limit}
    OFFSET ${offset}
  `

  const [rows] =
    await db.execute<
      ProdutoFornecedorRow[]
    >(
      sql,
      params
    )

  const countSql = `
    SELECT
      COUNT(*) AS total
    FROM produto_fornecedor
    ${whereClause}
  `

  const [countRows] =
    await db.execute<CountRow[]>(
      countSql,
      params
    )

  return {
    rows:
      rows.map(
        mapProdutoFornecedor
      ),

    count:
      countRows[0]?.total ?? 0,
  }
}

export async function findById(
  id: number
): Promise<
  ProdutoFornecedor | null
> {
  const [rows] =
    await db.execute<
      ProdutoFornecedorRow[]
    >(
      `
        SELECT
          id,
          id_empresa,
          id_produto,
          codigo_produto_fornecedor,
          preco_ultima_compra,
          prazo_entrega_dias,
          quantidade_minima,
          fornecedor_principal,
          status
        FROM produto_fornecedor
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

  return mapProdutoFornecedor(
    row
  )
}

export async function findByAssociacao(
  idEmpresa: number,
  idProduto: number
): Promise<
  ProdutoFornecedor | null
> {
  const [rows] =
    await db.execute<
      ProdutoFornecedorRow[]
    >(
      `
        SELECT
          id,
          id_empresa,
          id_produto,
          codigo_produto_fornecedor,
          preco_ultima_compra,
          prazo_entrega_dias,
          quantidade_minima,
          fornecedor_principal,
          status
        FROM produto_fornecedor
        WHERE id_empresa = ?
          AND id_produto = ?
        LIMIT 1
      `,
      [
        idEmpresa,
        idProduto,
      ]
    )

  const row =
    rows[0]

  if (!row) {
    return null
  }

  return mapProdutoFornecedor(
    row
  )
}

export async function update(
  id: number,
  data:
    UpdateProdutoFornecedorData
): Promise<
  ProdutoFornecedor | null
> {
  const fields: string[] =
    []

  const values: Array<
    string |
    number |
    boolean
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
    data.codigo_produto_fornecedor !==
    undefined
  ) {
    fields.push(
      'codigo_produto_fornecedor = ?'
    )

    values.push(
      data.codigo_produto_fornecedor
    )
  }

  if (
    data.preco_ultima_compra !==
    undefined
  ) {
    fields.push(
      'preco_ultima_compra = ?'
    )

    values.push(
      data.preco_ultima_compra
    )
  }

  if (
    data.prazo_entrega_dias !==
    undefined
  ) {
    fields.push(
      'prazo_entrega_dias = ?'
    )

    values.push(
      data.prazo_entrega_dias
    )
  }

  if (
    data.quantidade_minima !==
    undefined
  ) {
    fields.push(
      'quantidade_minima = ?'
    )

    values.push(
      data.quantidade_minima
    )
  }

  if (
    data.fornecedor_principal !==
    undefined
  ) {
    fields.push(
      'fornecedor_principal = ?'
    )

    values.push(
      data.fornecedor_principal
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

  const [result] =
    await db.execute<ResultSetHeader>(
      `
        UPDATE produto_fornecedor
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

export async function softDelete(
  id: number
): Promise<boolean> {
  const [result] =
    await db.execute<ResultSetHeader>(
      `
        UPDATE produto_fornecedor
        SET status = 'INATIVO'
        WHERE id = ?
          AND status <> 'INATIVO'
      `,
      [
        id,
      ]
    )

  return (
    result.affectedRows > 0
  )
}