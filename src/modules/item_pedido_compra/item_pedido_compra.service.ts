import {
  create as createRepository,
  deleteItemPedidoCompra,
  findAll,
  findById,
  update as updateRepository,
  type ItemPedidoCompra,
} from './item_pedido_compra.repository.js'
import type {
  CreateItemPedidoCompraInput,
  ListItemPedidoCompraInput,
  UpdateItemPedidoCompraInput,
} from './item_pedido_compra.schema.js'

export const ITEM_PEDIDO_COMPRA_MESSAGES = {
  NOT_FOUND: 'Item do pedido de compra não encontrado',
  INVALID_QUANTITY: 'A quantidade deve ser um número inteiro maior ou igual a zero',
  INVALID_UNIT_VALUE: 'O valor unitário deve ser maior ou igual a zero',
  INVALID_TOTAL: 'O valor total calculado excede o limite permitido',
  INVALID_FOREIGN_KEY: 'Pedido de compra ou produto informado não existe',
  DUPLICATE_RECORD: 'Já existe um item do pedido de compra com os dados informados',
  DELETED: 'Item do pedido de compra excluído com sucesso',
} as const

export class NotFoundError extends Error {
  constructor(message = ITEM_PEDIDO_COMPRA_MESSAGES.NOT_FOUND) {
    super(message); this.name = 'NotFoundError'
  }
}
export class ConflictError extends Error {
  constructor(message = ITEM_PEDIDO_COMPRA_MESSAGES.DUPLICATE_RECORD) {
    super(message); this.name = 'ConflictError'
  }
}
export class ValidationError extends Error {
  constructor(message: string) { super(message); this.name = 'ValidationError' }
}

interface DatabaseError extends Error { code?: string; errno?: number }

export class ItemPedidoCompraService {
  public async criar(data: CreateItemPedidoCompraInput): Promise<ItemPedidoCompra> {
    this.validarValores(data.quantidade, data.valor_unitario)
    const valorTotal = this.calcularValorTotal(data.quantidade, data.valor_unitario)
    try {
      return await createRepository({ ...data, valor_total: valorTotal })
    } catch (error) { this.handleDatabaseError(error) }
  }

  public async listar(filters: ListItemPedidoCompraInput) {
    const page = filters.page ?? 1
    const limit = filters.limit ?? 20
    const result = await findAll(
      { idPedidoCompra: filters.id_pedido_compra, idProduto: filters.id_produto },
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

  public async buscarPorId(id: number): Promise<ItemPedidoCompra> {
    const item = await findById(id)
    if (!item) throw new NotFoundError()
    return item
  }

  public async atualizar(id: number, data: UpdateItemPedidoCompraInput): Promise<ItemPedidoCompra> {
    const atual = await findById(id)
    if (!atual) throw new NotFoundError()
    const quantidade = data.quantidade ?? atual.quantidade
    const valorUnitario = data.valor_unitario ?? atual.valor_unitario
    this.validarValores(quantidade, valorUnitario)

    const updateData = { ...data } as typeof data & { valor_total?: number }
    if (data.quantidade !== undefined || data.valor_unitario !== undefined) {
      updateData.valor_total = this.calcularValorTotal(quantidade, valorUnitario)
    }
    try {
      const item = await updateRepository(id, updateData)
      if (!item) throw new NotFoundError()
      return item
    } catch (error) {
      if (error instanceof NotFoundError) throw error
      this.handleDatabaseError(error)
    }
  }

  public async excluir(id: number): Promise<{ message: string }> {
    if (!await findById(id)) throw new NotFoundError()
    if (!await deleteItemPedidoCompra(id)) throw new NotFoundError()
    return { message: ITEM_PEDIDO_COMPRA_MESSAGES.DELETED }
  }

  private validarValores(quantidade: number, valorUnitario: number): void {
    if (!Number.isInteger(quantidade) || quantidade < 0) {
      throw new ValidationError(ITEM_PEDIDO_COMPRA_MESSAGES.INVALID_QUANTITY)
    }
    if (!Number.isFinite(valorUnitario) || valorUnitario < 0) {
      throw new ValidationError(ITEM_PEDIDO_COMPRA_MESSAGES.INVALID_UNIT_VALUE)
    }
  }

  private calcularValorTotal(quantidade: number, valorUnitario: number): number {
    const total = Number((quantidade * valorUnitario).toFixed(2))
    if (!Number.isFinite(total) || total > 99_999_999.99) {
      throw new ValidationError(ITEM_PEDIDO_COMPRA_MESSAGES.INVALID_TOTAL)
    }
    return total
  }

  private handleDatabaseError(error: unknown): never {
    const databaseError = error as DatabaseError
    if (databaseError?.code === 'ER_DUP_ENTRY' || databaseError?.errno === 1062) {
      throw new ConflictError()
    }
    if (databaseError?.code === 'ER_NO_REFERENCED_ROW_2' || databaseError?.errno === 1452) {
      throw new ValidationError(ITEM_PEDIDO_COMPRA_MESSAGES.INVALID_FOREIGN_KEY)
    }
    throw error
  }
}
