import {
  cancel,
  create as createNecessidadeProducaoRepository,
  findAll,
  findById,
  update as updateNecessidadeProducaoRepository,
  type NecessidadeProducao,
} from './necessidade_producao.repository.js'

import type {
  CreateNecessidadeProducaoInput,
  ListNecessidadeProducaoInput,
  UpdateNecessidadeProducaoInput,
} from './necessidade_producao.schema.js'

export const NECESSIDADE_PRODUCAO_MESSAGES = {
  NOT_FOUND:
    'Necessidade de produção não encontrada',

  INVALID_REQUIRED_QUANTITY:
    'A quantidade necessária deve ser um número inteiro maior ou igual a zero',

  INVALID_RESERVED_QUANTITY:
    'A quantidade reservada deve ser um número inteiro maior ou igual a zero',

  INVALID_CONSUMED_QUANTITY:
    'A quantidade consumida deve ser um número inteiro maior ou igual a zero',

  RESERVED_GREATER_THAN_REQUIRED:
    'A quantidade reservada não pode ser maior que a quantidade necessária',

  CONSUMED_GREATER_THAN_RESERVED:
    'A quantidade consumida não pode ser maior que a quantidade reservada',

  INVALID_FOREIGN_KEY:
    'Ordem de produção ou produto informado não existe',

  DUPLICATE_RECORD:
    'Já existe uma necessidade de produção com os dados informados',

  CREATED:
    'Necessidade de produção criada com sucesso',

  UPDATED:
    'Necessidade de produção atualizada com sucesso',

  CANCELLED:
    'Necessidade de produção cancelada com sucesso',
} as const

export class NotFoundError
  extends Error {
  constructor(
    message =
      NECESSIDADE_PRODUCAO_MESSAGES
        .NOT_FOUND
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
      NECESSIDADE_PRODUCAO_MESSAGES
        .DUPLICATE_RECORD
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

export class NecessidadeProducaoService {
  public async criar(
    data:
      CreateNecessidadeProducaoInput
  ): Promise<NecessidadeProducao> {
    this.validarQuantidades(
      data.quantidade_necessaria,
      data.quantidade_reservada,
      data.quantidade_consumida
    )

    try {
      return await createNecessidadeProducaoRepository(
        {
          id_ordem_producao:
            data.id_ordem_producao,

          id_produto:
            data.id_produto,

          quantidade_necessaria:
            data.quantidade_necessaria,

          quantidade_reservada:
            data.quantidade_reservada,

          quantidade_consumida:
            data.quantidade_consumida,

          status:
            data.status ??
            'PENDENTE',
        }
      )
    } catch (error) {
      this.handleDatabaseError(
        error
      )
    }
  }

  public async listar(
    filters:
      ListNecessidadeProducaoInput
  ) {
    const page =
      filters.page ?? 1

    const limit =
      filters.limit ?? 20

    const result =
      await findAll(
        {
          idOrdemProducao:
            filters.id_ordem_producao,

          idProduto:
            filters.id_produto,

          status:
            filters.status,
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
  ): Promise<NecessidadeProducao> {
    const necessidade =
      await findById(id)

    if (!necessidade) {
      throw new NotFoundError()
    }

    return necessidade
  }

  public async atualizar(
    id: number,
    data:
      UpdateNecessidadeProducaoInput
  ): Promise<NecessidadeProducao> {
    const atual =
      await findById(id)

    if (!atual) {
      throw new NotFoundError()
    }

    const quantidadeNecessariaFinal =
      data.quantidade_necessaria ??
      atual.quantidade_necessaria

    const quantidadeReservadaFinal =
      data.quantidade_reservada ??
      atual.quantidade_reservada

    const quantidadeConsumidaFinal =
      data.quantidade_consumida ??
      atual.quantidade_consumida

    this.validarQuantidades(
      quantidadeNecessariaFinal,
      quantidadeReservadaFinal,
      quantidadeConsumidaFinal
    )

    try {
      const atualizado =
        await updateNecessidadeProducaoRepository(
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
    const necessidade =
      await findById(id)

    if (!necessidade) {
      throw new NotFoundError()
    }

    if (
      necessidade.status !==
      'CANCELADO'
    ) {
      const cancelada =
        await cancel(id)

      if (!cancelada) {
        throw new NotFoundError()
      }
    }

    return {
      message:
        NECESSIDADE_PRODUCAO_MESSAGES
          .CANCELLED,
    }
  }

  private validarQuantidades(
    quantidadeNecessaria: number,
    quantidadeReservada: number,
    quantidadeConsumida: number
  ): void {
    if (
      !Number.isInteger(
        quantidadeNecessaria
      ) ||
      quantidadeNecessaria < 0
    ) {
      throw new ValidationError(
        NECESSIDADE_PRODUCAO_MESSAGES
          .INVALID_REQUIRED_QUANTITY
      )
    }

    if (
      !Number.isInteger(
        quantidadeReservada
      ) ||
      quantidadeReservada < 0
    ) {
      throw new ValidationError(
        NECESSIDADE_PRODUCAO_MESSAGES
          .INVALID_RESERVED_QUANTITY
      )
    }

    if (
      !Number.isInteger(
        quantidadeConsumida
      ) ||
      quantidadeConsumida < 0
    ) {
      throw new ValidationError(
        NECESSIDADE_PRODUCAO_MESSAGES
          .INVALID_CONSUMED_QUANTITY
      )
    }

    if (
      quantidadeReservada >
      quantidadeNecessaria
    ) {
      throw new ValidationError(
        NECESSIDADE_PRODUCAO_MESSAGES
          .RESERVED_GREATER_THAN_REQUIRED
      )
    }

    if (
      quantidadeConsumida >
      quantidadeReservada
    ) {
      throw new ValidationError(
        NECESSIDADE_PRODUCAO_MESSAGES
          .CONSUMED_GREATER_THAN_RESERVED
      )
    }
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
        NECESSIDADE_PRODUCAO_MESSAGES
          .INVALID_FOREIGN_KEY
      )
    }

    throw error
  }
}