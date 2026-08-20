import {
  create as createEmpresaFornecedorRepository,
  findAll,
  findByEmpresaFornecedor,
  findById,
  softDelete,
  update as updateEmpresaFornecedorRepository,
  type EmpresaFornecedor,
  type UpdateEmpresaFornecedorData,
} from './empresa_fornecedor.repository.js'

import type {
  CreateEmpresaFornecedorInput,
  ListEmpresaFornecedorInput,
  UpdateEmpresaFornecedorInput,
} from './empresa_fornecedor.schema.js'

export const EMPRESA_FORNECEDOR_MESSAGES =
  {
    NOT_FOUND:
      'Associação entre empresa e fornecedor não encontrada',

    ASSOCIATION_ALREADY_EXISTS:
      'Este fornecedor já está vinculado a esta empresa',

    EMPTY_UPDATE:
      'Informe pelo menos um campo para atualização',

    CREATED:
      'Fornecedor vinculado à empresa com sucesso',

    UPDATED:
      'Associação atualizada com sucesso',

    DELETED:
      'Associação desativada com sucesso',
  } as const

export class NotFoundError
  extends Error {
  constructor(
    message =
      EMPRESA_FORNECEDOR_MESSAGES.NOT_FOUND
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
      EMPRESA_FORNECEDOR_MESSAGES.ASSOCIATION_ALREADY_EXISTS
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

export class EmpresaFornecedorService {
  public async criar(
    data: CreateEmpresaFornecedorInput
  ): Promise<EmpresaFornecedor> {
    const existente =
      await findByEmpresaFornecedor(
        data.id_empresa,
        data.id_fornecedor
      )

    if (existente) {
      throw new ConflictError()
    }

    try {
      return await createEmpresaFornecedorRepository(
        {
          id_empresa:
            data.id_empresa,

          id_fornecedor:
            data.id_fornecedor,

          prazo_pagamento:
            data.prazo_pagamento,

          prazo_entrega:
            data.prazo_entrega,

          observacao:
            data.observacao,

          status:
            data.status,
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
    filters: ListEmpresaFornecedorInput
  ): Promise<{
    rows: EmpresaFornecedor[]
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

          idFornecedor:
            filters.id_fornecedor,

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
  ): Promise<EmpresaFornecedor> {
    const empresaFornecedor =
      await findById(id)

    if (!empresaFornecedor) {
      throw new NotFoundError()
    }

    return empresaFornecedor
  }

  public async atualizar(
    id: number,
    data: UpdateEmpresaFornecedorInput
  ): Promise<EmpresaFornecedor> {
    const atual =
      await findById(id)

    if (!atual) {
      throw new NotFoundError()
    }

    const novoIdEmpresa =
      data.id_empresa ??
      atual.id_empresa

    const novoIdFornecedor =
      data.id_fornecedor ??
      atual.id_fornecedor

    if (
      data.id_empresa !==
        undefined ||
      data.id_fornecedor !==
        undefined
    ) {
      const existente =
        await findByEmpresaFornecedor(
          novoIdEmpresa,
          novoIdFornecedor
        )

      if (
        existente &&
        existente.id !== id
      ) {
        throw new ConflictError()
      }
    }

    const updateData:
      UpdateEmpresaFornecedorData =
      {}

    if (
      data.id_empresa !==
      undefined
    ) {
      updateData.id_empresa =
        data.id_empresa
    }

    if (
      data.id_fornecedor !==
      undefined
    ) {
      updateData.id_fornecedor =
        data.id_fornecedor
    }

    if (
      data.prazo_pagamento !==
      undefined
    ) {
      updateData.prazo_pagamento =
        data.prazo_pagamento
    }

    if (
      data.prazo_entrega !==
      undefined
    ) {
      updateData.prazo_entrega =
        data.prazo_entrega
    }

    if (
      data.observacao !==
      undefined
    ) {
      updateData.observacao =
        data.observacao
    }

    if (
      data.status !==
      undefined
    ) {
      updateData.status =
        data.status
    }

    try {
      const empresaFornecedor =
        await updateEmpresaFornecedorRepository(
          id,
          updateData
        )

      if (!empresaFornecedor) {
        throw new NotFoundError()
      }

      return empresaFornecedor
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
    const empresaFornecedor =
      await findById(id)

    if (!empresaFornecedor) {
      throw new NotFoundError()
    }

    if (
      empresaFornecedor.status ===
      'ATIVO'
    ) {
      await softDelete(id)
    }

    return {
      message:
        EMPRESA_FORNECEDOR_MESSAGES.DELETED,
    }
  }
}