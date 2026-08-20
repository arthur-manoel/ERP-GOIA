import {
  createNotaFiscal as createNotaFiscalRepository,
  deleteNotaFiscalRepository,
  findAllNotasFiscais,
  findNotaFiscalById,
  findNotaFiscalByNumero,
  updateNotaFiscalRepository,
  type NotaFiscal,
  type UpdateNotaFiscalData,
} from './nota_fiscal.repository.js'

import type {
  CreateNotaFiscalInput,
  ListNotasFiscaisInput,
  UpdateNotaFiscalInput,
} from './nota_fiscal.schema.js'

export const NOTA_FISCAL_MESSAGES = {
  NOT_FOUND:
    'Nota fiscal não encontrada',

  NUMBER_ALREADY_EXISTS:
    'Já existe uma nota fiscal cadastrada com este número',

  INVALID_FOREIGN_KEY:
    'Um dos registros relacionados informados não existe',

  CREATED:
    'Nota fiscal criada com sucesso',

  UPDATED:
    'Nota fiscal atualizada com sucesso',

  DELETED:
    'Nota fiscal excluída com sucesso',
} as const

export class NotFoundError
  extends Error {
  constructor(
    message =
      NOTA_FISCAL_MESSAGES.NOT_FOUND
  ) {
    super(message)

    this.name =
      'NotFoundError'
  }
}

export class ConflictError
  extends Error {
  constructor(
    message =
      NOTA_FISCAL_MESSAGES.NUMBER_ALREADY_EXISTS
  ) {
    super(message)

    this.name =
      'ConflictError'
  }
}

export class ValidationError
  extends Error {
  public readonly details?:
    unknown

  constructor(
    message: string,
    details?: unknown
  ) {
    super(message)

    this.name =
      'ValidationError'

    this.details =
      details
  }
}

interface DatabaseError
  extends Error {
  code?: string
  errno?: number
}

function isDuplicateEntryError(
  error: unknown
): boolean {
  if (
    typeof error !==
      'object' ||
    error === null
  ) {
    return false
  }

  const databaseError =
    error as DatabaseError

  return (
    databaseError.code ===
      'ER_DUP_ENTRY' ||
    databaseError.errno ===
      1062
  )
}

function isForeignKeyError(
  error: unknown
): boolean {
  if (
    typeof error !==
      'object' ||
    error === null
  ) {
    return false
  }

  const databaseError =
    error as DatabaseError

  return (
    databaseError.code ===
      'ER_NO_REFERENCED_ROW_2' ||
    databaseError.errno ===
      1452
  )
}

function handleDatabaseError(
  error: unknown
): never {
  if (
    isDuplicateEntryError(
      error
    )
  ) {
    throw new ConflictError()
  }

  if (
    isForeignKeyError(error)
  ) {
    throw new ValidationError(
      NOTA_FISCAL_MESSAGES.INVALID_FOREIGN_KEY
    )
  }

  throw error
}

function normalizeNullableString(
  value:
    | string
    | null
    | undefined
): string | null {
  if (
    value === null ||
    value === undefined
  ) {
    return null
  }

  const normalized =
    value.trim()

  return normalized || null
}

export async function createNotaFiscal(
  data: CreateNotaFiscalInput
): Promise<NotaFiscal> {
  const numero =
    data.numero.trim()

  const existente =
    await findNotaFiscalByNumero(
      numero
    )

  if (existente) {
    throw new ConflictError()
  }

  try {
    return await createNotaFiscalRepository(
      {
        id_empresa:
          data.id_empresa,

        id_fronecedor:
          data.id_fronecedor,

        id_pedido_compra:
          data.id_pedido_compra ??
          null,

        id_setor_destino:
          data.id_setor_destino ??
          null,

        numero,

        serie:
          normalizeNullableString(
            data.serie
          ),

        chave_acesso:
          normalizeNullableString(
            data.chave_acesso
          ),

        status:
          data.status.trim(),

        data_emissao:
          data.data_emissao,

        data_recebimento:
          data.data_recebimento ??
          null,

        valor_total:
          data.valor_total,

        entrada_processada:
          data.entrada_processada ??
          false,

        data_processamento:
          data.data_processamento ??
          null,

        observacao:
          normalizeNullableString(
            data.observacao
          ),
      }
    )
  } catch (error) {
    handleDatabaseError(
      error
    )
  }
}

export async function listNotasFiscais(
  filters: ListNotasFiscaisInput
): Promise<{
  rows: NotaFiscal[]
  count: number
  page: number
  limit: number
  totalPages: number
}> {
  const page =
    filters.page ?? 1

  const limit =
    filters.limit ?? 20

  const result =
    await findAllNotasFiscais(
      {
        q:
          filters.q,

        idEmpresa:
          filters.id_empresa,

        idFronecedor:
          filters.id_fronecedor,

        idPedidoCompra:
          filters.id_pedido_compra,

        idSetorDestino:
          filters.id_setor_destino,

        status:
          filters.status,

        entradaProcessada:
          filters.entrada_processada,
      },
      {
        page,
        limit,
      }
    )

  return {
    rows:
      result.rows,

    count:
      result.count,

    page,

    limit,

    totalPages:
      result.count === 0
        ? 0
        : Math.ceil(
            result.count /
              limit
          ),
  }
}

export async function getNotaFiscalById(
  id: number
): Promise<NotaFiscal> {
  const notaFiscal =
    await findNotaFiscalById(
      id
    )

  if (!notaFiscal) {
    throw new NotFoundError()
  }

  return notaFiscal
}

export async function updateNotaFiscal(
  id: number,
  data: UpdateNotaFiscalInput
): Promise<NotaFiscal> {
  const atual =
    await findNotaFiscalById(
      id
    )

  if (!atual) {
    throw new NotFoundError()
  }

  const updateData:
    UpdateNotaFiscalData =
    {}

  if (
    data.numero !== undefined
  ) {
    const numero =
      data.numero.trim()

    const existente =
      await findNotaFiscalByNumero(
        numero
      )

    if (
      existente &&
      existente.id !== id
    ) {
      throw new ConflictError()
    }

    updateData.numero =
      numero
  }

  if (
    data.id_empresa !==
    undefined
  ) {
    updateData.id_empresa =
      data.id_empresa
  }

  if (
    data.id_fronecedor !==
    undefined
  ) {
    updateData.id_fronecedor =
      data.id_fronecedor
  }

  if (
    data.id_pedido_compra !==
    undefined
  ) {
    updateData.id_pedido_compra =
      data.id_pedido_compra
  }

  if (
    data.id_setor_destino !==
    undefined
  ) {
    updateData.id_setor_destino =
      data.id_setor_destino
  }

  if (
    data.serie !== undefined
  ) {
    updateData.serie =
      normalizeNullableString(
        data.serie
      )
  }

  if (
    data.chave_acesso !==
    undefined
  ) {
    updateData.chave_acesso =
      normalizeNullableString(
        data.chave_acesso
      )
  }

  if (
    data.status !== undefined
  ) {
    updateData.status =
      data.status.trim()
  }

  if (
    data.data_emissao !==
    undefined
  ) {
    updateData.data_emissao =
      data.data_emissao
  }

  if (
    data.data_recebimento !==
    undefined
  ) {
    updateData.data_recebimento =
      data.data_recebimento
  }

  if (
    data.valor_total !==
    undefined
  ) {
    updateData.valor_total =
      data.valor_total
  }

  if (
    data.entrada_processada !==
    undefined
  ) {
    updateData.entrada_processada =
      data.entrada_processada
  }

  if (
    data.data_processamento !==
    undefined
  ) {
    updateData.data_processamento =
      data.data_processamento
  }

  if (
    data.observacao !==
    undefined
  ) {
    updateData.observacao =
      normalizeNullableString(
        data.observacao
      )
  }

  try {
    const updated =
      await updateNotaFiscalRepository(
        id,
        updateData
      )

    if (!updated) {
      throw new NotFoundError()
    }

    return updated
  } catch (error) {
    if (
      error instanceof
        NotFoundError ||
      error instanceof
        ConflictError ||
      error instanceof
        ValidationError
    ) {
      throw error
    }

    handleDatabaseError(
      error
    )
  }
}

export async function deleteNotaFiscal(
  id: number
): Promise<void> {
  const existe =
    await findNotaFiscalById(
      id
    )

  if (!existe) {
    throw new NotFoundError()
  }

  const deleted =
    await deleteNotaFiscalRepository(
      id
    )

  if (!deleted) {
    throw new NotFoundError()
  }
}