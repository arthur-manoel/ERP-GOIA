import {
  ZodError,
} from 'zod'

import {
  create as createCorRepository,
  findAll as findAllCoresRepository,
  findById as findCorById,
  findByNome as findCorByNome,
  softDelete as softDeleteCorRepository,
  update as updateCorRepository,
} from './cores.repository.js'

import type {
  CorRow,
} from './cores.repository.js'

import {
  corIdSchema,
  createCorSchema,
  listCoresSchema,
  updateCorSchema,
} from './cores.schema.js'

import type {
  CreateCorInput,
  UpdateCorInput,
} from './cores.schema.js'

export class NotFoundError
  extends Error {
  constructor(
    message: string
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
  public details?: unknown

  constructor(
    message: string,
    details?: unknown
  ) {
    super(message)

    this.name =
      'ValidationError'

    this.details =
      details
  }
}

function validate<T>(
  schema: {
    parse:
      (
        value: unknown
      ) => T
  },
  data: unknown
): T {
  try {
    return schema.parse(
      data
    )
  } catch (error) {
    if (
      error instanceof
      ZodError
    ) {
      throw new ValidationError(
        'Dados inválidos',
        error.issues
      )
    }

    throw error
  }
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
    error as {
      code?: string
      errno?: number
    }

  return (
    databaseError.code ===
      'ER_DUP_ENTRY' ||
    databaseError.errno ===
      1062
  )
}

export class CorService {
  public async findAll(
    query: unknown
  ) {
    const filters =
      validate(
        listCoresSchema,
        query
      )

    const result =
      await findAllCoresRepository(
        {
          q:
            filters.q,

          includeInativos:
            filters.include_inativos,
        },
        {
          page:
            filters.page,

          limit:
            filters.limit,
        }
      )

    return {
      rows:
        result.rows,

      pagination: {
        page:
          filters.page,

        limit:
          filters.limit,

        total:
          result.count,

        total_pages:
          Math.ceil(
            result.count /
              filters.limit
          ),
      },
    }
  }

  public async findById(
    params: unknown
  ): Promise<CorRow> {
    const {
      id,
    } = validate(
      corIdSchema,
      params
    )

    const cor =
      await findCorById(
        id
      )

    if (!cor) {
      throw new NotFoundError(
        'Cor não encontrada'
      )
    }

    return cor
  }

  public async create(
    body: unknown
  ): Promise<CorRow> {
    const data =
      validate(
        createCorSchema,
        body
      )

    const normalizedData:
      CreateCorInput = {
      ...data,

      nome:
        data.nome.trim(),

      codigo_hex:
        data.codigo_hex.toUpperCase(),
    }

    const existingCor =
      await findCorByNome(
        normalizedData.nome
      )

    if (existingCor) {
      throw new ConflictError(
        'Já existe uma cor cadastrada com este nome'
      )
    }

    try {
      return await createCorRepository(
        normalizedData
      )
    } catch (error) {
      if (
        isDuplicateEntryError(
          error
        )
      ) {
        throw new ConflictError(
          'Já existe uma cor cadastrada com este nome'
        )
      }

      throw error
    }
  }

  public async update(
    params: unknown,
    body: unknown
  ): Promise<CorRow> {
    const {
      id,
    } = validate(
      corIdSchema,
      params
    )

    const data =
      validate(
        updateCorSchema,
        body
      )

    const currentCor =
      await findCorById(
        id
      )

    if (!currentCor) {
      throw new NotFoundError(
        'Cor não encontrada'
      )
    }

    const normalizedData:
      UpdateCorInput = {
      ...data,
    }

    if (
      data.nome !==
      undefined
    ) {
      normalizedData.nome =
        data.nome.trim()

      const existingCor =
        await findCorByNome(
          normalizedData.nome
        )

      if (
        existingCor &&
        existingCor.id !== id
      ) {
        throw new ConflictError(
          'Já existe uma cor cadastrada com este nome'
        )
      }
    }

    if (
      data.codigo_hex !==
      undefined
    ) {
      normalizedData.codigo_hex =
        data.codigo_hex.toUpperCase()
    }

    try {
      const updatedCor =
        await updateCorRepository(
          id,
          normalizedData
        )

      if (!updatedCor) {
        throw new NotFoundError(
          'Cor não encontrada'
        )
      }

      return updatedCor
    } catch (error) {
      if (
        isDuplicateEntryError(
          error
        )
      ) {
        throw new ConflictError(
          'Já existe uma cor cadastrada com este nome'
        )
      }

      throw error
    }
  }

  public async softDelete(
    params: unknown
  ): Promise<{
    message: string
  }> {
    const {
      id,
    } = validate(
      corIdSchema,
      params
    )

    const cor =
      await findCorById(
        id
      )

    if (!cor) {
      throw new NotFoundError(
        'Cor não encontrada'
      )
    }

    await softDeleteCorRepository(
      id
    )

    return {
      message:
        'Cor desativada com sucesso',
    }
  }
}