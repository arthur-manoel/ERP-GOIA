import {
  ResultSetHeader,
  RowDataPacket,
} from 'mysql2'

import db from '../../config/database.js'

export type ProdutoStatus =
  | 'ATIVO'
  | 'INATIVO'

export interface Produto {
  id: number
  id_tipo_produto: number
  id_categoria: number
  id_modelo: number
  nome: string
  codigo: string
  descricao: string | null
  unidade: string
  controla_estoque: boolean
  permite_venda: boolean
  permite_compra: boolean
  permite_producao: boolean
  status: ProdutoStatus
  data_cadastro: Date
}

export interface ProdutoRow
  extends RowDataPacket {
  id: number
  id_tipo_produto: number
  id_categoria: number
  id_modelo: number
  nome: string
  codigo: string
  descricao: string | null
  unidade: string
  controla_estoque: number
  permite_venda: number
  permite_compra: number
  permite_producao: number
  status: ProdutoStatus
  data_cadastro: Date
}

interface CountRow
  extends RowDataPacket {
  total: number
}

export interface CreateProdutoData {
  id_tipo_produto: number
  id_categoria: number
  id_modelo: number
  nome: string
  codigo: string
  descricao?: string | null
  unidade: string
  controla_estoque: boolean
  permite_venda: boolean
  permite_compra: boolean
  permite_producao: boolean
  status?: ProdutoStatus
}

export interface UpdateProdutoData {
  id_tipo_produto?: number
  id_categoria?: number
  id_modelo?: number
  nome?: string
  codigo?: string
  descricao?: string | null
  unidade?: string
  controla_estoque?: boolean
  permite_venda?: boolean
  permite_compra?: boolean
  permite_producao?: boolean
  status?: ProdutoStatus
}

export interface ProdutoFilters {
  q?: string
  idTipoProduto?: number
  idCategoria?: number
  idModelo?: number
  status?: ProdutoStatus
  includeInativos?: boolean
}

export interface ProdutoPagination {
  page: number
  limit: number
}

function mapProduto(
  row: ProdutoRow
): Produto {
  return {
    id: row.id,
    id_tipo_produto:
      row.id_tipo_produto,
    id_categoria:
      row.id_categoria,
    id_modelo:
      row.id_modelo,
    nome: row.nome,
    codigo: row.codigo,
    descricao:
      row.descricao,
    unidade: row.unidade,
    controla_estoque:
      Boolean(
        row.controla_estoque
      ),
    permite_venda:
      Boolean(
        row.permite_venda
      ),
    permite_compra:
      Boolean(
        row.permite_compra
      ),
    permite_producao:
      Boolean(
        row.permite_producao
      ),
    status: row.status,
    data_cadastro:
      row.data_cadastro,
  }
}

export async function create(
  data: CreateProdutoData
): Promise<Produto> {
  const [result] =
    await db.execute<ResultSetHeader>(
      `
        INSERT INTO produtos (
          id_tipo_produto,
          id_categoria,
          id_modelo,
          nome,
          codigo,
          descricao,
          unidade,
          controla_estoque,
          permite_venda,
          permite_compra,
          permite_producao,
          status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        data.id_tipo_produto,
        data.id_categoria,
        data.id_modelo,
        data.nome,
        data.codigo,
        data.descricao ?? null,
        data.unidade,
        data.controla_estoque,
        data.permite_venda,
        data.permite_compra,
        data.permite_producao,
        data.status ?? 'ATIVO',
      ]
    )

  const produto =
    await findById(
      result.insertId
    )

  if (!produto) {
    throw new Error(
      'Erro ao recuperar produto criado'
    )
  }

  return produto
}

export async function findAll(
  filters: ProdutoFilters,
  pagination: ProdutoPagination
): Promise<{
  rows: Produto[]
  count: number
}> {
  const conditions: string[] =
    []

  const params: Array<
    string | number
  > = []

  if (filters.status) {
    conditions.push(
      'status = ?'
    )

    params.push(
      filters.status
    )
  } else if (
    !filters.includeInativos
  ) {
    conditions.push(
      "status = 'ATIVO'"
    )
  }

  if (filters.q) {
    conditions.push(
      `
        (
          LOWER(nome) LIKE ?
          OR LOWER(codigo) LIKE ?
        )
      `
    )

    const search =
      `%${filters.q.toLowerCase()}%`

    params.push(
      search,
      search
    )
  }

  if (
    filters.idTipoProduto !==
    undefined
  ) {
    conditions.push(
      'id_tipo_produto = ?'
    )

    params.push(
      filters.idTipoProduto
    )
  }

  if (
    filters.idCategoria !==
    undefined
  ) {
    conditions.push(
      'id_categoria = ?'
    )

    params.push(
      filters.idCategoria
    )
  }

  if (
    filters.idModelo !==
    undefined
  ) {
    conditions.push(
      'id_modelo = ?'
    )

    params.push(
      filters.idModelo
    )
  }

  const whereClause =
    conditions.length > 0
      ? `WHERE ${conditions.join(
          ' AND '
        )}`
      : ''

  const offset =
    (pagination.page - 1) *
    pagination.limit

  const [
    [rows],
    [countRows],
  ] = await Promise.all([
    db.execute<ProdutoRow[]>(
      `
        SELECT
          id,
          id_tipo_produto,
          id_categoria,
          id_modelo,
          nome,
          codigo,
          descricao,
          unidade,
          controla_estoque,
          permite_venda,
          permite_compra,
          permite_producao,
          status,
          data_cadastro
        FROM produtos
        ${whereClause}
        ORDER BY nome ASC
        LIMIT ?
        OFFSET ?
      `,
      [
        ...params,
        pagination.limit,
        offset,
      ]
    ),

    db.execute<CountRow[]>(
      `
        SELECT
          COUNT(*) AS total
        FROM produtos
        ${whereClause}
      `,
      params
    ),
  ])

  return {
    rows:
      rows.map(mapProduto),

    count:
      countRows[0]?.total ??
      0,
  }
}

export async function findById(
  id: number
): Promise<Produto | null> {
  const [rows] =
    await db.execute<
      ProdutoRow[]
    >(
      `
        SELECT
          id,
          id_tipo_produto,
          id_categoria,
          id_modelo,
          nome,
          codigo,
          descricao,
          unidade,
          controla_estoque,
          permite_venda,
          permite_compra,
          permite_producao,
          status,
          data_cadastro
        FROM produtos
        WHERE id = ?
        LIMIT 1
      `,
      [id]
    )

  const row = rows[0]

  if (!row) {
    return null
  }

  return mapProduto(row)
}

export async function findByCodigo(
  codigo: string
): Promise<Produto | null> {
  const [rows] =
    await db.execute<
      ProdutoRow[]
    >(
      `
        SELECT
          id,
          id_tipo_produto,
          id_categoria,
          id_modelo,
          nome,
          codigo,
          descricao,
          unidade,
          controla_estoque,
          permite_venda,
          permite_compra,
          permite_producao,
          status,
          data_cadastro
        FROM produtos
        WHERE codigo = ?
        LIMIT 1
      `,
      [codigo]
    )

  const row = rows[0]

  if (!row) {
    return null
  }

  return mapProduto(row)
}

export async function update(
  id: number,
  data: UpdateProdutoData
): Promise<Produto | null> {
  const fields: string[] =
    []

  const values: Array<
    string |
    number |
    boolean |
    null
  > = []

  if (
    data.id_tipo_produto !==
    undefined
  ) {
    fields.push(
      'id_tipo_produto = ?'
    )

    values.push(
      data.id_tipo_produto
    )
  }

  if (
    data.id_categoria !==
    undefined
  ) {
    fields.push(
      'id_categoria = ?'
    )

    values.push(
      data.id_categoria
    )
  }

  if (
    data.id_modelo !==
    undefined
  ) {
    fields.push(
      'id_modelo = ?'
    )

    values.push(
      data.id_modelo
    )
  }

  if (
    data.nome !== undefined
  ) {
    fields.push(
      'nome = ?'
    )

    values.push(
      data.nome
    )
  }

  if (
    data.codigo !== undefined
  ) {
    fields.push(
      'codigo = ?'
    )

    values.push(
      data.codigo
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
    data.unidade !== undefined
  ) {
    fields.push(
      'unidade = ?'
    )

    values.push(
      data.unidade
    )
  }

  if (
    data.controla_estoque !==
    undefined
  ) {
    fields.push(
      'controla_estoque = ?'
    )

    values.push(
      data.controla_estoque
    )
  }

  if (
    data.permite_venda !==
    undefined
  ) {
    fields.push(
      'permite_venda = ?'
    )

    values.push(
      data.permite_venda
    )
  }

  if (
    data.permite_compra !==
    undefined
  ) {
    fields.push(
      'permite_compra = ?'
    )

    values.push(
      data.permite_compra
    )
  }

  if (
    data.permite_producao !==
    undefined
  ) {
    fields.push(
      'permite_producao = ?'
    )

    values.push(
      data.permite_producao
    )
  }

  if (
    data.status !== undefined
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
        UPDATE produtos
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
        UPDATE produtos
        SET status = 'INATIVO'
        WHERE id = ?
          AND status <> 'INATIVO'
      `,
      [id]
    )

  return (
    result.affectedRows > 0
  )
}