import {
  cancel, create as createRepository, findAll, findById, findByNumero,
  update as updateRepository, type RequisicaoCompra,
} from './requisicao_compra.repository.js'
import type {
  CreateRequisicaoCompraInput, ListRequisicaoCompraInput, UpdateRequisicaoCompraInput,
} from './requisicao_compra.schema.js'

export const REQUISICAO_COMPRA_MESSAGES = {
  NOT_FOUND: 'Requisição de compra não encontrada',
  DUPLICATE_NUMBER: 'Já existe uma requisição de compra com o número informado',
  INVALID_FOREIGN_KEY: 'Empresa, local de estoque ou setor solicitante informado não existe',
  ALREADY_CANCELLED: 'A requisição de compra já está cancelada',
  CANCELLED: 'Requisição de compra cancelada com sucesso',
} as const

export class NotFoundError extends Error {
  constructor(message = REQUISICAO_COMPRA_MESSAGES.NOT_FOUND) { super(message); this.name = 'NotFoundError' }
}
export class ConflictError extends Error {
  constructor(message = REQUISICAO_COMPRA_MESSAGES.DUPLICATE_NUMBER) { super(message); this.name = 'ConflictError' }
}
export class ValidationError extends Error {
  constructor(message: string) { super(message); this.name = 'ValidationError' }
}
interface DatabaseError extends Error { code?: string; errno?: number }

export class RequisicaoCompraService {
  public async criar(data: CreateRequisicaoCompraInput): Promise<RequisicaoCompra> {
    if (await findByNumero(data.numero)) throw new ConflictError()
    try {
      return await createRepository({ ...data, observacao: data.observacao ?? null })
    } catch (error) { this.handleDatabaseError(error) }
  }

  public async listar(filters: ListRequisicaoCompraInput) {
    const page = filters.page ?? 1
    const limit = filters.limit ?? 20
    const result = await findAll({
      idEmpresa: filters.id_empresa,
      idSetorSolicitante: filters.id_setor_solicitante,
      status: filters.status,
      dataSolicitacaoDe: filters.data_solicitacao_de,
      dataSolicitacaoAte: filters.data_solicitacao_ate,
    }, { page, limit })
    return {
      rows: result.rows, count: result.count, page, limit,
      totalPages: result.count === 0 ? 0 : Math.ceil(result.count / limit),
    }
  }

  public async buscarPorId(id: number): Promise<RequisicaoCompra> {
    const requisicao = await findById(id)
    if (!requisicao) throw new NotFoundError()
    return requisicao
  }

  public async atualizar(id: number, data: UpdateRequisicaoCompraInput): Promise<RequisicaoCompra> {
    if (!await findById(id)) throw new NotFoundError()
    try {
      const requisicao = await updateRepository(id, data)
      if (!requisicao) throw new NotFoundError()
      return requisicao
    } catch (error) {
      if (error instanceof NotFoundError) throw error
      this.handleDatabaseError(error)
    }
  }

  public async cancelar(id: number): Promise<{ message: string }> {
    const requisicao = await findById(id)
    if (!requisicao) throw new NotFoundError()
    if (requisicao.status === 'CANCELADA') {
      throw new ValidationError(REQUISICAO_COMPRA_MESSAGES.ALREADY_CANCELLED)
    }
    if (!await cancel(id)) throw new NotFoundError()
    return { message: REQUISICAO_COMPRA_MESSAGES.CANCELLED }
  }

  private handleDatabaseError(error: unknown): never {
    const databaseError = error as DatabaseError
    if (databaseError?.code === 'ER_DUP_ENTRY' || databaseError?.errno === 1062) throw new ConflictError()
    if (databaseError?.code === 'ER_NO_REFERENCED_ROW_2' || databaseError?.errno === 1452) {
      throw new ValidationError(REQUISICAO_COMPRA_MESSAGES.INVALID_FOREIGN_KEY)
    }
    throw error
  }
}
