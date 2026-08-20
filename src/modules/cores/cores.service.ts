import {
  createCor as createCorRepository,
  findAllCores,
  findCorById,
  findCorByNome,
  softDeleteCor as softDeleteCorRepository,
  updateCor as updateCorRepository,
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
  constructor(
    message: string
  ) {
    super(message)

    this.name =
      'ValidationError'
  }
}

export class CorService {
  public async create(
    body: unknown
  ): Promise<CorRow> {
    const parsed =
      createCorSchema.safeParse(
        body
      )

    if (!parsed.success) {
      throw new ValidationError(
        parsed.error.issues
          .map(
            (issue) =>
              issue.message
          )
          .join(', ')
      )
    }

    const data = {
      ...parsed.data,

      nome:
        parsed.data.nome.trim(),

      codigo_hex:
        parsed.data.codigo_hex.toUpperCase(),
    }

    const existing =
      await findCorByNome(
        data.nome,
        data.id_empresa
      )

    if (existing) {
      throw new ConflictError(
        'Já existe uma cor com este nome para esta empresa'
      )
    }

    return createCorRepository(
      data
    )
  }

  public async findAll(
    query: unknown
  ) {
    const parsed =
      listCoresSchema.safeParse(
        query
      )

    if (!parsed.success) {
      throw new ValidationError(
        parsed.error.issues
          .map(
            (issue) =>
              issue.message
          )
          .join(', ')
      )
    }

    const {
      page,
      limit,
      q,
      id_empresa,
      include_inativos,
    } = parsed.data

    const result =
      await findAllCores(
        {
          q,
          id_empresa,

          includeInativos:
            include_inativos,
        },
        {
          page,
          limit,
        }
      )

    return {
      rows:
        result.rows,

      pagination: {
        page,
        limit,

        total:
          result.count,

        total_pages:
          Math.ceil(
            result.count /
              limit
          ),
      },
    }
  }

  public async findById(
    params: unknown
  ): Promise<CorRow> {
    const parsed =
      corIdSchema.safeParse(
        params
      )

    if (!parsed.success) {
      throw new ValidationError(
        'ID inválido'
      )
    }

    const cor =
      await findCorById(
        parsed.data.id
      )

    if (!cor) {
      throw new NotFoundError(
        'Cor não encontrada'
      )
    }

    return cor
  }

  public async update(
    params: unknown,
    body: unknown
  ): Promise<CorRow> {
    const parsedId =
      corIdSchema.safeParse(
        params
      )

    if (
      !parsedId.success
    ) {
      throw new ValidationError(
        'ID inválido'
      )
    }

    const parsedBody =
      updateCorSchema.safeParse(
        body
      )

    if (
      !parsedBody.success
    ) {
      throw new ValidationError(
        parsedBody.error.issues
          .map(
            (issue) =>
              issue.message
          )
          .join(', ')
      )
    }

    const id =
      parsedId.data.id

    const current =
      await findCorById(
        id
      )

    if (!current) {
      throw new NotFoundError(
        'Cor não encontrada'
      )
    }

    const data = {
      ...parsedBody.data,
    }

    if (
      data.codigo_hex
    ) {
      data.codigo_hex =
        data.codigo_hex.toUpperCase()
    }

    if (data.nome) {
      data.nome =
        data.nome.trim()

      const idEmpresa =
        data.id_empresa ??
        current.id_empresa

      const existing =
        await findCorByNome(
          data.nome,
          idEmpresa
        )

      if (
        existing &&
        existing.id !== id
      ) {
        throw new ConflictError(
          'Já existe uma cor com este nome para esta empresa'
        )
      }
    }

    const updated =
      await updateCorRepository(
        id,
        data
      )

    if (!updated) {
      throw new NotFoundError(
        'Cor não encontrada'
      )
    }

    return updated
  }

  public async delete(
    params: unknown
  ): Promise<void> {
    const parsed =
      corIdSchema.safeParse(
        params
      )

    if (!parsed.success) {
      throw new ValidationError(
        'ID inválido'
      )
    }

    const cor =
      await findCorById(
        parsed.data.id
      )

    if (!cor) {
      throw new NotFoundError(
        'Cor não encontrada'
      )
    }

    await softDeleteCorRepository(
      parsed.data.id
    )
  }
}