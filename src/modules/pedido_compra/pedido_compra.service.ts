import {
  cancel,
  create as createRepository,
  findAll,
  findById,
  findByNumero,
  update as updateRepository,
  type PedidoCompra,
} from './pedido_compra.repository.js'
import type {
  CreatePedidoCompraInput,
  ListPedidoCompraInput,
  UpdatePedidoCompraInput,
} from './pedido_compra.schema.js'

export const PEDIDO_COMPRA_MESSAGES = {
  NOT_FOUND: 'Pedido de compra não encontrado',
  DUPLICATE_NUMBER: 'Já existe um pedido de compra com o número informado',
  INVALID_FOREIGN_KEY: 'Empresa, fornecedor, requisição, ordem de produção ou usuário informado não existe',
  ALREADY_CANCELLED: 'O pedido de compra já está cancelado',
  CANCELLED: 'Pedido de compra cancelado com sucesso',
} as const

export class NotFoundError extends Error {
  constructor(message = PEDIDO_COMPRA_MESSAGES.NOT_FOUND) { super(message); this.name = 'NotFoundError' }
}
export class ConflictError extends Error {
  constructor(message = PEDIDO_COMPRA_MESSAGES.DUPLICATE_NUMBER) { super(message); this.name = 'ConflictError' }
}
export class ValidationError extends Error {
  constructor(message: string) { super(message); this.name = 'ValidationError' }
}

interface DatabaseError extends Error { code?: string; errno?: number }

export class PedidoCompraService {
  public async criar(data: CreatePedidoCompraInput): Promise<PedidoCompra> {
    if (await findByNumero(data.numero)) throw new ConflictError()
    try {
      return await createRepository({
        ...data,
        id_requisicao_compra: data.id_requisicao_compra ?? null,
        id_ordem_producao: data.id_ordem_producao ?? null,
        observacao: data.observacao ?? null,
      })
    } catch (error) { this.handleDatabaseError(error) }
  }

  public async listar(filters: ListPedidoCompraInput) {
    const page = filters.page ?? 1
    const limit = filters.limit ?? 20
    const result = await findAll({
      idEmpresa: filters.id_empresa,
      idFornecedor: filters.id_fornecedor,
      status: filters.status,
      dataPedidoDe: filters.data_pedido_de,
      dataPedidoAte: filters.data_pedido_ate,
    }, { page, limit })
    return {
      rows: result.rows,
      count: result.count,
      page,
      limit,
      totalPages: result.count === 0 ? 0 : Math.ceil(result.count / limit),
    }
  }

  public async buscarPorId(id: number): Promise<PedidoCompra> {
    const pedido = await findById(id)
    if (!pedido) throw new NotFoundError()
    return pedido
  }

  public async atualizar(id: number, data: UpdatePedidoCompraInput): Promise<PedidoCompra> {
    if (!await findById(id)) throw new NotFoundError()
    try {
      const pedido = await updateRepository(id, data)
      if (!pedido) throw new NotFoundError()
      return pedido
    } catch (error) {
      if (error instanceof NotFoundError) throw error
      this.handleDatabaseError(error)
    }
  }

  public async cancelar(id: number): Promise<{ message: string }> {
    const pedido = await findById(id)
    if (!pedido) throw new NotFoundError()
    if (pedido.status === 'CANCELADO') {
      throw new ValidationError(PEDIDO_COMPRA_MESSAGES.ALREADY_CANCELLED)
    }
    if (!await cancel(id)) throw new NotFoundError()
    return { message: PEDIDO_COMPRA_MESSAGES.CANCELLED }
  }

  private handleDatabaseError(error: unknown): never {
    const databaseError = error as DatabaseError
    if (databaseError?.code === 'ER_DUP_ENTRY' || databaseError?.errno === 1062) throw new ConflictError()
    if (databaseError?.code === 'ER_NO_REFERENCED_ROW_2' || databaseError?.errno === 1452) {
      throw new ValidationError(PEDIDO_COMPRA_MESSAGES.INVALID_FOREIGN_KEY)
    }
    throw error
  }
}
