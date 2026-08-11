import {
  createEmpresa as createEmpresaRepository,
  deactivateEmpresa,
  findAllActiveEmpresas,
  findEmpresaByCnpj,
  findEmpresaById,
  updateEmpresa as updateEmpresaRepository,
  type EmpresaRow,
} from './empresa.repository.js'

import type {
  CreateEmpresaInput,
  UpdateEmpresaInput,
} from './empresa.schema.js'

export interface Empresa {
  id: number
  razao_social: string
  nome_fantasia: string | null
  cnpj: string
  telefone: string | null
  email: string | null
  endereco: string | null
  cidade: string | null
  estado: string | null
  cep: string | null
  ativo: boolean
  data_cadastro: Date
}

interface DatabaseError extends Error {
  code?: string
  errno?: number
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

function mapEmpresa(
  row: EmpresaRow
): Empresa {
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

function isDuplicateEntryError(
  error: unknown
): boolean {
  if (!(error instanceof Error)) {
    return false
  }

  const databaseError =
    error as DatabaseError

  return (
    databaseError.code ===
    'ER_DUP_ENTRY'
  )
}

export async function listEmpresas():
Promise<Empresa[]> {
  const rows =
    await findAllActiveEmpresas()

  return rows.map(mapEmpresa)
}

export async function getEmpresaById(
  id: number
): Promise<Empresa> {
  const empresa =
    await findEmpresaById(id)

  if (!empresa) {
    throw createHttpError(
      'Empresa não encontrada',
      404
    )
  }

  return mapEmpresa(empresa)
}

export async function createEmpresa(
  data: CreateEmpresaInput
): Promise<Empresa> {
  const existingEmpresa =
    await findEmpresaByCnpj(
      data.cnpj
    )

  if (existingEmpresa) {
    throw createHttpError(
      'Já existe uma empresa cadastrada com este CNPJ',
      409
    )
  }

  let id: number

  try {
    id =
      await createEmpresaRepository({
        ...data,
        ativo: data.ativo ?? true,
      })
  } catch (error: unknown) {
    if (
      isDuplicateEntryError(error)
    ) {
      throw createHttpError(
        'Já existe uma empresa cadastrada com este CNPJ',
        409
      )
    }

    throw error
  }

  const empresa =
    await findEmpresaById(id)

  if (!empresa) {
    throw createHttpError(
      'Empresa cadastrada, mas não foi possível carregá-la',
      500
    )
  }

  return mapEmpresa(empresa)
}

export async function updateEmpresa(
  id: number,
  data: UpdateEmpresaInput
): Promise<Empresa> {
  const existingEmpresa =
    await findEmpresaById(id)

  if (!existingEmpresa) {
    throw createHttpError(
      'Empresa não encontrada',
      404
    )
  }

  if (data.cnpj !== undefined) {
    const empresaWithSameCnpj =
      await findEmpresaByCnpj(
        data.cnpj
      )

    if (
      empresaWithSameCnpj &&
      empresaWithSameCnpj.id !== id
    ) {
      throw createHttpError(
        'Já existe uma empresa cadastrada com este CNPJ',
        409
      )
    }
  }

  try {
    const updated =
      await updateEmpresaRepository(
        id,
        data
      )

    if (!updated) {
      throw createHttpError(
        'Não foi possível atualizar a empresa',
        500
      )
    }
  } catch (error: unknown) {
    if (
      isDuplicateEntryError(error)
    ) {
      throw createHttpError(
        'Já existe uma empresa cadastrada com este CNPJ',
        409
      )
    }

    throw error
  }

  const updatedEmpresa =
    await findEmpresaById(id)

  if (!updatedEmpresa) {
    throw createHttpError(
      'Empresa não encontrada após atualização',
      404
    )
  }

  return mapEmpresa(
    updatedEmpresa
  )
}

export async function deleteEmpresa(
  id: number
): Promise<void> {
  const empresa =
    await findEmpresaById(id)

  if (!empresa) {
    throw createHttpError(
      'Empresa não encontrada',
      404
    )
  }

  if (!Boolean(empresa.ativo)) {
    throw createHttpError(
      'Empresa já está inativa',
      409
    )
  }

  const deactivated =
    await deactivateEmpresa(id)

  if (!deactivated) {
    throw createHttpError(
      'Não foi possível desativar a empresa',
      500
    )
  }
}