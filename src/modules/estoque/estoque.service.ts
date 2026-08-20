import {
  create as createEstoqueRepository,
  deleteEstoque,
  findAll,
  findByAssociacao,
  findById,
  update as updateEstoqueRepository,
  type Estoque,
} from './estoque.repository.js'

import type {
  CreateEstoqueInput,
  ListEstoqueInput,
  UpdateEstoqueInput,
} from './estoque.schema.js'

export const ESTOQUE_MESSAGES = {
  NOT_FOUND:
    'Registro de estoque não encontrado',

  ASSOCIATION_ALREADY_EXISTS:
    'Já existe um registro de estoque para este produto neste setor e empresa',

  INVALID_QUANTITY:
    'A quantidade deve ser um número inteiro maior ou igual a zero',

  INVALID_RESERVED_QUANTITY:
    'A quantidade reservada deve ser um número inteiro maior ou igual a zero',

  RESERVED_GREATER_THAN_STOCK:
    'A quantidade reservada não pode ser maior que a quantidade disponível',

  INVALID_FOREIGN_KEY:
    'Empresa, setor ou produto informado não existe',

  CREATED:
    'Registro de estoque criado com sucesso',

  UPDATED:
    'Registro de estoque atualizado com sucesso',

  DELETED:
    'Registro de estoque excluído com sucesso',
} as const

export class NotFoundError
  extends Error {
  constructor(
    message =
      ESTOQUE_MESSAGES.NOT_FOUND
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
      ESTOQUE_MESSAGES
        .ASSOCIATION_ALREADY_EXISTS
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

export class EstoqueService {
  public async criar(
    data: CreateEstoqueInput
  ): Promise<Estoque> {
    this.validarQuantidades(
      data
    )

    const estoqueExistente =
      await findByAssociacao(
        data.id_empresa,
        data.id_setor,
        data.id_produto
      )

    if (estoqueExistente) {
      throw new ConflictError()
    }

    try {
      return await createEstoqueRepository(
        {
          id_empresa:
            data.id_empresa,

          id_setor:
            data.id_setor,

          id_produto:
            data.id_produto,

          quantidade:
            data.quantidade,

          quantidade_reservada:
            data.quantidade_reservada,
        }
      )
    } catch (error) {
      this.handleDatabaseError(
        error
      )
    }
  }

  public async listar(
    filters: ListEstoqueInput
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
  ): Promise<Estoque> {
    const estoque =
      await findById(id)

    if (!estoque) {
      throw new NotFoundError()
    }

    return estoque
  }

  public async atualizar(
    id: number,
    data: UpdateEstoqueInput
  ): Promise<Estoque> {
    const estoqueAtual =
      await findById(id)

    if (!estoqueAtual) {
      throw new NotFoundError()
    }

    const quantidadeFinal =
      data.quantidade ??
      estoqueAtual.quantidade

    const quantidadeReservadaFinal =
      data.quantidade_reservada ??
      estoqueAtual.quantidade_reservada

    this.validarQuantidades(
      {
        quantidade:
          quantidadeFinal,

        quantidade_reservada:
          quantidadeReservadaFinal,
      }
    )

    const idEmpresaFinal =
      data.id_empresa ??
      estoqueAtual.id_empresa

    const idSetorFinal =
      data.id_setor ??
      estoqueAtual.id_setor

    const idProdutoFinal =
      data.id_produto ??
      estoqueAtual.id_produto

    const empresaAlterada =
      data.id_empresa !==
        undefined &&
      data.id_empresa !==
        estoqueAtual.id_empresa

    const setorAlterado =
      data.id_setor !==
        undefined &&
      data.id_setor !==
        estoqueAtual.id_setor

    const produtoAlterado =
      data.id_produto !==
        undefined &&
      data.id_produto !==
        estoqueAtual.id_produto

    if (
      empresaAlterada ||
      setorAlterado ||
      produtoAlterado
    ) {
      const estoqueExistente =
        await findByAssociacao(
          idEmpresaFinal,
          idSetorFinal,
          idProdutoFinal
        )

      if (
        estoqueExistente &&
        estoqueExistente.id !== id
      ) {
        throw new ConflictError()
      }
    }

    try {
      const atualizado =
        await updateEstoqueRepository(
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
    const estoque =
      await findById(id)

    if (!estoque) {
      throw new NotFoundError()
    }

    const excluido =
      await deleteEstoque(id)

    if (!excluido) {
      throw new NotFoundError()
    }

    return {
      message:
        ESTOQUE_MESSAGES.DELETED,
    }
  }

  private validarQuantidades(
    data: {
      quantidade?: number
      quantidade_reservada?: number
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
        ESTOQUE_MESSAGES
          .INVALID_QUANTITY
      )
    }

    if (
      data.quantidade_reservada !==
        undefined &&
      (
        !Number.isInteger(
          data.quantidade_reservada
        ) ||
        data.quantidade_reservada <
          0
      )
    ) {
      throw new ValidationError(
        ESTOQUE_MESSAGES
          .INVALID_RESERVED_QUANTITY
      )
    }

    if (
      data.quantidade !==
        undefined &&
      data.quantidade_reservada !==
        undefined &&
      data.quantidade_reservada >
        data.quantidade
    ) {
      throw new ValidationError(
        ESTOQUE_MESSAGES
          .RESERVED_GREATER_THAN_STOCK
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
        ESTOQUE_MESSAGES
          .INVALID_FOREIGN_KEY
      )
    }

    throw error
  }
}