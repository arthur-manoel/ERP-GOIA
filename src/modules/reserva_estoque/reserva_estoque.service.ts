import {
  cancel,
  create as createReservaEstoqueRepository,
  findAll,
  findById,
  update as updateReservaEstoqueRepository,
  type ReservaEstoque,
  type ReservaEstoqueStatus,
  type ReservaEstoqueTipoOrigem,
} from './reserva_estoque.repository.js'

import type {
  CreateReservaEstoqueInput,
  ListReservaEstoqueInput,
  UpdateReservaEstoqueInput,
} from './reserva_estoque.schema.js'

export const RESERVA_ESTOQUE_MESSAGES = {
  NOT_FOUND:
    'Reserva de estoque não encontrada',

  INVALID_QUANTITY:
    'A quantidade deve ser um número inteiro maior ou igual a zero',

  INVALID_ORIGIN:
    'A origem informada é inválida',

  VENDA_REQUIRED:
    'id_venda é obrigatório quando tipo_origem for VENDA',

  ORDEM_PRODUCAO_REQUIRED:
    'id_ordem_producao é obrigatório quando tipo_origem for ORDEM_PRODUCAO',

  NECESSIDADE_PRODUCAO_REQUIRED:
    'id_necessidade_producao é obrigatório quando tipo_origem for NECESSIDADE_PRODUCAO',

  INVALID_ORIGIN_IDS:
    'Apenas o identificador correspondente ao tipo de origem deve ser informado',

  DUPLICATE_RECORD:
    'Já existe uma reserva com os dados informados',

  INVALID_FOREIGN_KEY:
    'Empresa, setor, produto, usuário ou origem informada não existe',

  CREATED:
    'Reserva de estoque criada com sucesso',

  UPDATED:
    'Reserva de estoque atualizada com sucesso',

  CANCELLED:
    'Reserva de estoque cancelada com sucesso',
} as const

export class NotFoundError
  extends Error {
  constructor(
    message =
      RESERVA_ESTOQUE_MESSAGES
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
      RESERVA_ESTOQUE_MESSAGES
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

export class ReservaEstoqueService {
  public async criar(
    data:
      CreateReservaEstoqueInput
  ): Promise<ReservaEstoque> {
    this.validarQuantidade(
      data.quantidade
    )

    this.validarOrigem(
      data.tipo_origem,
      data.id_venda,
      data.id_ordem_producao,
      data.id_necessidade_producao
    )

    try {
      return await createReservaEstoqueRepository(
        {
          id_empresa:
            data.id_empresa,

          id_setor:
            data.id_setor,

          id_produto:
            data.id_produto,

          tipo_origem:
            data.tipo_origem,

          id_venda:
            data.id_venda ??
            null,

          id_ordem_producao:
            data.id_ordem_producao ??
            null,

          id_necessidade_producao:
            data.id_necessidade_producao ??
            null,

          quantidade:
            data.quantidade,

          status:
            data.status ??
            'RESERVADO',

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
      ListReservaEstoqueInput
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
  ): Promise<ReservaEstoque> {
    const reserva =
      await findById(id)

    if (!reserva) {
      throw new NotFoundError()
    }

    return reserva
  }

  public async atualizar(
    id: number,
    data:
      UpdateReservaEstoqueInput
  ): Promise<ReservaEstoque> {
    const atual =
      await findById(id)

    if (!atual) {
      throw new NotFoundError()
    }

    const tipoOrigemFinal =
      data.tipo_origem ??
      atual.tipo_origem

    const idVendaFinal =
      data.id_venda !==
      undefined
        ? data.id_venda
        : atual.id_venda

    const idOrdemProducaoFinal =
      data.id_ordem_producao !==
      undefined
        ? data.id_ordem_producao
        : atual.id_ordem_producao

    const idNecessidadeProducaoFinal =
      data.id_necessidade_producao !==
      undefined
        ? data.id_necessidade_producao
        : atual.id_necessidade_producao

    const quantidadeFinal =
      data.quantidade ??
      atual.quantidade

    this.validarQuantidade(
      quantidadeFinal
    )

    this.validarOrigem(
      tipoOrigemFinal,
      idVendaFinal,
      idOrdemProducaoFinal,
      idNecessidadeProducaoFinal
    )

    try {
      const atualizado =
        await updateReservaEstoqueRepository(
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

  public async cancelar(
    id: number
  ): Promise<{
    message: string
  }> {
    const reserva =
      await findById(id)

    if (!reserva) {
      throw new NotFoundError()
    }

    if (
      reserva.status !==
      'CANCELADO'
    ) {
      const cancelada =
        await cancel(id)

      if (!cancelada) {
        throw new NotFoundError()
      }
    }

    return {
      message:
        RESERVA_ESTOQUE_MESSAGES
          .CANCELLED,
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
        RESERVA_ESTOQUE_MESSAGES
          .INVALID_QUANTITY
      )
    }
  }

  private validarOrigem(
    tipoOrigem:
      ReservaEstoqueTipoOrigem,

    idVenda?:
      number | null,

    idOrdemProducao?:
      number | null,

    idNecessidadeProducao?:
      number | null
  ): void {
    if (
      tipoOrigem ===
      'VENDA'
    ) {
      if (!idVenda) {
        throw new ValidationError(
          RESERVA_ESTOQUE_MESSAGES
            .VENDA_REQUIRED
        )
      }

      if (
        idOrdemProducao ||
        idNecessidadeProducao
      ) {
        throw new ValidationError(
          RESERVA_ESTOQUE_MESSAGES
            .INVALID_ORIGIN_IDS
        )
      }

      return
    }

    if (
      tipoOrigem ===
      'ORDEM_PRODUCAO'
    ) {
      if (
        !idOrdemProducao
      ) {
        throw new ValidationError(
          RESERVA_ESTOQUE_MESSAGES
            .ORDEM_PRODUCAO_REQUIRED
        )
      }

      if (
        idVenda ||
        idNecessidadeProducao
      ) {
        throw new ValidationError(
          RESERVA_ESTOQUE_MESSAGES
            .INVALID_ORIGIN_IDS
        )
      }

      return
    }

    if (
      tipoOrigem ===
      'NECESSIDADE_PRODUCAO'
    ) {
      if (
        !idNecessidadeProducao
      ) {
        throw new ValidationError(
          RESERVA_ESTOQUE_MESSAGES
            .NECESSIDADE_PRODUCAO_REQUIRED
        )
      }

      if (
        idVenda ||
        idOrdemProducao
      ) {
        throw new ValidationError(
          RESERVA_ESTOQUE_MESSAGES
            .INVALID_ORIGIN_IDS
        )
      }
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
        RESERVA_ESTOQUE_MESSAGES
          .INVALID_FOREIGN_KEY
      )
    }

    throw error
  }
}