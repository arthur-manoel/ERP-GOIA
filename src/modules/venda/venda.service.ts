import {
  cancel,
  create as createVendaRepository,
  findAll,
  findById,
  findByNumero,
  update as updateVendaRepository,
  type Venda,
} from './venda.repository.js'

import type {
  CreateVendaInput,
  ListVendaInput,
  UpdateVendaInput,
} from './venda.schema.js'

export const VENDA_MESSAGES = {
  NOT_FOUND:
    'Venda não encontrada',

  NUMBER_ALREADY_EXISTS:
    'Já existe uma venda com este número',

  INVALID_VALUE:
    'O valor total deve ser maior ou igual a zero',

  INVALID_DATE:
    'A data informada é inválida. Utilize o formato YYYY-MM-DD',

  INVALID_DATE_RANGE:
    'A data inicial do filtro não pode ser posterior à data final',

  INVALID_FOREIGN_KEY:
    'Empresa, cliente ou usuário informado não existe',

  CREATED:
    'Venda criada com sucesso',

  UPDATED:
    'Venda atualizada com sucesso',

  CANCELLED:
    'Venda cancelada com sucesso',
} as const

export class NotFoundError
  extends Error {
  constructor(
    message =
      VENDA_MESSAGES.NOT_FOUND
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
      VENDA_MESSAGES
        .NUMBER_ALREADY_EXISTS
  ) {
    super(message)

    this.name =
      'ConflictError'
  }
}

export class ValidationError
  extends Error {
  constructor(
    message: string
  ) {
    super(message)

    this.name =
      'ValidationError'
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

export class VendaService {
  public async criar(
    data: CreateVendaInput
  ): Promise<Venda> {
    this.validarValor(
      data.valor_total
    )

    this.validarData(
      data.data_venda
    )

    const vendaExistente =
      await findByNumero(
        data.numero
      )

    if (vendaExistente) {
      throw new ConflictError()
    }

    try {
      return await createVendaRepository(
        {
          id_empresa:
            data.id_empresa,

          id_cliente:
            data.id_cliente,

          id_usuario:
            data.id_usuario,

          numero:
            data.numero,

          status:
            data.status ??
            'CONFIRMADA',

          data_venda:
            data.data_venda,

          valor_total:
            data.valor_total,
        }
      )
    } catch (error) {
      this.handleDatabaseError(
        error
      )
    }
  }

  public async listar(
    filters: ListVendaInput
  ) {
    const page =
      filters.page ?? 1

    const limit =
      filters.limit ?? 20

    if (
      filters.data_venda_de !==
      undefined
    ) {
      this.validarData(
        filters.data_venda_de
      )
    }

    if (
      filters.data_venda_ate !==
      undefined
    ) {
      this.validarData(
        filters.data_venda_ate
      )
    }

    if (
      filters.data_venda_de &&
      filters.data_venda_ate
    ) {
      const dataInicial =
        this.converterData(
          filters.data_venda_de
        )

      const dataFinal =
        this.converterData(
          filters.data_venda_ate
        )

      if (
        dataInicial.getTime() >
        dataFinal.getTime()
      ) {
        throw new ValidationError(
          VENDA_MESSAGES
            .INVALID_DATE_RANGE
        )
      }
    }

    const result =
      await findAll(
        {
          idEmpresa:
            filters.id_empresa,

          idCliente:
            filters.id_cliente,

          status:
            filters.status,

          dataVendaDe:
            filters.data_venda_de,

          dataVendaAte:
            filters.data_venda_ate,
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

  public async buscarPorId(
    id: number
  ): Promise<Venda> {
    const venda =
      await findById(id)

    if (!venda) {
      throw new NotFoundError()
    }

    return venda
  }

  public async atualizar(
    id: number,
    data: UpdateVendaInput
  ): Promise<Venda> {
    const vendaAtual =
      await findById(id)

    if (!vendaAtual) {
      throw new NotFoundError()
    }

    if (
      data.valor_total !==
      undefined
    ) {
      this.validarValor(
        data.valor_total
      )
    }

    if (
      data.data_venda !==
      undefined
    ) {
      this.validarData(
        data.data_venda
      )
    }

    try {
      const atualizado =
        await updateVendaRepository(
          id,
          data
        )

      if (!atualizado) {
        throw new NotFoundError()
      }

      return atualizado
    } catch (error) {
      if (
        error instanceof
        NotFoundError
      ) {
        throw error
      }

      this.handleDatabaseError(
        error
      )
    }
  }

  public async cancelar(
    id: number
  ): Promise<{
    message: string
  }> {
    const venda =
      await findById(id)

    if (!venda) {
      throw new NotFoundError()
    }

    if (
      venda.status !==
      'CANCELADA'
    ) {
      const cancelada =
        await cancel(id)

      if (!cancelada) {
        throw new NotFoundError()
      }
    }

    return {
      message:
        VENDA_MESSAGES
          .CANCELLED,
    }
  }

  private validarValor(
    valor: number
  ): void {
    if (
      !Number.isFinite(
        valor
      ) ||
      valor < 0
    ) {
      throw new ValidationError(
        VENDA_MESSAGES
          .INVALID_VALUE
      )
    }
  }

  private validarData(
    value: string
  ): void {
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(
        value
      )
    ) {
      throw new ValidationError(
        VENDA_MESSAGES
          .INVALID_DATE
      )
    }

    const partes =
      value.split('-')

    if (
      partes.length !== 3
    ) {
      throw new ValidationError(
        VENDA_MESSAGES
          .INVALID_DATE
      )
    }

    const ano =
      Number(
        partes[0]
      )

    const mes =
      Number(
        partes[1]
      )

    const dia =
      Number(
        partes[2]
      )

    if (
      !Number.isInteger(ano) ||
      !Number.isInteger(mes) ||
      !Number.isInteger(dia)
    ) {
      throw new ValidationError(
        VENDA_MESSAGES
          .INVALID_DATE
      )
    }

    const data =
      new Date(
        Date.UTC(
          ano,
          mes - 1,
          dia
        )
      )

    if (
      data.getUTCFullYear() !==
        ano ||
      data.getUTCMonth() !==
        mes - 1 ||
      data.getUTCDate() !==
        dia
    ) {
      throw new ValidationError(
        VENDA_MESSAGES
          .INVALID_DATE
      )
    }
  }

  private converterData(
    value: string
  ): Date {
    const partes =
      value.split('-')

    return new Date(
      Date.UTC(
        Number(
          partes[0]
        ),
        Number(
          partes[1]
        ) - 1,
        Number(
          partes[2]
        )
      )
    )
  }

  private handleDatabaseError(
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
      isForeignKeyError(
        error
      )
    ) {
      throw new ValidationError(
        VENDA_MESSAGES
          .INVALID_FOREIGN_KEY
      )
    }

    throw error
  }
}
