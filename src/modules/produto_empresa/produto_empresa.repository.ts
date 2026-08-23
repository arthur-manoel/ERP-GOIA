import {
  ResultSetHeader,
  RowDataPacket,
} from 'mysql2'

import db from '../../config/database.js'

export interface ProdutoEmpresa {
  id: number
  id_empresa: number
  id_produto: number
  codigo_interno: string
  preco_venda: number
  custo_atual: number
  valor_estoque_atual: number
  estoque_minimo: number
  estoque_maximo: number
  status: 'ATIVO' | 'INATIVO'
}

export interface ProdutoEmpresaRow
  extends RowDataPacket {
  id: number
  id_empresa: number
  id_produto: number
  codigo_interno: string
  preco_venda: string
  custo_atual: string
  valor_estoque_atual: string
  estoque_minimo: number
  estoque_maximo: number
  status: 'ATIVO' | 'INATIVO'
}

interface CountRow
  extends RowDataPacket {
  total: number
}

export interface CreateProdutoEmpresaData {
  id_empresa: number
  id_produto: number
  codigo_interno: string
  preco_venda: number
  custo_atual: number
  valor_estoque_atual: number
  estoque_minimo: number
  estoque_maximo: number
  status?: 'ATIVO' | 'INATIVO'
}

export interface UpdateProdutoEmpresaData {
  id_empresa?: number
  id_produto?: number
  codigo_interno?: string
  preco_venda?: number
  custo_atual?: number
  valor_estoque_atual?: number
  estoque_minimo?: number
  estoque_maximo?: number
  status?: 'ATIVO' | 'INATIVO'
}

export interface ProdutoEmpresaFilters {
  idEmpresa?: number
  idProduto?: number
  codigoInterno?: string
  status?: 'ATIVO' | 'INATIVO'
  includeInativos?: boolean
}

export interface ProdutoEmpresaPagination {
  page: number
  limit: number
}

function mapProdutoEmpresa(
  row: ProdutoEmpresaRow
): ProdutoEmpresa {
  return {
    id: row.id,

    id_empresa:
      row.id_empresa,

    id_produto:
      row.id_produto,

    codigo_interno:
      row.codigo_interno,

    preco_venda:
      Number(row.preco_venda),

    custo_atual:
      Number(row.custo_atual),

    valor_estoque_atual:
      Number(
        row.valor_estoque_atual
      ),

    estoque_minimo:
      row.estoque_minimo,

    estoque_maximo:
      row.estoque_maximo,

    status:
      row.status,
  }
}

export async function create(
  data: CreateProdutoEmpresaData
): Promise<ProdutoEmpresa> {
  const [result] =
    await db.execute<ResultSetHeader>(
      `
        INSERT INTO produto_empresa (
          id_empresa,
          id_produto,
          codigo_interno,
          preco_venda,
          custo_atual,
          valor_estoque_atual,
          estoque_minimo,
          estoque_maximo,
          status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        data.id_empresa,
        data.id_produto,
        data.codigo_interno,
        data.preco_venda,
        data.custo_atual,
        data.valor_estoque_atual,
        data.estoque_minimo,
        data.estoque_maximo,
        data.status ?? 'ATIVO',
      ]
    )

  const produtoEmpresa =
    await findById(
      result.insertId
    )

  if (!produtoEmpresa) {
    throw new Error(
      'Erro ao recuperar produto da empresa após criação'
    )
  }

  return produtoEmpresa
}

export async function findAll(
  filters: ProdutoEmpresaFilters,
  pagination: ProdutoEmpresaPagination
): Promise<{
  rows: ProdutoEmpresa[]
  count: number
}> {
  const conditions: string[] = []

  const params: Array<
    string | number
  > = []

  /*
   * FILTRO DE STATUS
   */
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

  /*
   * FILTRO DE EMPRESA
   */
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

  /*
   * FILTRO DE PRODUTO
   */
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

  /*
   * FILTRO DE CÓDIGO INTERNO
   */
  if (
    filters.codigoInterno
  ) {
    conditions.push(
      'codigo_interno LIKE ?'
    )

    params.push(
      `%${filters.codigoInterno}%`
    )
  }

  const whereClause =
    conditions.length > 0
      ? `WHERE ${conditions.join(
          ' AND '
        )}`
      : ''

  /*
   * PAGINAÇÃO
   *
   * Não usamos ? em LIMIT/OFFSET.
   * Isso evita o ER_WRONG_ARGUMENTS (1210).
   */
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

  /*
   * BUSCA DOS REGISTROS
   */
  const [rows] =
    await db.execute<
      ProdutoEmpresaRow[]
    >(
      `
        SELECT
          id,
          id_empresa,
          id_produto,
          codigo_interno,
          preco_venda,
          custo_atual,
          valor_estoque_atual,
          estoque_minimo,
          estoque_maximo,
          status
        FROM produto_empresa
        ${whereClause}
        ORDER BY id DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `,
      params
    )

  /*
   * CONTAGEM
   */
  const [countRows] =
    await db.execute<CountRow[]>(
      `
        SELECT
          COUNT(*) AS total
        FROM produto_empresa
        ${whereClause}
      `,
      params
    )

  return {
    rows:
      rows.map(
        mapProdutoEmpresa
      ),

    count:
      countRows[0]?.total ?? 0,
  }
}

export async function findById(
  id: number
): Promise<
  ProdutoEmpresa | null
> {
  const [rows] =
    await db.execute<
      ProdutoEmpresaRow[]
    >(
      `
        SELECT
          id,
          id_empresa,
          id_produto,
          codigo_interno,
          preco_venda,
          custo_atual,
          valor_estoque_atual,
          estoque_minimo,
          estoque_maximo,
          status
        FROM produto_empresa
        WHERE id = ?
        LIMIT 1
      `,
      [id]
    )

  const row = rows[0]

  if (!row) {
    return null
  }

  return mapProdutoEmpresa(row)
}

export async function findByProdutoEmpresa(
  idEmpresa: number,
  idProduto: number
): Promise<
  ProdutoEmpresa | null
> {
  const [rows] =
    await db.execute<
      ProdutoEmpresaRow[]
    >(
      `
        SELECT
          id,
          id_empresa,
          id_produto,
          codigo_interno,
          preco_venda,
          custo_atual,
          valor_estoque_atual,
          estoque_minimo,
          estoque_maximo,
          status
        FROM produto_empresa
        WHERE id_empresa = ?
          AND id_produto = ?
        LIMIT 1
      `,
      [
        idEmpresa,
        idProduto,
      ]
    )

  const row = rows[0]

  if (!row) {
    return null
  }

  return mapProdutoEmpresa(row)
}

export async function findByCodigoInterno(
  idEmpresa: number,
  codigoInterno: string
): Promise<
  ProdutoEmpresa | null
> {
  const [rows] =
    await db.execute<
      ProdutoEmpresaRow[]
    >(
      `
        SELECT
          id,
          id_empresa,
          id_produto,
          codigo_interno,
          preco_venda,
          custo_atual,
          valor_estoque_atual,
          estoque_minimo,
          estoque_maximo,
          status
        FROM produto_empresa
        WHERE id_empresa = ?
          AND codigo_interno = ?
        LIMIT 1
      `,
      [
        idEmpresa,
        codigoInterno,
      ]
    )

  const row = rows[0]

  if (!row) {
    return null
  }

  return mapProdutoEmpresa(row)
}

export async function update(
  id: number,
  data: UpdateProdutoEmpresaData
): Promise<
  ProdutoEmpresa | null
> {
  const fields: string[] = []

  const values: Array<
    string | number
  > = []

  if (
    data.id_empresa !== undefined
  ) {
    fields.push(
      'id_empresa = ?'
    )

    values.push(
      data.id_empresa
    )
  }

  if (
    data.id_produto !== undefined
  ) {
    fields.push(
      'id_produto = ?'
    )

    values.push(
      data.id_produto
    )
  }

  if (
    data.codigo_interno !==
    undefined
  ) {
    fields.push(
      'codigo_interno = ?'
    )

    values.push(
      data.codigo_interno
    )
  }

  if (
    data.preco_venda !== undefined
  ) {
    fields.push(
      'preco_venda = ?'
    )

    values.push(
      data.preco_venda
    )
  }

  if (
    data.custo_atual !== undefined
  ) {
    fields.push(
      'custo_atual = ?'
    )

    values.push(
      data.custo_atual
    )
  }

  if (
    data.valor_estoque_atual !==
    undefined
  ) {
    fields.push(
      'valor_estoque_atual = ?'
    )

    values.push(
      data.valor_estoque_atual
    )
  }

  if (
    data.estoque_minimo !==
    undefined
  ) {
    fields.push(
      'estoque_minimo = ?'
    )

    values.push(
      data.estoque_minimo
    )
  }

  if (
    data.estoque_maximo !==
    undefined
  ) {
    fields.push(
      'estoque_maximo = ?'
    )

    values.push(
      data.estoque_maximo
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

  if (fields.length === 0) {
    return findById(id)
  }

  values.push(id)

  const [result] =
    await db.execute<ResultSetHeader>(
      `
        UPDATE produto_empresa
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
        UPDATE produto_empresa
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