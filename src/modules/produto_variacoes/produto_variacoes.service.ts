import {
  create as createRepository, deleteProdutoVariacao, findAll, findByCombination,
  findById, update as updateRepository, type ProdutoVariacao,
} from './produto_variacoes.repository.js'
import type {
  CreateProdutoVariacaoInput, ListProdutoVariacoesInput, UpdateProdutoVariacaoInput,
} from './produto_variacoes.schema.js'

export const PRODUTO_VARIACOES_MESSAGES = {
  NOT_FOUND: 'Variação de produto não encontrada',
  DUPLICATE_RECORD: 'Já existe uma variação para a combinação de produto, cor e tamanho informada',
  INVALID_FOREIGN_KEY: 'Empresa, produto, cor ou tamanho informado não existe',
  ALREADY_INACTIVE: 'A variação de produto já está inativa',
  DEACTIVATED: 'Variação de produto inativada com sucesso',
} as const

export class NotFoundError extends Error {
  constructor(message = PRODUTO_VARIACOES_MESSAGES.NOT_FOUND) { super(message); this.name = 'NotFoundError' }
}
export class ConflictError extends Error {
  constructor(message = PRODUTO_VARIACOES_MESSAGES.DUPLICATE_RECORD) { super(message); this.name = 'ConflictError' }
}
export class ValidationError extends Error {
  constructor(message: string) { super(message); this.name = 'ValidationError' }
}
interface DatabaseError extends Error { code?: string; errno?: number }

export class ProdutoVariacoesService {
  public async criar(data: CreateProdutoVariacaoInput): Promise<ProdutoVariacao> {
    const idCor = data.id_cor ?? null
    const idTamanho = data.id_tamanho ?? null
    if (await findByCombination(data.id_produto, idCor, idTamanho)) throw new ConflictError()
    try {
      return await createRepository({ ...data, id_cor: idCor, id_tamanho: idTamanho })
    } catch (error) { this.handleDatabaseError(error) }
  }

  public async listar(filters: ListProdutoVariacoesInput) {
    const page = filters.page ?? 1
    const limit = filters.limit ?? 20
    const result = await findAll({
      idEmpresa: filters.id_empresa, idProduto: filters.id_produto,
      idCor: filters.id_cor, idTamanho: filters.id_tamanho, status: filters.status,
    }, { page, limit })
    return { rows: result.rows, count: result.count, page, limit,
      totalPages: result.count === 0 ? 0 : Math.ceil(result.count / limit) }
  }

  public async buscarPorId(id: number): Promise<ProdutoVariacao> {
    const variacao = await findById(id)
    if (!variacao) throw new NotFoundError()
    return variacao
  }

  public async atualizar(id: number, data: UpdateProdutoVariacaoInput): Promise<ProdutoVariacao> {
    const atual = await findById(id)
    if (!atual) throw new NotFoundError()
    const idProduto = data.id_produto ?? atual.id_produto
    const idCor = data.id_cor !== undefined ? data.id_cor : atual.id_cor
    const idTamanho = data.id_tamanho !== undefined ? data.id_tamanho : atual.id_tamanho
    if (await findByCombination(idProduto, idCor, idTamanho, id)) throw new ConflictError()
    try {
      const variacao = await updateRepository(id, data)
      if (!variacao) throw new NotFoundError()
      return variacao
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ConflictError) throw error
      this.handleDatabaseError(error)
    }
  }

  public async inativar(id: number): Promise<{ message: string }> {
    const variacao = await findById(id)
    if (!variacao) throw new NotFoundError()
    if (variacao.status === 'INATIVO') {
      throw new ValidationError(PRODUTO_VARIACOES_MESSAGES.ALREADY_INACTIVE)
    }
    if (!await deleteProdutoVariacao(id)) throw new NotFoundError()
    return { message: PRODUTO_VARIACOES_MESSAGES.DEACTIVATED }
  }

  private handleDatabaseError(error: unknown): never {
    const databaseError = error as DatabaseError
    if (databaseError?.code === 'ER_DUP_ENTRY' || databaseError?.errno === 1062) throw new ConflictError()
    if (databaseError?.code === 'ER_NO_REFERENCED_ROW_2' || databaseError?.errno === 1452) {
      throw new ValidationError(PRODUTO_VARIACOES_MESSAGES.INVALID_FOREIGN_KEY)
    }
    throw error
  }
}
