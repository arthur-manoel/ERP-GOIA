import {
  create as createProdutoRepository,
  findAll,
  findByCodigo,
  findById,
  softDelete,
  update as updateProdutoRepository,
  type Produto,
  type UpdateProdutoData,
} from './produtos.repository.js'

import type {
  CreateProdutoInput,
  ListProdutosInput,
  UpdateProdutoInput,
} from './produtos.schema.js'

export const PRODUTO_MESSAGES =
  {
    NOT_FOUND:
      'Produto não encontrado',

    CODE_ALREADY_EXISTS:
      'Já existe um produto cadastrado com este código',

    INVALID_DATA:
      'Dados inválidos',

    EMPTY_UPDATE:
      'Informe pelo menos um campo para atualização',

    INVALID_FOREIGN_KEY:
      'Tipo de produto, categoria ou modelo informado não existe',

    CREATED:
      'Produto criado com sucesso',

    UPDATED:
      'Produto atualizado com sucesso',

    DELETED:
      'Produto desativado com sucesso',
  } as const

export class NotFoundError
  extends Error {
  public readonly statusCode =
    404

  constructor(
    message =
      PRODUTO_MESSAGES.NOT_FOUND
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
    message: string =
      PRODUTO_MESSAGES.CODE_ALREADY_EXISTS
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

  public readonly details?:
    unknown

  constructor(
    message: string =
      PRODUTO_MESSAGES.INVALID_DATA,
    details?: unknown
  ) {
    super(message)

    this.name =
      'ValidationError'

    this.details = details
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

export class ProdutoService {
  public async criar(
    data: CreateProdutoInput
  ): Promise<Produto> {
    const codigo =
      data.codigo.trim()

    const produtoCodigo =
      await findByCodigo(
        codigo
      )

    if (produtoCodigo) {
      throw new ConflictError()
    }

    try {
      return await createProdutoRepository(
        {
          id_tipo_produto:
            data.id_tipo_produto,

          id_categoria:
            data.id_categoria,

          id_modelo:
            data.id_modelo,

          nome:
            data.nome.trim(),

          codigo,

          descricao:
            this.normalizeDescricao(
              data.descricao
            ),

          unidade:
            data.unidade
              .trim()
              .toUpperCase(),

          controla_estoque:
            data.controla_estoque,

          permite_venda:
            data.permite_venda,

          permite_compra:
            data.permite_compra,

          permite_producao:
            data.permite_producao,

          status:
            data.status,
        }
      )
    } catch (error) {
      this.handleDatabaseError(
        error
      )

      throw error
    }
  }

  public async listar(
    filters: ListProdutosInput
  ): Promise<{
    rows: Produto[]
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

          idTipoProduto:
            filters.id_tipo_produto,

          idCategoria:
            filters.id_categoria,

          idModelo:
            filters.id_modelo,

          status:
            filters.status,

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
  ): Promise<Produto> {
    const produto =
      await findById(id)

    if (!produto) {
      throw new NotFoundError()
    }

    return produto
  }

  public async atualizar(
    id: number,
    data: UpdateProdutoInput
  ): Promise<Produto> {
    if (
      Object.keys(data).length ===
      0
    ) {
      throw new ValidationError(
        PRODUTO_MESSAGES.EMPTY_UPDATE
      )
    }

    const produtoAtual =
      await findById(id)

    if (!produtoAtual) {
      throw new NotFoundError()
    }

    const updateData:
      UpdateProdutoData =
      {}

    if (
      data.codigo !== undefined
    ) {
      const codigo =
        data.codigo.trim()

      const produtoCodigo =
        await findByCodigo(
          codigo
        )

      if (
        produtoCodigo &&
        produtoCodigo.id !== id
      ) {
        throw new ConflictError()
      }

      updateData.codigo =
        codigo
    }

    if (
      data.id_tipo_produto !==
      undefined
    ) {
      updateData.id_tipo_produto =
        data.id_tipo_produto
    }

    if (
      data.id_categoria !==
      undefined
    ) {
      updateData.id_categoria =
        data.id_categoria
    }

    if (
      data.id_modelo !==
      undefined
    ) {
      updateData.id_modelo =
        data.id_modelo
    }

    if (
      data.nome !== undefined
    ) {
      updateData.nome =
        data.nome.trim()
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
      data.unidade !== undefined
    ) {
      updateData.unidade =
        data.unidade
          .trim()
          .toUpperCase()
    }

    if (
      data.controla_estoque !==
      undefined
    ) {
      updateData.controla_estoque =
        data.controla_estoque
    }

    if (
      data.permite_venda !==
      undefined
    ) {
      updateData.permite_venda =
        data.permite_venda
    }

    if (
      data.permite_compra !==
      undefined
    ) {
      updateData.permite_compra =
        data.permite_compra
    }

    if (
      data.permite_producao !==
      undefined
    ) {
      updateData.permite_producao =
        data.permite_producao
    }

    if (
      data.status !== undefined
    ) {
      updateData.status =
        data.status
    }

    try {
      const produtoAtualizado =
        await updateProdutoRepository(
          id,
          updateData
        )

      if (!produtoAtualizado) {
        throw new NotFoundError()
      }

      return produtoAtualizado
    } catch (error) {
      this.handleDatabaseError(
        error
      )

      throw error
    }
  }

  public async excluir(
    id: number
  ): Promise<{
    message: string
  }> {
    const produto =
      await findById(id)

    if (!produto) {
      throw new NotFoundError()
    }

    if (
      produto.status !==
      'INATIVO'
    ) {
      await softDelete(id)
    }

    return {
      message:
        PRODUTO_MESSAGES.DELETED,
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

    const value =
      descricao.trim()

    return value || null
  }

  private handleDatabaseError(
    error: unknown
  ): void {
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
        PRODUTO_MESSAGES.INVALID_FOREIGN_KEY
      )
    }
  }
}