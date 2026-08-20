import {
  createCategoria as createCategoriaRepository,
  findAllCategorias,
  findCategoriaById,
  findCategoriaByNome,
  softDeleteCategoria,
  updateCategoria as updateCategoriaRepository,
  type CategoriaRow,
  type UpdateCategoriaData,
} from './categoria.repository.js'

import type {
  CreateCategoriaInput,
  ListCategoriaInput,
  UpdateCategoriaInput,
} from './categoria.schema.js'

export const CATEGORIA_MESSAGES = {
  NOT_FOUND:
    'Categoria não encontrada',

  NAME_ALREADY_EXISTS:
    'Já existe uma categoria com este nome nesta empresa',

  CREATED:
    'Categoria criada com sucesso',

  UPDATED:
    'Categoria atualizada com sucesso',

  DELETED:
    'Categoria desativada com sucesso',
} as const

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends Error {
  constructor(message: string) {
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

export class CategoriaService {
  async create(
    data: CreateCategoriaInput
  ): Promise<CategoriaRow> {
    const existing =
      await findCategoriaByNome(
        data.nome,
        data.id_empresa
      )

    if (existing) {
      throw new ConflictError(
        CATEGORIA_MESSAGES.NAME_ALREADY_EXISTS
      )
    }

    return createCategoriaRepository({
      id_empresa: data.id_empresa,
      nome: data.nome,
      descricao:
        data.descricao ?? null,
      status:
        data.status ?? 'ATIVO',
    })
  }

  async findAll(
    filters: ListCategoriaInput
  ) {
    const page =
      filters.page ?? 1

    const limit =
      filters.limit ?? 20

    const result =
      await findAllCategorias(
        {
          id_empresa:
            filters.id_empresa,

          q:
            filters.q,

          include_inativos:
            filters.include_inativos,
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
      totalPages: Math.ceil(
        result.count / limit
      ),
    }
  }

  async findById(
    id: number
  ): Promise<CategoriaRow> {
    const categoria =
      await findCategoriaById(id)

    if (!categoria) {
      throw new NotFoundError(
        CATEGORIA_MESSAGES.NOT_FOUND
      )
    }

    return categoria
  }

  async update(
    id: number,
    data: UpdateCategoriaInput
  ): Promise<CategoriaRow> {
    const categoriaAtual =
      await findCategoriaById(id)

    if (!categoriaAtual) {
      throw new NotFoundError(
        CATEGORIA_MESSAGES.NOT_FOUND
      )
    }

    const idEmpresa =
      data.id_empresa ??
      categoriaAtual.id_empresa

    const nome =
      data.nome ??
      categoriaAtual.nome

    if (
      data.nome !== undefined ||
      data.id_empresa !== undefined
    ) {
      const existing =
        await findCategoriaByNome(
          nome,
          idEmpresa
        )

      if (
        existing &&
        existing.id !== id
      ) {
        throw new ConflictError(
          CATEGORIA_MESSAGES.NAME_ALREADY_EXISTS
        )
      }
    }

    const updateData: UpdateCategoriaData =
      {}

    if (data.id_empresa !== undefined) {
      updateData.id_empresa =
        data.id_empresa
    }

    if (data.nome !== undefined) {
      updateData.nome =
        data.nome
    }

    if (data.descricao !== undefined) {
      updateData.descricao =
        data.descricao
    }

    if (data.status !== undefined) {
      updateData.status =
        data.status
    }

    const updated =
      await updateCategoriaRepository(
        id,
        updateData
      )

    if (!updated) {
      throw new NotFoundError(
        CATEGORIA_MESSAGES.NOT_FOUND
      )
    }

    return updated
  }

  async delete(
    id: number
  ): Promise<void> {
    const categoria =
      await findCategoriaById(id)

    if (!categoria) {
      throw new NotFoundError(
        CATEGORIA_MESSAGES.NOT_FOUND
      )
    }

    await softDeleteCategoria(id)
  }
}