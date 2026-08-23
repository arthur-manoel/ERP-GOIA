import {
  create as createMovimentacaoEstoqueRepository,
  deleteMovimentacaoEstoque,
  findAll,
  findById,
  update as updateMovimentacaoEstoqueRepository,
  type MovimentacaoEstoque,
} from './movimentacao_estoque.repository.js'

import type {
  CreateMovimentacaoEstoqueInput,
  ListMovimentacaoEstoqueInput,
  UpdateMovimentacaoEstoqueInput,
} from './movimentacao_estoque.schema.js'

export const MOVIMENTACAO_ESTOQUE_MESSAGES = {
  NOT_FOUND:
    'Movimentação de estoque não encontrada',

  INVALID_QUANTITY:
    'A quantidade deve ser um número inteiro maior ou igual a zero',

  INVALID_VALUE:
    'O valor total deve ser maior ou igual a zero',

  INVALID_FOREIGN_KEY:
    'Empresa, local de estoque, setor, produto ou usuário informado não existe',

  DUPLICATE_RECORD:
    'Já existe uma movimentação com os dados informados',

  CREATED:
    'Movimentação de estoque criada com sucesso',

  UPDATED:
    'Movimentação de estoque atualizada com sucesso',

  DELETED:
    'Movimentação de estoque excluída com sucesso',
} as const

export class NotFoundError
  extends Error {
  constructor(
    message =
      MOVIMENTACAO_ESTOQUE_MESSAGES
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
      MOVIMENTACAO_ESTOQUE_MESSAGES
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

export class MovimentacaoEstoqueService {
  public async criar(
    data:
      CreateMovimentacaoEstoqueInput
  ): Promise<MovimentacaoEstoque> {
    this.validarValores(
      data
    )

    try {
      return await createMovimentacaoEstoqueRepository(
        {
          id_empresa:
            data.id_empresa,

          id_local_estoque:
            data.id_local_estoque,

          id_setor:
            data.id_setor,

          id_produto:
            data.id_produto,

          tipo:
            data.tipo,

          quantidade:
            data.quantidade,

          valor_total:
            data.valor_total,

          origem_tipo:
            data.origem_tipo,

          origem_id:
            data.origem_id,

          id_usuario:
            data.id_usuario,

          observacao:
            data.observacao ??
            null,
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
      ListMovimentacaoEstoqueInput
  ) {
    const page =
      filters.page ?? 1

    const limit =
      filters.limit ?? 20

    const result =
      await findAll(
        {
          idEmpresa:
            filters.id_empresa,

          idSetor:
            filters.id_setor,

          idProduto:
            filters.id_produto,

          tipo:
            filters.tipo,

          origemTipo:
            filters.origem_tipo,
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
  ): Promise<MovimentacaoEstoque> {
    const movimentacao =
      await findById(id)

    if (!movimentacao) {
      throw new NotFoundError()
    }

    return movimentacao
  }

  public async atualizar(
    id: number,
    data:
      UpdateMovimentacaoEstoqueInput
  ): Promise<MovimentacaoEstoque> {
    const atual =
      await findById(id)

    if (!atual) {
      throw new NotFoundError()
    }

    this.validarValores(
      {
        quantidade:
          data.quantidade ??
          atual.quantidade,

        valor_total:
          data.valor_total ??
          atual.valor_total,
      }
    )

    try {
      const movimentacao =
        await updateMovimentacaoEstoqueRepository(
          id,
          data
        )

      if (!movimentacao) {
        throw new NotFoundError()
      }

      return movimentacao
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
    const movimentacao =
      await findById(id)

    if (!movimentacao) {
      throw new NotFoundError()
    }

    const excluido =
      await deleteMovimentacaoEstoque(
        id
      )

    if (!excluido) {
      throw new NotFoundError()
    }

    return {
      message:
        MOVIMENTACAO_ESTOQUE_MESSAGES
          .DELETED,
    }
  }

  private validarValores(
    data: {
      quantidade?: number

      valor_total?: number
    }
  ): void {
    if (
      data.quantidade !==
        undefined &&
      (
        !Number.isInteger(
          data.quantidade
        ) ||
        data.quantidade < 0
      )
    ) {
      throw new ValidationError(
        MOVIMENTACAO_ESTOQUE_MESSAGES
          .INVALID_QUANTITY
      )
    }

    if (
      data.valor_total !==
        undefined &&
      (
        !Number.isFinite(
          data.valor_total
        ) ||
        data.valor_total < 0
      )
    ) {
      throw new ValidationError(
        MOVIMENTACAO_ESTOQUE_MESSAGES
          .INVALID_VALUE
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
        MOVIMENTACAO_ESTOQUE_MESSAGES
          .INVALID_FOREIGN_KEY
      )
    }

    throw error
  }
}