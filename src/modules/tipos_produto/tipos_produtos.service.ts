import {
  create as createTipoProdutoRepository,
  findAll as findAllTiposProdutosRepository,
  findById as findTipoProdutoById,
  findByNome as findTipoProdutoByNome,
  remove as removeTipoProdutoRepository,
  update as updateTipoProdutoRepository,
  type TipoProduto,
  type UpdateTipoProdutoData,
} from './tipos_produtos.repository.js'

import type {
  CreateTipoProdutoInput,
  ListTiposProdutosInput,
  UpdateTipoProdutoInput,
} from './tipos_produtos.schema.js'

export const TIPO_PRODUTO_MESSAGES = {
  NOT_FOUND:
    'Tipo de produto não encontrado',

  NAME_ALREADY_EXISTS:
    'Já existe um tipo de produto cadastrado com este nome',

  INVALID_DATA:
    'Dados inválidos',

  EMPTY_UPDATE:
    'Informe pelo menos um campo para atualização',

  CREATED:
    'Tipo de produto criado com sucesso',

  UPDATED:
    'Tipo de produto atualizado com sucesso',

  DELETED:
    'Tipo de produto excluído com sucesso',
} as const

export class NotFoundError
  extends Error {
  public readonly statusCode = 404

  constructor(
    message: string =
      TIPO_PRODUTO_MESSAGES.NOT_FOUND
  ) {
    super(message)

    this.name =
      'NotFoundError'
  }
}

export class ConflictError
  extends Error {
  public readonly statusCode = 409

  constructor(
    message: string =
      TIPO_PRODUTO_MESSAGES.NAME_ALREADY_EXISTS
  ) {
    super(message)

    this.name =
      'ConflictError'
  }
}

export class ValidationError
  extends Error {
  public readonly statusCode = 400

  public readonly details?:
    unknown

  constructor(
    message: string =
      TIPO_PRODUTO_MESSAGES.INVALID_DATA,
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
    typeof error !== 'object' ||
    error === null
  ) {
    return false
  }

  const databaseError =
    error as DatabaseError

  return (
    databaseError.code ===
      'ER_DUP_ENTRY' ||
    databaseError.errno === 1062
  )
}

export class TipoProdutoService {
  public async criar(
    data: CreateTipoProdutoInput
  ): Promise<TipoProduto> {
    const nome =
      data.nome.trim()

    const tipoProdutoExistente =
      await findTipoProdutoByNome(
        nome
      )

    if (
      tipoProdutoExistente
    ) {
      throw new ConflictError()
    }

    try {
      return await createTipoProdutoRepository({
        nome,
        descricao:
          this.normalizeDescricao(
            data.descricao
          ),
      })
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
    filters: ListTiposProdutosInput
  ): Promise<{
    rows: TipoProduto[]
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
      await findAllTiposProdutosRepository(
        {
          q:
            filters.q?.trim() ||
            undefined,
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
  ): Promise<TipoProduto> {
    const tipoProduto =
      await findTipoProdutoById(
        id
      )

    if (!tipoProduto) {
      throw new NotFoundError()
    }

    return tipoProduto
  }

  public async atualizar(
    id: number,
    data: UpdateTipoProdutoInput
  ): Promise<TipoProduto> {
    if (
      Object.keys(data)
        .length === 0
    ) {
      throw new ValidationError(
        TIPO_PRODUTO_MESSAGES.EMPTY_UPDATE
      )
    }

    const atual =
      await findTipoProdutoById(
        id
      )

    if (!atual) {
      throw new NotFoundError()
    }

    const updateData:
      UpdateTipoProdutoData = {}

    if (
      data.nome !== undefined
    ) {
      const nome =
        data.nome.trim()

      const mesmoNome =
        await findTipoProdutoByNome(
          nome
        )

      if (
        mesmoNome &&
        mesmoNome.id !== id
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

    try {
      const atualizado =
        await updateTipoProdutoRepository(
          id,
          updateData
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
    const tipoProduto =
      await findTipoProdutoById(
        id
      )

    if (!tipoProduto) {
      throw new NotFoundError()
    }

    const deleted =
      await removeTipoProdutoRepository(
        id
      )

    if (!deleted) {
      throw new NotFoundError()
    }

    return {
      message:
        TIPO_PRODUTO_MESSAGES.DELETED,
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

    const normalizada =
      descricao.trim()

    return normalizada || null
  }
}