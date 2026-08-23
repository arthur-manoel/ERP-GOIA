import {
  create as createRepository,
  deleteItemRequisicaoCompra,
  findAll,
  findById,
  update as updateRepository,
  type ItemRequisicaoCompra,
} from './item_requisicao_compra.repository.js'
import type {
  CreateItemRequisicaoCompraInput,
  ListItemRequisicaoCompraInput,
  UpdateItemRequisicaoCompraInput,
} from './item_requisicao_compra.schema.js'

export const ITEM_REQUISICAO_COMPRA_MESSAGES = {
  NOT_FOUND: 'Item da requisição de compra não encontrado',
  INVALID_QUANTITY: 'A quantidade deve ser um número inteiro maior ou igual a zero',
  INVALID_FOREIGN_KEY: 'Requisição de compra ou produto informado não existe',
  DUPLICATE_RECORD: 'Já existe um item da requisição de compra com os dados informados',
  DELETED: 'Item da requisição de compra excluído com sucesso',
} as const

export class NotFoundError extends Error {
  constructor(message = ITEM_REQUISICAO_COMPRA_MESSAGES.NOT_FOUND) {
    super(message); this.name = 'NotFoundError'
  }
}
export class ConflictError extends Error {
  constructor(message = ITEM_REQUISICAO_COMPRA_MESSAGES.DUPLICATE_RECORD) {
    super(message); this.name = 'ConflictError'
  }
}
export class ValidationError extends Error {
  constructor(message: string) { super(message); this.name = 'ValidationError' }
}

interface DatabaseError extends Error { code?: string; errno?: number }

export class ItemRequisicaoCompraService {
  public async criar(data: CreateItemRequisicaoCompraInput): Promise<ItemRequisicaoCompra> {
    this.validarQuantidade(data.quantidade)
    try {
      return await createRepository({ ...data, observacao: data.observacao ?? null })
    } catch (error) { this.handleDatabaseError(error) }
  }

  public async listar(filters: ListItemRequisicaoCompraInput) {
    const page = filters.page ?? 1
    const limit = filters.limit ?? 20
    const result = await findAll(
      { idRequisicaoCompra: filters.id_requisicao_compra, idProduto: filters.id_produto },
      { page, limit }
    )
    return {
      rows: result.rows,
      count: result.count,
      page,
      limit,
      totalPages: result.count === 0 ? 0 : Math.ceil(result.count / limit),
    }
  }

  public async buscarPorId(id: number): Promise<ItemRequisicaoCompra> {
    const item = await findById(id)
    if (!item) throw new NotFoundError()
    return item
  }

  public async atualizar(id: number, data: UpdateItemRequisicaoCompraInput): Promise<ItemRequisicaoCompra> {
    if (!await findById(id)) throw new NotFoundError()
    if (data.quantidade !== undefined) this.validarQuantidade(data.quantidade)
    try {
      const item = await updateRepository(id, data)
      if (!item) throw new NotFoundError()
      return item
    } catch (error) {
      if (error instanceof NotFoundError) throw error
      this.handleDatabaseError(error)
    }
  }

  public async excluir(id: number): Promise<{ message: string }> {
    if (!await findById(id)) throw new NotFoundError()
    if (!await deleteItemRequisicaoCompra(id)) throw new NotFoundError()
    return { message: ITEM_REQUISICAO_COMPRA_MESSAGES.DELETED }
  }

  private validarQuantidade(quantidade: number): void {
    if (!Number.isInteger(quantidade) || quantidade < 0) {
      throw new ValidationError(ITEM_REQUISICAO_COMPRA_MESSAGES.INVALID_QUANTITY)
    }
  }

  private handleDatabaseError(error: unknown): never {
    const databaseError = error as DatabaseError
    if (databaseError?.code === 'ER_DUP_ENTRY' || databaseError?.errno === 1062) {
      throw new ConflictError()
    }
    if (databaseError?.code === 'ER_NO_REFERENCED_ROW_2' || databaseError?.errno === 1452) {
      throw new ValidationError(ITEM_REQUISICAO_COMPRA_MESSAGES.INVALID_FOREIGN_KEY)
    }
    throw error
  }
}
