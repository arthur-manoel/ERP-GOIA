import {
  create,
  findAll,
  findById,
  findByNumero,
  update,
  cancel,
  type CreateOrdemProducaoData,
  type OrdemProducao,
  type OrdemProducaoFilters,
  type OrdemProducaoPagination,
  type UpdateOrdemProducaoData,
} from './ordem_producao.repository.js'

export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

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

export class OrdemProducaoService {
  /**
   * Lista ordens de produção.
   */
  async listar(
    filters: OrdemProducaoFilters & OrdemProducaoPagination
  ): Promise<{
    rows: OrdemProducao[]
    count: number
  }> {
    const {
      page,
      limit,
      ...filtros
    } = filters

    return findAll(
      filtros,
      {
        page,
        limit,
      }
    )
  }

  /**
   * Busca uma ordem de produção pelo ID.
   */
  async buscarPorId(
    id: number
  ): Promise<OrdemProducao> {
    const ordem = await findById(id)

    if (!ordem) {
      throw new NotFoundError(
        'Ordem de produção não encontrada'
      )
    }

    return ordem
  }

  /**
   * Cria uma ordem de produção.
   */
  async criar(
    data: CreateOrdemProducaoData
  ): Promise<OrdemProducao> {
    const existente =
      await findByNumero(data.numero)

    if (existente) {
      throw new ConflictError(
        'Já existe uma ordem de produção com este número'
      )
    }

    if (
      data.status === 'CONCLUIDA' ||
      data.status === 'CANCELADA'
    ) {
      throw new ValidationError(
        'A ordem de produção deve ser criada como ABERTA ou EM_ANDAMENTO'
      )
    }

    return create(data)
  }

  /**
   * Atualiza uma ordem de produção.
   */
  async atualizar(
    id: number,
    data: UpdateOrdemProducaoData
  ): Promise<OrdemProducao> {
    const existente = await findById(id)

    if (!existente) {
      throw new NotFoundError(
        'Ordem de produção não encontrada'
      )
    }

    if (
      existente.status === 'CANCELADA' &&
      data.status !== undefined &&
      data.status !== 'CANCELADA'
    ) {
      throw new ConflictError(
        'Uma ordem de produção cancelada não pode ser alterada para outro status'
      )
    }

    if (
      existente.status === 'CONCLUIDA' &&
      data.status !== undefined &&
      data.status !== 'CONCLUIDA'
    ) {
      throw new ConflictError(
        'Uma ordem de produção concluída não pode voltar para outro status'
      )
    }

    const atualizada = await update(
      id,
      data
    )

    if (!atualizada) {
      throw new NotFoundError(
        'Ordem de produção não encontrada'
      )
    }

    return atualizada
  }

  /**
   * Cancela uma ordem de produção.
   */
  async cancelar(
    id: number
  ): Promise<OrdemProducao> {
    const existente = await findById(id)

    if (!existente) {
      throw new NotFoundError(
        'Ordem de produção não encontrada'
      )
    }

    if (existente.status === 'CANCELADA') {
      throw new ConflictError(
        'A ordem de produção já está cancelada'
      )
    }

    if (existente.status === 'CONCLUIDA') {
      throw new ConflictError(
        'Uma ordem de produção concluída não pode ser cancelada'
      )
    }

    const resultado = await cancel(id)

    if (!resultado) {
      throw new NotFoundError(
        'Ordem de produção não encontrada'
      )
    }

    const ordem = await findById(id)

    if (!ordem) {
      throw new NotFoundError(
        'Ordem de produção não encontrada'
      )
    }

    return ordem
  }
}