import {
  create as createProdutoFornecedorRepository,
  findAll,
  findByAssociacao,
  findById,
  softDelete,
  update as updateProdutoFornecedorRepository,
  type ProdutoFornecedor,
} from './produto_fornecedor.repository.js'

import type {
  CreateProdutoFornecedorInput,
  ListProdutoFornecedorInput,
  UpdateProdutoFornecedorInput,
} from './produto_fornecedor.schema.js'

export const PRODUTO_FORNECEDOR_MESSAGES = {
  NOT_FOUND:
    'Produto fornecedor não encontrado',

  ASSOCIATION_ALREADY_EXISTS:
    'Este produto já está vinculado a esta empresa',

  INVALID_PRICE:
    'O preço da última compra deve ser maior que zero',

  INVALID_DELIVERY_TIME:
    'O prazo de entrega deve ser um número inteiro maior ou igual a zero',

  INVALID_MINIMUM_QUANTITY:
    'A quantidade mínima deve ser um número inteiro maior ou igual a zero',

  INVALID_FOREIGN_KEY:
    'Empresa ou produto informado não existe',

  CREATED:
    'Produto fornecedor criado com sucesso',

  UPDATED:
    'Produto fornecedor atualizado com sucesso',

  DELETED:
    'Produto fornecedor desativado com sucesso',
} as const

export class NotFoundError extends Error {
  constructor(
    message =
      PRODUTO_FORNECEDOR_MESSAGES.NOT_FOUND
  ) {
    super(message)

    this.name = 'NotFoundError'
  }
}

export class ConflictError extends Error {
  constructor(
    message =
      PRODUTO_FORNECEDOR_MESSAGES
        .ASSOCIATION_ALREADY_EXISTS
  ) {
    super(message)

    this.name = 'ConflictError'
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message)

    this.name = 'ValidationError'
  }
}

interface DatabaseError extends Error {
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

function isForeignKeyError(
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
      'ER_NO_REFERENCED_ROW_2' ||
    databaseError.errno === 1452
  )
}

export class ProdutoFornecedorService {
  public async criar(
    data: CreateProdutoFornecedorInput
  ): Promise<ProdutoFornecedor> {
    this.validarValores(data)

    const associacaoExistente =
      await findByAssociacao(
        data.id_empresa,
        data.id_produto
      )

    if (associacaoExistente) {
      throw new ConflictError()
    }

    try {
      return await createProdutoFornecedorRepository({
        id_empresa:
          data.id_empresa,

        id_produto:
          data.id_produto,

        codigo_produto_fornecedor:
          data.codigo_produto_fornecedor ??
          null,

        preco_ultima_compra:
          data.preco_ultima_compra ??
          null,

        prazo_entrega_dias:
          data.prazo_entrega_dias ??
          null,

        quantidade_minima:
          data.quantidade_minima ??
          null,

        fornecedor_principal:
          data.fornecedor_principal ??
          false,

        status:
          data.status,
      })
    } catch (error) {
      this.handleDatabaseError(error)
    }
  }

  public async listar(
    filters: ListProdutoFornecedorInput
  ): Promise<{
    rows: ProdutoFornecedor[]
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
          idEmpresa:
            filters.id_empresa,

          idProduto:
            filters.id_produto,

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
  ): Promise<ProdutoFornecedor> {
    const produtoFornecedor =
      await findById(id)

    if (!produtoFornecedor) {
      throw new NotFoundError()
    }

    return produtoFornecedor
  }

  public async atualizar(
    id: number,
    data: UpdateProdutoFornecedorInput
  ): Promise<ProdutoFornecedor> {
    this.validarValores(data)

    const atual =
      await findById(id)

    if (!atual) {
      throw new NotFoundError()
    }

    const idEmpresaFinal =
      data.id_empresa ??
      atual.id_empresa

    const idProdutoFinal =
      data.id_produto ??
      atual.id_produto

    const empresaAlterada =
      data.id_empresa !== undefined &&
      data.id_empresa !==
        atual.id_empresa

    const produtoAlterado =
      data.id_produto !== undefined &&
      data.id_produto !==
        atual.id_produto

    if (
      empresaAlterada ||
      produtoAlterado
    ) {
      const associacaoExistente =
        await findByAssociacao(
          idEmpresaFinal,
          idProdutoFinal
        )

      if (
        associacaoExistente &&
        associacaoExistente.id !== id
      ) {
        throw new ConflictError()
      }
    }

    try {
      const atualizado =
        await updateProdutoFornecedorRepository(
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

      this.handleDatabaseError(error)
    }
  }

  public async excluir(
    id: number
  ): Promise<{
    message: string
  }> {
    const atual =
      await findById(id)

    if (!atual) {
      throw new NotFoundError()
    }

    if (
      atual.status !==
      'INATIVO'
    ) {
      await softDelete(id)
    }

    return {
      message:
        PRODUTO_FORNECEDOR_MESSAGES
          .DELETED,
    }
  }

  private validarValores(
    data: {
      preco_ultima_compra?:
        number

      prazo_entrega_dias?:
        number

      quantidade_minima?:
        number
    }
  ): void {
    if (
      data.preco_ultima_compra !==
        undefined &&
      data.preco_ultima_compra <= 0
    ) {
      throw new ValidationError(
        PRODUTO_FORNECEDOR_MESSAGES
          .INVALID_PRICE
      )
    }

    if (
      data.prazo_entrega_dias !==
        undefined &&
      (
        !Number.isInteger(
          data.prazo_entrega_dias
        ) ||
        data.prazo_entrega_dias < 0
      )
    ) {
      throw new ValidationError(
        PRODUTO_FORNECEDOR_MESSAGES
          .INVALID_DELIVERY_TIME
      )
    }

    if (
      data.quantidade_minima !==
        undefined &&
      (
        !Number.isInteger(
          data.quantidade_minima
        ) ||
        data.quantidade_minima < 0
      )
    ) {
      throw new ValidationError(
        PRODUTO_FORNECEDOR_MESSAGES
          .INVALID_MINIMUM_QUANTITY
      )
    }
  }

  private handleDatabaseError(
    error: unknown
  ): never {
    if (
      isDuplicateEntryError(error)
    ) {
      throw new ConflictError()
    }

    if (
      isForeignKeyError(error)
    ) {
      throw new ValidationError(
        PRODUTO_FORNECEDOR_MESSAGES
          .INVALID_FOREIGN_KEY
      )
    }

    throw error
  }
}

export default ProdutoFornecedorService