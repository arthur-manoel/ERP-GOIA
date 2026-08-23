import {
  create as createLocalEstoqueRepository,
  findAll,
  findById,
  softDelete,
  update as updateLocalEstoqueRepository,
  type LocalEstoque,
} from './locais_estoque.repository.js'

import type {
  CreateLocalEstoqueInput,
  ListLocaisEstoqueInput,
  UpdateLocalEstoqueInput,
} from './locais_estoque.schema.js'

export const LOCAIS_ESTOQUE_MESSAGES = {
  NOT_FOUND:
    'Local de estoque não encontrado',

  DUPLICATE_RECORD:
    'Já existe um local de estoque com os dados informados',

  INVALID_FOREIGN_KEY:
    'Empresa informada não existe',

  CREATED:
    'Local de estoque criado com sucesso',

  UPDATED:
    'Local de estoque atualizado com sucesso',

  DELETED:
    'Local de estoque desativado com sucesso',
} as const

export class NotFoundError
  extends Error {
  constructor(
    message =
      LOCAIS_ESTOQUE_MESSAGES
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
      LOCAIS_ESTOQUE_MESSAGES
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

export class LocaisEstoqueService {
  public async criar(
    data:
      CreateLocalEstoqueInput
  ): Promise<LocalEstoque> {
    try {
      return await createLocalEstoqueRepository(
        {
          id_empresa:
            data.id_empresa,

          nome:
            data.nome,

          descricao:
            data.descricao ??
            null,

          status:
            data.status ??
            'ATIVO',
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
      ListLocaisEstoqueInput
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
  ): Promise<LocalEstoque> {
    const local =
      await findById(id)

    if (!local) {
      throw new NotFoundError()
    }

    return local
  }

  public async atualizar(
    id: number,
    data:
      UpdateLocalEstoqueInput
  ): Promise<LocalEstoque> {
    const atual =
      await findById(id)

    if (!atual) {
      throw new NotFoundError()
    }

    try {
      const atualizado =
        await updateLocalEstoqueRepository(
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
    const local =
      await findById(id)

    if (!local) {
      throw new NotFoundError()
    }

    if (
      local.status !==
      'INATIVO'
    ) {
      const excluido =
        await softDelete(id)

      if (!excluido) {
        throw new NotFoundError()
      }
    }

    return {
      message:
        LOCAIS_ESTOQUE_MESSAGES
          .DELETED,
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
        LOCAIS_ESTOQUE_MESSAGES
          .INVALID_FOREIGN_KEY
      )
    }

    throw error
  }
}