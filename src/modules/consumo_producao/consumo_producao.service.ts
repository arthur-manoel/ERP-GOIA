import {
  create as createConsumoProducaoRepository,
  deleteConsumoProducao,
  findAll,
  findById,
  findNecessidadeById,
  findReservaById,
  sumQuantidadeByReserva,
  update as updateConsumoProducaoRepository,
  type ConsumoProducao,
} from './consumo_producao.repository.js'

import type {
  CreateConsumoProducaoInput,
  ListConsumoProducaoInput,
  UpdateConsumoProducaoInput,
} from './consumo_producao.schema.js'

export const CONSUMO_PRODUCAO_MESSAGES = {
  NOT_FOUND:
    'Consumo de produção não encontrado',

  INVALID_QUANTITY:
    'A quantidade deve ser um número inteiro maior ou igual a zero',

  RESERVA_NOT_FOUND:
    'A reserva de estoque informada não existe',

  NECESSIDADE_NOT_FOUND:
    'A necessidade de produção informada não existe',

  RESERVA_NOT_AVAILABLE:
    'A reserva de estoque informada não está disponível para consumo',

  PRODUCT_MISMATCH:
    'O produto informado não corresponde à reserva ou à necessidade de produção',

  SECTOR_MISMATCH:
    'O setor informado não corresponde ao setor da reserva de estoque',

  ORDER_MISMATCH:
    'A ordem de produção informada não corresponde à necessidade ou à reserva de estoque',

  NECESSIDADE_MISMATCH:
    'A necessidade de produção informada não corresponde à reserva de estoque',

  RESERVED_QUANTITY_EXCEEDED:
    'A quantidade consumida ultrapassa a quantidade reservada',

  INVALID_FOREIGN_KEY:
    'Um ou mais vínculos informados não existem',

  DUPLICATE_RECORD:
    'Já existe um consumo de produção com os dados informados',

  RECORD_IN_USE:
    'O consumo de produção não pode ser excluído porque está sendo utilizado por outro registro',

  CREATED:
    'Consumo de produção criado com sucesso',

  UPDATED:
    'Consumo de produção atualizado com sucesso',

  DELETED:
    'Consumo de produção excluído com sucesso',
} as const

export class NotFoundError
  extends Error {
  constructor(
    message =
      CONSUMO_PRODUCAO_MESSAGES
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
    message: string =
      CONSUMO_PRODUCAO_MESSAGES
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

function isReferencedError(
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
      'ER_ROW_IS_REFERENCED_2' ||
    databaseError.errno ===
      1451
  )
}

export class ConsumoProducaoService {
  public async criar(
    data:
      CreateConsumoProducaoInput
  ): Promise<ConsumoProducao> {
    this.validarQuantidade(
      data.quantidade
    )

    await this.validarConsistencia(
      {
        id_ordem_producao:
          data.id_ordem_producao,

        id_necessidade_producao:
          data.id_necessidade_producao,

        id_reserva_estoque:
          data.id_reserva_estoque,

        id_produto:
          data.id_produto,

        id_setor:
          data.id_setor,

        quantidade:
          data.quantidade,
      }
    )

    try {
      return await createConsumoProducaoRepository(
        {
          id_ordem_producao:
            data.id_ordem_producao,

          id_necessidade_producao:
            data.id_necessidade_producao,

          id_reserva_estoque:
            data.id_reserva_estoque,

          id_produto:
            data.id_produto,

          id_setor:
            data.id_setor,

          quantidade:
            data.quantidade,

          id_usuario:
            data.id_usuario,
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
      ListConsumoProducaoInput
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

          idNecessidadeProducao:
            filters.id_necessidade_producao,

          idReservaEstoque:
            filters.id_reserva_estoque,

          idProduto:
            filters.id_produto,

          idSetor:
            filters.id_setor,
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
  ): Promise<ConsumoProducao> {
    const consumo =
      await findById(id)

    if (!consumo) {
      throw new NotFoundError()
    }

    return consumo
  }

  public async atualizar(
    id: number,
    data:
      UpdateConsumoProducaoInput
  ): Promise<ConsumoProducao> {
    const atual =
      await findById(id)

    if (!atual) {
      throw new NotFoundError()
    }

    const dadosFinais = {
      id_ordem_producao:
        data.id_ordem_producao ??
        atual.id_ordem_producao,

      id_necessidade_producao:
        data.id_necessidade_producao ??
        atual.id_necessidade_producao,

      id_reserva_estoque:
        data.id_reserva_estoque ??
        atual.id_reserva_estoque,

      id_produto:
        data.id_produto ??
        atual.id_produto,

      id_setor:
        data.id_setor ??
        atual.id_setor,

      quantidade:
        data.quantidade ??
        atual.quantidade,
    }

    this.validarQuantidade(
      dadosFinais.quantidade
    )

    await this.validarConsistencia(
      dadosFinais,
      id
    )

    try {
      const atualizado =
        await updateConsumoProducaoRepository(
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
        NotFoundError ||
        error instanceof
        ConflictError ||
        error instanceof
        ValidationError
      ) {
        throw error
      }

      this.handleDatabaseError(
        error
      )
    }
  }

  public async excluir(
    id: number
  ): Promise<{
    message: string
  }> {
    const consumo =
      await findById(id)

    if (!consumo) {
      throw new NotFoundError()
    }

    try {
      const excluido =
        await deleteConsumoProducao(
          id
        )

      if (!excluido) {
        throw new NotFoundError()
      }

      return {
        message:
          CONSUMO_PRODUCAO_MESSAGES
            .DELETED,
      }
    } catch (error) {
      if (
        error instanceof
        NotFoundError
      ) {
        throw error
      }

      if (
        isReferencedError(
          error
        )
      ) {
        throw new ConflictError(
          CONSUMO_PRODUCAO_MESSAGES
            .RECORD_IN_USE
        )
      }

      throw error
    }
  }

  private validarQuantidade(
    quantidade: number
  ): void {
    if (
      !Number.isInteger(
        quantidade
      ) ||
      quantidade < 0
    ) {
      throw new ValidationError(
        CONSUMO_PRODUCAO_MESSAGES
          .INVALID_QUANTITY
      )
    }
  }

  private async validarConsistencia(
    data: {
      id_ordem_producao: number
      id_necessidade_producao: number
      id_reserva_estoque: number
      id_produto: number
      id_setor: number
      quantidade: number
    },
    excludeId?: number
  ): Promise<void> {
    const reserva =
      await findReservaById(
        data.id_reserva_estoque
      )

    if (!reserva) {
      throw new ConflictError(
        CONSUMO_PRODUCAO_MESSAGES
          .RESERVA_NOT_FOUND
      )
    }

    const necessidade =
      await findNecessidadeById(
        data.id_necessidade_producao
      )

    if (!necessidade) {
      throw new ConflictError(
        CONSUMO_PRODUCAO_MESSAGES
          .NECESSIDADE_NOT_FOUND
      )
    }

    if (
      reserva.status !==
      'RESERVADO'
    ) {
      throw new ConflictError(
        CONSUMO_PRODUCAO_MESSAGES
          .RESERVA_NOT_AVAILABLE
      )
    }

    if (
      necessidade.id_produto !==
        data.id_produto ||
      reserva.id_produto !==
        data.id_produto
    ) {
      throw new ConflictError(
        CONSUMO_PRODUCAO_MESSAGES
          .PRODUCT_MISMATCH
      )
    }

    if (
      reserva.id_setor !==
      data.id_setor
    ) {
      throw new ConflictError(
        CONSUMO_PRODUCAO_MESSAGES
          .SECTOR_MISMATCH
      )
    }

    if (
      necessidade.id_ordem_producao !==
      data.id_ordem_producao
    ) {
      throw new ConflictError(
        CONSUMO_PRODUCAO_MESSAGES
          .ORDER_MISMATCH
      )
    }

    if (
      reserva.id_ordem_producao !==
        null &&
      reserva.id_ordem_producao !==
        data.id_ordem_producao
    ) {
      throw new ConflictError(
        CONSUMO_PRODUCAO_MESSAGES
          .ORDER_MISMATCH
      )
    }

    if (
      reserva.id_necessidade_producao !==
        null &&
      reserva.id_necessidade_producao !==
        data.id_necessidade_producao
    ) {
      throw new ConflictError(
        CONSUMO_PRODUCAO_MESSAGES
          .NECESSIDADE_MISMATCH
      )
    }

    const quantidadeJaConsumida =
      await sumQuantidadeByReserva(
        data.id_reserva_estoque,
        excludeId
      )

    const quantidadeTotal =
      quantidadeJaConsumida +
      data.quantidade

    if (
      quantidadeTotal >
      reserva.quantidade
    ) {
      throw new ConflictError(
        CONSUMO_PRODUCAO_MESSAGES
          .RESERVED_QUANTITY_EXCEEDED
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
      throw new ConflictError(
        CONSUMO_PRODUCAO_MESSAGES
          .DUPLICATE_RECORD
      )
    }

    if (
      isForeignKeyError(
        error
      )
    ) {
      throw new ConflictError(
        CONSUMO_PRODUCAO_MESSAGES
          .INVALID_FOREIGN_KEY
      )
    }

    throw error
  }
}