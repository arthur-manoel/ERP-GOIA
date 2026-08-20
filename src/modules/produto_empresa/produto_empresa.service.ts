import {
  create as createRepository,
  findAll,
  findByCodigoInterno,
  findById,
  findByProdutoEmpresa,
  softDelete,
  update as updateRepository,
  type ProdutoEmpresa,
} from './produto_empresa.repository.js'

import type {
  CreateProdutoEmpresaInput,
  ListProdutoEmpresaInput,
  UpdateProdutoEmpresaInput,
} from './produto_empresa.schema.js'

export const
  PRODUTO_EMPRESA_MESSAGES =
    {
      NOT_FOUND:
        'Produto da empresa não encontrado',

      ASSOCIATION_ALREADY_EXISTS:
        'Este produto já está vinculado a esta empresa',

      CODE_ALREADY_EXISTS:
        'Este código interno já está sendo utilizado nesta empresa',

      INVALID_STOCK_RANGE:
        'O estoque máximo não pode ser menor que o estoque mínimo',

      CREATED:
        'Produto vinculado à empresa com sucesso',

      UPDATED:
        'Produto da empresa atualizado com sucesso',

      DELETED:
        'Produto da empresa desativado com sucesso',
    } as const

export class NotFoundError
  extends Error {
  constructor(
    message =
      PRODUTO_EMPRESA_MESSAGES
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
    message: string
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

export class ProdutoEmpresaService {
  public async criar(
    data:
      CreateProdutoEmpresaInput
  ): Promise<ProdutoEmpresa> {
    if (
      data.estoque_maximo <
      data.estoque_minimo
    ) {
      throw new ValidationError(
        PRODUTO_EMPRESA_MESSAGES
          .INVALID_STOCK_RANGE
      )
    }

    const association =
      await findByProdutoEmpresa(
        data.id_empresa,
        data.id_produto
      )

    if (association) {
      throw new ConflictError(
        PRODUTO_EMPRESA_MESSAGES
          .ASSOCIATION_ALREADY_EXISTS
      )
    }

    const codigoExistente =
      await findByCodigoInterno(
        data.id_empresa,
        data.codigo_interno
      )

    if (codigoExistente) {
      throw new ConflictError(
        PRODUTO_EMPRESA_MESSAGES
          .CODE_ALREADY_EXISTS
      )
    }

    return createRepository(
      data
    )
  }

  public async listar(
    filters:
      ListProdutoEmpresaInput
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

          idProduto:
            filters.id_produto,

          codigoInterno:
            filters.codigo_interno,

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
  ): Promise<ProdutoEmpresa> {
    const produtoEmpresa =
      await findById(id)

    if (!produtoEmpresa) {
      throw new NotFoundError()
    }

    return produtoEmpresa
  }

  public async atualizar(
    id: number,
    data:
      UpdateProdutoEmpresaInput
  ): Promise<ProdutoEmpresa> {
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

    const codigoFinal =
      data.codigo_interno ??
      atual.codigo_interno

    const estoqueMinimoFinal =
      data.estoque_minimo ??
      atual.estoque_minimo

    const estoqueMaximoFinal =
      data.estoque_maximo ??
      atual.estoque_maximo

    if (
      estoqueMaximoFinal <
      estoqueMinimoFinal
    ) {
      throw new ValidationError(
        PRODUTO_EMPRESA_MESSAGES
          .INVALID_STOCK_RANGE
      )
    }

    if (
      idEmpresaFinal !==
        atual.id_empresa ||
      idProdutoFinal !==
        atual.id_produto
    ) {
      const association =
        await findByProdutoEmpresa(
          idEmpresaFinal,
          idProdutoFinal
        )

      if (
        association &&
        association.id !== id
      ) {
        throw new ConflictError(
          PRODUTO_EMPRESA_MESSAGES
            .ASSOCIATION_ALREADY_EXISTS
        )
      }
    }

    if (
      idEmpresaFinal !==
        atual.id_empresa ||
      codigoFinal !==
        atual.codigo_interno
    ) {
      const codigoExistente =
        await findByCodigoInterno(
          idEmpresaFinal,
          codigoFinal
        )

      if (
        codigoExistente &&
        codigoExistente.id !==
          id
      ) {
        throw new ConflictError(
          PRODUTO_EMPRESA_MESSAGES
            .CODE_ALREADY_EXISTS
        )
      }
    }

    const atualizado =
      await updateRepository(
        id,
        data
      )

    if (!atualizado) {
      throw new NotFoundError()
    }

    return atualizado
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
        PRODUTO_EMPRESA_MESSAGES
          .DELETED,
    }
  }
}