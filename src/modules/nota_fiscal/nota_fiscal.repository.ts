import {
  ResultSetHeader,
  RowDataPacket,
} from 'mysql2'

import db from '../../config/database.js'

export interface NotaFiscal {
  id: number
  id_empresa: number
  id_fornecedor: number
  id_pedido_compra: number | null
  id_setor_destino: number | null
  numero: string
  serie: string | null
  chave_acesso: string | null
  status: string
  data_emissao: string
  data_recebimento: string | null
  valor_total: number
  entrada_processada: boolean
  data_processamento: string | null
  observacao: string | null
}

export interface NotaFiscalRow extends RowDataPacket {
  id: number
  id_empresa: number
  id_fornecedor: number
  id_pedido_compra: number | null
  id_setor_destino: number | null
  numero: string
  serie: string | null
  chave_acesso: string | null
  status: string
  data_emissao: string
  data_recebimento: string | null
  valor_total: string
  entrada_processada: number
  data_processamento: string | null
  observacao: string | null
}

interface CountRow extends RowDataPacket {
  total: number
}

export interface CreateNotaFiscalData {
  id_empresa: number
  id_fornecedor: number
  id_pedido_compra?: number | null
  id_setor_destino?: number | null
  numero: string
  serie?: string | null
  chave_acesso?: string | null
  status: string
  data_emissao: string
  data_recebimento?: string | null
  valor_total: number
  entrada_processada?: boolean
  data_processamento?: string | null
  observacao?: string | null
}

export interface UpdateNotaFiscalData {
  id_empresa?: number
  id_fornecedor?: number
  id_pedido_compra?: number | null
  id_setor_destino?: number | null
  numero?: string
  serie?: string | null
  chave_acesso?: string | null
  status?: string
  data_emissao?: string
  data_recebimento?: string | null
  valor_total?: number
  entrada_processada?: boolean
  data_processamento?: string | null
  observacao?: string | null
}

export interface NotaFiscalFilters {
  q?: string
  idEmpresa?: number
  idFornecedor?: number
  idPedidoCompra?: number
  idSetorDestino?: number
  status?: string
  entradaProcessada?: boolean
}

export interface NotaFiscalPagination {
  page: number
  limit: number
}

const selectFields = `
  id,
  id_empresa,
  id_fornecedor,
  id_pedido_compra,
  id_setor_destino,
  numero,
  serie,
  chave_acesso,
  status,
  DATE_FORMAT(
    data_emissao,
    '%Y-%m-%d'
  ) AS data_emissao,
  DATE_FORMAT(
    data_recebimento,
    '%Y-%m-%d'
  ) AS data_recebimento,
  valor_total,
  entrada_processada,
  DATE_FORMAT(
    data_processamento,
    '%Y-%m-%d %H:%i:%s'
  ) AS data_processamento,
  observacao
`

function mapNotaFiscal(
  row: NotaFiscalRow
): NotaFiscal {
  return {
    id: row.id,

    id_empresa:
      row.id_empresa,

    id_fornecedor:
      row.id_fornecedor,

    id_pedido_compra:
      row.id_pedido_compra,

    id_setor_destino:
      row.id_setor_destino,

    numero:
      row.numero,

    serie:
      row.serie,

    chave_acesso:
      row.chave_acesso,

    status:
      row.status,

    data_emissao:
      row.data_emissao,

    data_recebimento:
      row.data_recebimento,

    valor_total:
      Number(row.valor_total),

    entrada_processada:
      Boolean(
        row.entrada_processada
      ),

    data_processamento:
      row.data_processamento,

    observacao:
      row.observacao,
  }
}

export async function createNotaFiscal(
  data: CreateNotaFiscalData
): Promise<NotaFiscal> {
  const [result] =
    await db.execute<ResultSetHeader>(
      `
        INSERT INTO nota_fiscal (
          id_empresa,
          id_fornecedor,
          id_pedido_compra,
          id_setor_destino,
          numero,
          serie,
          chave_acesso,
          status,
          data_emissao,
          data_recebimento,
          valor_total,
          entrada_processada,
          data_processamento,
          observacao
        )
        VALUES (
          ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?
        )
      `,
      [
        data.id_empresa,

        data.id_fornecedor,

        data.id_pedido_compra ??
          null,

        data.id_setor_destino ??
          null,

        data.numero,

        data.serie ??
          null,

        data.chave_acesso ??
          null,

        data.status,

        data.data_emissao,

        data.data_recebimento ??
          null,

        data.valor_total,

        data.entrada_processada ??
          false,

        data.data_processamento ??
          null,

        data.observacao ??
          null,
      ]
    )

  const notaFiscal =
    await findNotaFiscalById(
      result.insertId
    )

  if (!notaFiscal) {
    throw new Error(
      'Erro ao recuperar nota fiscal criada'
    )
  }

  return notaFiscal
}

export async function findAllNotasFiscais(
  filters: NotaFiscalFilters,
  pagination: NotaFiscalPagination
): Promise<{
  rows: NotaFiscal[]
  count: number
}> {
  const conditions: string[] = []

  const params: Array<
    string | number | boolean
  > = []

  if (filters.q) {
    conditions.push(`
      (
        LOWER(numero) LIKE ?
        OR LOWER(
          COALESCE(
            chave_acesso,
            ''
          )
        ) LIKE ?
      )
    `)

    const search =
      `%${filters.q.toLowerCase()}%`

    params.push(
      search,
      search
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

  if (
    filters.idPedidoCompra !==
    undefined
  ) {
    conditions.push(
      'id_pedido_compra = ?'
    )

    params.push(
      filters.idPedidoCompra
    )
  }

  if (
    filters.idSetorDestino !==
    undefined
  ) {
    conditions.push(
      'id_setor_destino = ?'
    )

    params.push(
      filters.idSetorDestino
    )
  }

  if (filters.status) {
    conditions.push(
      'LOWER(status) = LOWER(?)'
    )

    params.push(
      filters.status
    )
  }

  if (
    filters.entradaProcessada !==
    undefined
  ) {
    conditions.push(
      'entrada_processada = ?'
    )

    params.push(
      filters.entradaProcessada
    )
  }

  const whereClause =
    conditions.length > 0
      ? `WHERE ${conditions.join(
          ' AND '
        )}`
      : ''

  /*
   * Corrige problemas com LIMIT/OFFSET.
   * Garantimos que page e limit sejam números
   * inteiros e positivos.
   */
  const page = Math.max(
    1,
    Number(pagination.page) || 1
  )

  const limit = Math.max(
    1,
    Number(pagination.limit) || 10
  )

  const offset =
    (page - 1) * limit

  const [
    [rows],
    [countRows],
  ] = await Promise.all([
    db.execute<NotaFiscalRow[]>(
      `
        SELECT
          ${selectFields}
        FROM nota_fiscal
        ${whereClause}
        ORDER BY
          data_emissao DESC,
          id DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `,
      params
    ),

    db.execute<CountRow[]>(
      `
        SELECT
          COUNT(*) AS total
        FROM nota_fiscal
        ${whereClause}
      `,
      params
    ),
  ])

  return {
    rows:
      rows.map(
        mapNotaFiscal
      ),

    count:
      countRows[0]?.total ??
      0,
  }
}

export async function findNotaFiscalById(
  id: number
): Promise<NotaFiscal | null> {
  const [rows] =
    await db.execute<
      NotaFiscalRow[]
    >(
      `
        SELECT
          ${selectFields}
        FROM nota_fiscal
        WHERE id = ?
        LIMIT 1
      `,
      [id]
    )

  const row = rows[0]

  if (!row) {
    return null
  }

  return mapNotaFiscal(row)
}

export async function findNotaFiscalByNumero(
  numero: string
): Promise<NotaFiscal | null> {
  const [rows] =
    await db.execute<
      NotaFiscalRow[]
    >(
      `
        SELECT
          ${selectFields}
        FROM nota_fiscal
        WHERE LOWER(numero) =
              LOWER(?)
        LIMIT 1
      `,
      [numero]
    )

  const row = rows[0]

  if (!row) {
    return null
  }

  return mapNotaFiscal(row)
}

export async function updateNotaFiscalRepository(
  id: number,
  data: UpdateNotaFiscalData
): Promise<NotaFiscal | null> {
  const fields: string[] = []

  const values: Array<
    string |
    number |
    boolean |
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
    data.id_pedido_compra !==
    undefined
  ) {
    fields.push(
      'id_pedido_compra = ?'
    )

    values.push(
      data.id_pedido_compra
    )
  }

  if (
    data.id_setor_destino !==
    undefined
  ) {
    fields.push(
      'id_setor_destino = ?'
    )

    values.push(
      data.id_setor_destino
    )
  }

  if (
    data.numero !==
    undefined
  ) {
    fields.push(
      'numero = ?'
    )

    values.push(
      data.numero
    )
  }

  if (
    data.serie !==
    undefined
  ) {
    fields.push(
      'serie = ?'
    )

    values.push(
      data.serie
    )
  }

  if (
    data.chave_acesso !==
    undefined
  ) {
    fields.push(
      'chave_acesso = ?'
    )

    values.push(
      data.chave_acesso
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
    data.data_emissao !==
    undefined
  ) {
    fields.push(
      'data_emissao = ?'
    )

    values.push(
      data.data_emissao
    )
  }

  if (
    data.data_recebimento !==
    undefined
  ) {
    fields.push(
      'data_recebimento = ?'
    )

    values.push(
      data.data_recebimento
    )
  }

  if (
    data.valor_total !==
    undefined
  ) {
    fields.push(
      'valor_total = ?'
    )

    values.push(
      data.valor_total
    )
  }

  if (
    data.entrada_processada !==
    undefined
  ) {
    fields.push(
      'entrada_processada = ?'
    )

    values.push(
      data.entrada_processada
    )
  }

  if (
    data.data_processamento !==
    undefined
  ) {
    fields.push(
      'data_processamento = ?'
    )

    values.push(
      data.data_processamento
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
    fields.length === 0
  ) {
    return findNotaFiscalById(
      id
    )
  }

  values.push(id)

  const [result] =
    await db.execute<ResultSetHeader>(
      `
        UPDATE nota_fiscal
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

  return findNotaFiscalById(
    id
  )
}

export async function deleteNotaFiscalRepository(
  id: number
): Promise<boolean> {
  const [result] =
    await db.execute<ResultSetHeader>(
      `
        DELETE FROM nota_fiscal
        WHERE id = ?
      `,
      [id]
    )

  return (
    result.affectedRows > 0
  )
}