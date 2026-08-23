import {
  create as createOrdemProducaoItemRepository,
  deleteOrdemProducaoItem,
  findAll,
  findById,
  update as updateOrdemProducaoItemRepository,
  type OrdemProducaoItem,
} from './ordem_producao_item.repository.js'

import type {
  CreateOrdemProducaoItemInput,
  ListOrdemProducaoItemInput,
  UpdateOrdemProducaoItemInput,
} from './ordem_producao_item.schema.js'

export const ORDEM_PRODUCAO_ITEM_MESSAGES = {
  NOT_FOUND:
    'Item da ordem de produção não encontrado',

  INVALID_QUANTITY:
    'A quantidade deve ser um número inteiro maior ou igual a zero',

  INVALID_PRODUCED_QUANTITY:
    'A quantidade produzida deve ser um número inteiro maior ou igual a zero',

  PRODUCED_GREATER_THAN_QUANTITY:
    'A quantidade produzida não pode ser maior que a quantidade da ordem',

  INVALID_FOREIGN_KEY:
    'Ordem de produção, produto, modelo, cor ou tamanho informado não existe',

  DUPLICATE_RECORD:
    'Já existe um item da ordem de produção com os dados informados',

  CREATED:
    'Item da ordem de produção criado com sucesso',

  UPDATED:
    'Item da ordem de produção atualizado com sucesso',

  DELETED:
    'Item da ordem de produção excluído com sucesso',
} as const

export class NotFoundError
  extends Error {
  constructor(
    message =
      ORDEM_PRODUCAO_ITEM_MESSAGES
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
      ORDEM_PRODUCAO_ITEM_MESSAGES
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

export class OrdemProducaoItemService {
  public async criar(
    data:
      CreateOrdemProducaoItemInput
  ): Promise<OrdemProducaoItem> {
    this.validarQuantidades(
      data.quantidade,
      data.quantidade_produzida
    )

    try {
      return await createOrdemProducaoItemRepository(
        {
          id_ordem_producao:
            data.id_ordem_producao,

          id_produto:
            data.id_produto,

          id_modelo:
            data.id_modelo ??
            null,

          id_cor:
            data.id_cor ??
            null,

          id_tamanho:
            data.id_tamanho ??
            null,

          quantidade:
            data.quantidade,

          quantidade_produzida:
            data.quantidade_produzida,
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
      ListOrdemProducaoItemInput
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

          idModelo:
            filters.id_modelo,

          idCor:
            filters.id_cor,

          idTamanho:
            filters.id_tamanho,
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
  ): Promise<OrdemProducaoItem> {
    const item =
      await findById(id)

    if (!item) {
      throw new NotFoundError()
    }

    return item
  }

  public async atualizar(
    id: number,
    data:
      UpdateOrdemProducaoItemInput
  ): Promise<OrdemProducaoItem> {
    const atual =
      await findById(id)

    if (!atual) {
      throw new NotFoundError()
    }

    const quantidadeFinal =
      data.quantidade ??
      atual.quantidade

    const quantidadeProduzidaFinal =
      data.quantidade_produzida ??
      atual.quantidade_produzida

    this.validarQuantidades(
      quantidadeFinal,
      quantidadeProduzidaFinal
    )

    try {
      const atualizado =
        await updateOrdemProducaoItemRepository(
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

  public async excluir(
    id: number
  ): Promise<{
    message: string
  }> {
    const item =
      await findById(id)

    if (!item) {
      throw new NotFoundError()
    }

    const excluido =
      await deleteOrdemProducaoItem(
        id
      )

    if (!excluido) {
      throw new NotFoundError()
    }

    return {
      message:
        ORDEM_PRODUCAO_ITEM_MESSAGES
          .DELETED,
    }
  }

  private validarQuantidades(
    quantidade: number,
    quantidadeProduzida: number
  ): void {
    if (
      !Number.isInteger(
        quantidade
      ) ||
      quantidade < 0
    ) {
      throw new ValidationError(
        ORDEM_PRODUCAO_ITEM_MESSAGES
          .INVALID_QUANTITY
      )
    }

    if (
      !Number.isInteger(
        quantidadeProduzida
      ) ||
      quantidadeProduzida <
        0
    ) {
      throw new ValidationError(
        ORDEM_PRODUCAO_ITEM_MESSAGES
          .INVALID_PRODUCED_QUANTITY
      )
    }

    if (
      quantidadeProduzida >
      quantidade
    ) {
      throw new ValidationError(
        ORDEM_PRODUCAO_ITEM_MESSAGES
          .PRODUCED_GREATER_THAN_QUANTITY
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
        ORDEM_PRODUCAO_ITEM_MESSAGES
          .INVALID_FOREIGN_KEY
      )
    }

    throw error
  }
}