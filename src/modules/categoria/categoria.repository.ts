import {
  ResultSetHeader,
  RowDataPacket,
} from 'mysql2'

import db from '../../config/database.js'

export interface CategoriaRow
  extends RowDataPacket {
  id: number
  id_empresa: number
  nome: string
  descricao: string | null
  status: 'ATIVO' | 'INATIVO'
}

interface CountRow
  extends RowDataPacket {
  total: number
}

export interface CreateCategoriaData {
  id_empresa: number
  nome: string
  descricao?: string | null
  status?: 'ATIVO' | 'INATIVO'
}

export interface UpdateCategoriaData {
  id_empresa?: number
  nome?: string
  descricao?: string | null
  status?: 'ATIVO' | 'INATIVO'
}

export interface CategoriaFilters {
  id_empresa?: number
  q?: string
  include_inativos?: boolean
}

export interface CategoriaPagination {
  page: number
  limit: number
}

/**
 * Criar categoria
 */
export async function createCategoria(
  data: CreateCategoriaData
): Promise<CategoriaRow> {
  const [result] =
    await db.execute<ResultSetHeader>(
      `
        INSERT INTO categorias (
          id_empresa,
          nome,
          descricao,
          status
        )
        VALUES (?, ?, ?, ?)
      `,
      [
        Number(data.id_empresa),
        data.nome,
        data.descricao ?? null,
        data.status ?? 'ATIVO',
      ]
    )

  const categoria =
    await findCategoriaById(
      result.insertId
    )

  if (!categoria) {
    throw new Error(
      'Erro ao recuperar categoria criada'
    )
  }

  return categoria
}

/**
 * Listar categorias
 */
export async function findAllCategorias(
  filters: CategoriaFilters,
  pagination: CategoriaPagination
): Promise<{
  rows: CategoriaRow[]
  count: number
}> {
  const conditions: string[] = []

  const params: Array<
    string | number
  > = []

  // Somente categorias ativas
  // por padrão
  if (!filters.include_inativos) {
    conditions.push(
      `status = 'ATIVO'`
    )
  }

  // Filtro por empresa
  if (
    filters.id_empresa !==
    undefined
  ) {
    conditions.push(
      'id_empresa = ?'
    )

    params.push(
      Number(filters.id_empresa)
    )
  }

  // Busca por nome
  if (filters.q) {
    conditions.push(
      'LOWER(nome) LIKE ?'
    )

    params.push(
      `%${filters.q.toLowerCase()}%`
    )
  }

  const whereClause =
    conditions.length > 0
      ? `WHERE ${conditions.join(
          ' AND '
        )}`
      : ''

  // =========================
  // PAGINAÇÃO
  // =========================

  let page = Number(
    pagination?.page
  )

  let limit = Number(
    pagination?.limit
  )

  if (
    !Number.isFinite(page) ||
    page < 1
  ) {
    page = 1
  }

  if (
    !Number.isFinite(limit) ||
    limit < 1
  ) {
    limit = 20
  }

  page = Math.floor(page)
  limit = Math.floor(limit)

  // Limite máximo
  if (limit > 100) {
    limit = 100
  }

  const offset =
    (page - 1) * limit

  // =========================
  // BUSCAR CATEGORIAS
  // =========================

  const [rows] =
    await db.execute<CategoriaRow[]>(
      `
        SELECT
          id,
          id_empresa,
          nome,
          descricao,
          status
        FROM categorias
        ${whereClause}
        ORDER BY nome ASC
        LIMIT ${limit}
        OFFSET ${offset}
      `,
      params
    )

  // =========================
  // CONTAGEM
  // =========================

  const [countRows] =
    await db.execute<CountRow[]>(
      `
        SELECT
          COUNT(*) AS total
        FROM categorias
        ${whereClause}
      `,
      params
    )

  return {
    rows,
    count:
      countRows[0]?.total ?? 0,
  }
}

/**
 * Buscar categoria por ID
 */
export async function findCategoriaById(
  id: number
): Promise<CategoriaRow | null> {
  const [rows] =
    await db.execute<CategoriaRow[]>(
      `
        SELECT
          id,
          id_empresa,
          nome,
          descricao,
          status
        FROM categorias
        WHERE id = ?
        LIMIT 1
      `,
      [
        Number(id),
      ]
    )

  return rows[0] ?? null
}

/**
 * Buscar categoria por nome e empresa
 */
export async function findCategoriaByNome(
  nome: string,
  idEmpresa: number
): Promise<CategoriaRow | null> {
  const [rows] =
    await db.execute<CategoriaRow[]>(
      `
        SELECT
          id,
          id_empresa,
          nome,
          descricao,
          status
        FROM categorias
        WHERE LOWER(nome) = LOWER(?)
          AND id_empresa = ?
        LIMIT 1
      `,
      [
        nome,
        Number(idEmpresa),
      ]
    )

  return rows[0] ?? null
}

/**
 * Atualizar categoria
 */
export async function updateCategoria(
  id: number,
  data: UpdateCategoriaData
): Promise<CategoriaRow | null> {
  const fields: string[] = []

  const values: Array<
    string | number | null
  > = []

  if (
    data.id_empresa !==
    undefined
  ) {
    fields.push(
      'id_empresa = ?'
    )

    values.push(
      Number(data.id_empresa)
    )
  }

  if (data.nome !== undefined) {
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

  // Nenhum campo para atualizar
  if (fields.length === 0) {
    return findCategoriaById(id)
  }

  values.push(
    Number(id)
  )

  const [result] =
    await db.execute<ResultSetHeader>(
      `
        UPDATE categorias
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

  return findCategoriaById(id)
}

/**
 * Desativar categoria
 */
export async function softDeleteCategoria(
  id: number
): Promise<boolean> {
  const [result] =
    await db.execute<ResultSetHeader>(
      `
        UPDATE categorias
        SET status = 'INATIVO'
        WHERE id = ?
      `,
      [
        Number(id),
      ]
    )

  return (
    result.affectedRows > 0
  )
}