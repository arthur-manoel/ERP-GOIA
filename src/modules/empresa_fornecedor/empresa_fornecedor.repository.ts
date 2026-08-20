import {
  ResultSetHeader,
  RowDataPacket,
} from 'mysql2'

import db from '../../config/database.js'

export type EmpresaFornecedorStatus =
  'ATIVO' | 'INATIVO'

export interface EmpresaFornecedorRow
  extends RowDataPacket {
  id: number
  id_empresa: number
  id_fornecedor: number
  prazo_pagamento: number | null
  prazo_entrega: number | null
  observacao: string | null
  status: EmpresaFornecedorStatus
}

export interface EmpresaFornecedor {
  id: number
  id_empresa: number
  id_fornecedor: number
  prazo_pagamento: number | null
  prazo_entrega: number | null
  observacao: string | null
  status: EmpresaFornecedorStatus
}

interface CountRow
  extends RowDataPacket {
  total: number
}

export interface CreateEmpresaFornecedorData {
  id_empresa: number
  id_fornecedor: number
  prazo_pagamento?: number | null
  prazo_entrega?: number | null
  observacao?: string | null
  status?: EmpresaFornecedorStatus
}

export interface UpdateEmpresaFornecedorData {
  id_empresa?: number
  id_fornecedor?: number
  prazo_pagamento?: number | null
  prazo_entrega?: number | null
  observacao?: string | null
  status?: EmpresaFornecedorStatus
}

export interface EmpresaFornecedorFilters {
  idEmpresa?: number
  idFornecedor?: number
  includeInativos?: boolean
}

export interface EmpresaFornecedorPagination {
  page: number
  limit: number
}

function mapEmpresaFornecedor(
  row: EmpresaFornecedorRow
): EmpresaFornecedor {
  return {
    id:
      row.id,

    id_empresa:
      row.id_empresa,

    id_fornecedor:
      row.id_fornecedor,

    prazo_pagamento:
      row.prazo_pagamento,

    prazo_entrega:
      row.prazo_entrega,

    observacao:
      row.observacao,

    status:
      row.status,
  }
}

export async function create(
  data: CreateEmpresaFornecedorData
): Promise<EmpresaFornecedor> {
  const [result] =
    await db.execute<ResultSetHeader>(
      `
        INSERT INTO empresa_fornecedor (
          id_empresa,
          id_fornecedor,
          prazo_pagamento,
          prazo_entrega,
          observacao,
          status
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        data.id_empresa,
        data.id_fornecedor,
        data.prazo_pagamento ?? null,
        data.prazo_entrega ?? null,
        data.observacao ?? null,
        data.status ?? 'ATIVO',
      ]
    )

  const empresaFornecedor =
    await findById(
      result.insertId
    )

  if (!empresaFornecedor) {
    throw new Error(
      'Erro ao recuperar associação criada'
    )
  }

  return empresaFornecedor
}

export async function findAll(
  filters: EmpresaFornecedorFilters,
  pagination: EmpresaFornecedorPagination
): Promise<{
  rows: EmpresaFornecedor[]
  count: number
}> {
  const conditions: string[] =
    []

  const params: number[] =
    []

  if (
    !filters.includeInativos
  ) {
    conditions.push(
      "status = 'ATIVO'"
    )
  }

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
    filters.idFornecedor !==
    undefined
  ) {
    conditions.push(
      'id_fornecedor = ?'
    )

    params.push(
      filters.idFornecedor
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

  const [rows] =
    await db.execute<
      EmpresaFornecedorRow[]
    >(
      `
        SELECT
          id,
          id_empresa,
          id_fornecedor,
          prazo_pagamento,
          prazo_entrega,
          observacao,
          status
        FROM empresa_fornecedor
        ${whereClause}
        ORDER BY id ASC
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
        FROM empresa_fornecedor
        ${whereClause}
      `,
      params
    )

  return {
    rows:
      rows.map(
        mapEmpresaFornecedor
      ),

    count:
      countRows[0]?.total ??
      0,
  }
}

export async function findById(
  id: number
): Promise<EmpresaFornecedor | null> {
  const [rows] =
    await db.execute<
      EmpresaFornecedorRow[]
    >(
      `
        SELECT
          id,
          id_empresa,
          id_fornecedor,
          prazo_pagamento,
          prazo_entrega,
          observacao,
          status
        FROM empresa_fornecedor
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

  return mapEmpresaFornecedor(
    row
  )
}

export async function findByEmpresaFornecedor(
  idEmpresa: number,
  idFornecedor: number
): Promise<EmpresaFornecedor | null> {
  const [rows] =
    await db.execute<
      EmpresaFornecedorRow[]
    >(
      `
        SELECT
          id,
          id_empresa,
          id_fornecedor,
          prazo_pagamento,
          prazo_entrega,
          observacao,
          status
        FROM empresa_fornecedor
        WHERE id_empresa = ?
          AND id_fornecedor = ?
        LIMIT 1
      `,
      [
        idEmpresa,
        idFornecedor,
      ]
    )

  const row =
    rows[0]

  if (!row) {
    return null
  }

  return mapEmpresaFornecedor(
    row
  )
}

export async function update(
  id: number,
  data: UpdateEmpresaFornecedorData
): Promise<EmpresaFornecedor | null> {
  const fields: string[] =
    []

  const values: Array<
    number |
    string |
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
    data.id_fornecedor !==
    undefined
  ) {
    fields.push(
      'id_fornecedor = ?'
    )

    values.push(
      data.id_fornecedor
    )
  }

  if (
    data.prazo_pagamento !==
    undefined
  ) {
    fields.push(
      'prazo_pagamento = ?'
    )

    values.push(
      data.prazo_pagamento
    )
  }

  if (
    data.prazo_entrega !==
    undefined
  ) {
    fields.push(
      'prazo_entrega = ?'
    )

    values.push(
      data.prazo_entrega
    )
  }

  if (
    data.observacao !==
    undefined
  ) {
    fields.push(
      'observacao = ?'
    )

    values.push(
      data.observacao
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
        UPDATE empresa_fornecedor
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
        UPDATE empresa_fornecedor
        SET status = 'INATIVO'
        WHERE id = ?
          AND status = 'ATIVO'
      `,
      [
        id,
      ]
    )

  return (
    result.affectedRows > 0
  )
}