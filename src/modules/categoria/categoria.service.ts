import {
  create as createCategoriaRepository,
  findAll,
  findById,
  findByNome,
  softDelete,
  update as updateCategoriaRepository,
  type Categoria,
  type UpdateCategoriaData,
} from './categoria.repository.js'

import type {
  CreateCategoriaInput,
  ListCategoriaInput,
  UpdateCategoriaInput,
} from './categoria.schema.js'

export const CATEGORIA_MESSAGES =
  {
    NOT_FOUND:
      'Categoria não encontrada',

    NAME_ALREADY_EXISTS:
      'Já existe uma categoria cadastrada com este nome',

    INVALID_DATA:
      'Dados inválidos',

    EMPTY_UPDATE:
      'Informe pelo menos um campo para atualização',

    CREATED:
      'Categoria criada com sucesso',

    UPDATED:
      'Categoria atualizada com sucesso',

    DELETED:
      'Categoria desativada com sucesso',
  } as const

export class NotFoundError
  extends Error {
  public readonly statusCode =
    404

  constructor(
    message =
      CATEGORIA_MESSAGES.NOT_FOUND
  ) {
    super(message)

    this.name =
      'NotFoundError'
  }
}

export class ConflictError
  extends Error {
  public readonly statusCode =
    409

  constructor(
    message =
      CATEGORIA_MESSAGES.NAME_ALREADY_EXISTS
  ) {
    super(message)

    this.name =
      'ConflictError'
  }
}

export class ValidationError
  extends Error {
  public readonly statusCode =
    400

  constructor(
    message: string =
      CATEGORIA_MESSAGES.INVALID_DATA
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

export class CategoriaService {
  public async criar(
    data: CreateCategoriaInput
  ): Promise<Categoria> {
    const nome =
      data.nome.trim()

    const categoriaExistente =
      await findByNome(nome)

    if (
      categoriaExistente
    ) {
      throw new ConflictError()
    }

    try {
      return await createCategoriaRepository(
        {
          nome,

          descricao:
            this.normalizeDescricao(
              data.descricao
            ),

          ativo:
            data.ativo ?? true,
        }
      )
    } catch (error) {
      if (
        isDuplicateEntryError(
          error
        )
      ) {
        throw new ConflictError()
      }

      throw error
    }
  }

  public async listar(
    filters: ListCategoriaInput
  ): Promise<{
    rows: Categoria[]
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
      await findAll(
        {
          q:
            filters.q?.trim() ||
            undefined,

          includeInativos:
            filters.include_inativos ??
            false,
        },
        {
          page,
          limit,
        }
      )

    return {
      rows: result.rows,
      count: result.count,
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
  ): Promise<Categoria> {
    const categoria =
      await findById(id)

    if (!categoria) {
      throw new NotFoundError()
    }

    return categoria
  }

  public async atualizar(
    id: number,
    data: UpdateCategoriaInput
  ): Promise<Categoria> {
    if (
      Object.keys(data).length ===
      0
    ) {
      throw new ValidationError(
        CATEGORIA_MESSAGES.EMPTY_UPDATE
      )
    }

    const categoriaAtual =
      await findById(id)

    if (!categoriaAtual) {
      throw new NotFoundError()
    }

    const updateData:
      UpdateCategoriaData =
      {}

    if (
      data.nome !== undefined
    ) {
      const nome =
        data.nome.trim()

      const categoriaComMesmoNome =
        await findByNome(nome)

      if (
        categoriaComMesmoNome &&
        categoriaComMesmoNome.id !==
          id
      ) {
        throw new ConflictError()
      }

      updateData.nome =
        nome
    }

    if (
      data.descricao !==
      undefined
    ) {
      updateData.descricao =
        this.normalizeDescricao(
          data.descricao
        )
    }

    if (
      data.ativo !== undefined
    ) {
      updateData.ativo =
        data.ativo
    }

    try {
      const categoria =
        await updateCategoriaRepository(
          id,
          updateData
        )

      if (!categoria) {
        throw new NotFoundError()
      }

      return categoria
    } catch (error) {
      if (
        isDuplicateEntryError(
          error
        )
      ) {
        throw new ConflictError()
      }

      throw error
    }
  }

  public async excluir(
    id: number
  ): Promise<{
    message: string
  }> {
    const categoria =
      await findById(id)

    if (!categoria) {
      throw new NotFoundError()
    }

    /*
     * A exclusão é idempotente.
     * Se a categoria já estiver
     * inativa, continua sendo
     * considerada excluída.
     */
    if (categoria.ativo) {
      await softDelete(id)
    }

    return {
      message:
        CATEGORIA_MESSAGES.DELETED,
    }
  }

  private normalizeDescricao(
    descricao:
      | string
      | null
      | undefined
  ): string | null {
    if (
      descricao === null ||
      descricao === undefined
    ) {
      return null
    }

    const descricaoNormalizada =
      descricao.trim()

    return (
      descricaoNormalizada ||
      null
    )
  }
}