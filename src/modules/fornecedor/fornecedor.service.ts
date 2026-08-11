import {
  createFornecedor as createFornecedorRepository,
  deactivateFornecedor,
  findAllActiveFornecedores,
  findFornecedorById,
  updateFornecedor as updateFornecedorRepository,
  type FornecedorRow,
} from './fornecedor.repository.js'

import type {
  CreateFornecedorInput,
  UpdateFornecedorInput,
} from './fornecedor.schema.js'

export interface Fornecedor {
  id: number
  razao_social: string
  nome_fantasia: string | null
  cnpj: string | null
  telefone: string | null
  email: string | null
  endereco: string | null
  cidade: string | null
  estado: string | null
  cep: string | null
  ativo: boolean
  data_cadastro: Date
}

function createHttpError(
  message: string,
  statusCode: number
): Error & {
  statusCode: number
} {
  const error =
    new Error(message) as Error & {
      statusCode: number
    }

  error.statusCode = statusCode

  return error
}

function mapFornecedor(
  row: FornecedorRow
): Fornecedor {
  return {
    id: row.id,
    razao_social: row.razao_social,
    nome_fantasia: row.nome_fantasia,
    cnpj: row.cnpj,
    telefone: row.telefone,
    email: row.email,
    endereco: row.endereco,
    cidade: row.cidade,
    estado: row.estado,
    cep: row.cep,
    ativo: Boolean(row.ativo),
    data_cadastro: row.data_cadastro,
  }
}

export async function listFornecedores(): Promise<Fornecedor[]> {
  const rows =
    await findAllActiveFornecedores()

  return rows.map(mapFornecedor)
}

export async function getFornecedorById(
  id: number
): Promise<Fornecedor> {
  const fornecedor =
    await findFornecedorById(id)

  if (!fornecedor) {
    throw createHttpError(
      'Fornecedor não encontrado',
      404
    )
  }

  return mapFornecedor(fornecedor)
}

export async function createFornecedor(
  data: CreateFornecedorInput
): Promise<Fornecedor> {
  const id =
    await createFornecedorRepository({
      ...data,
      ativo: data.ativo ?? true,
    })

  const fornecedor =
    await findFornecedorById(id)

  if (!fornecedor) {
    throw createHttpError(
      'Fornecedor cadastrado, mas não foi possível carregá-lo',
      500
    )
  }

  return mapFornecedor(fornecedor)
}

export async function updateFornecedor(
  id: number,
  data: UpdateFornecedorInput
): Promise<Fornecedor> {
  const existingFornecedor =
    await findFornecedorById(id)

  if (!existingFornecedor) {
    throw createHttpError(
      'Fornecedor não encontrado',
      404
    )
  }

  await updateFornecedorRepository(
    id,
    data
  )

  const updatedFornecedor =
    await findFornecedorById(id)

  if (!updatedFornecedor) {
    throw createHttpError(
      'Fornecedor não encontrado após atualização',
      404
    )
  }

  return mapFornecedor(
    updatedFornecedor
  )
}

export async function deleteFornecedor(
  id: number
): Promise<void> {
  const fornecedor =
    await findFornecedorById(id)

  if (!fornecedor) {
    throw createHttpError(
      'Fornecedor não encontrado',
      404
    )
  }

  if (!Boolean(fornecedor.ativo)) {
    throw createHttpError(
      'Fornecedor já está inativo',
      409
    )
  }

  const deactivated =
    await deactivateFornecedor(id)

  if (!deactivated) {
    throw createHttpError(
      'Não foi possível desativar o fornecedor',
      500
    )
  }
}
