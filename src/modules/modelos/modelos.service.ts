import {
  createModelo as createModeloModel,
  deleteModelo as deleteModeloModel,
  findAllModelos,
  findEmpresaById,
  findModeloById,
  findModeloByNome,
  updateModelo as updateModeloModel,
} from './modelos.model.js'

import type {
  ModeloRow,
} from './modelos.model.js'

import type {
  CreateModeloInput,
  UpdateModeloInput,
} from './modelos.schema.js'

interface DatabaseError
  extends Error {
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

  error.statusCode =
    statusCode

  return error
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
      'ER_DUP_ENTRY' ||
    databaseError.errno ===
      1062
  )
}

function isForeignKeyError(
  error: unknown
): boolean {
  if (!(error instanceof Error)) {
    return false
  }

  const databaseError =
    error as DatabaseError

  return (
    databaseError.code ===
      'ER_NO_REFERENCED_ROW_2' ||
    databaseError.errno ===
      1452
  )
}

async function ensureEmpresaExists(
  idEmpresa: number | null
): Promise<void> {
  if (idEmpresa === null) {
    return
  }

  const empresaExists =
    await findEmpresaById(
      idEmpresa
    )

  if (!empresaExists) {
    throw createHttpError(
      'Empresa não encontrada',
      404
    )
  }
}

async function ensureNomeDisponivel(
  nome: string,
  idEmpresa: number | null,
  currentModeloId?: number
): Promise<void> {
  const existingModelo =
    await findModeloByNome(
      nome,
      idEmpresa
    )

  if (
    existingModelo &&
    existingModelo.id !==
      currentModeloId
  ) {
    throw createHttpError(
      'Já existe um modelo com este nome para esta empresa',
      409
    )
  }
}

export async function createModelo(
  data: CreateModeloInput
): Promise<ModeloRow> {
  await ensureEmpresaExists(
    data.id_empresa
  )

  await ensureNomeDisponivel(
    data.nome,
    data.id_empresa
  )

  let id: number

  try {
    id =
      await createModeloModel({
        id_empresa:
          data.id_empresa,

        nome:
          data.nome,

        descricao:
          data.descricao ??
          null,

        status:
          data.status,
      })
  } catch (error) {
    if (
      isDuplicateEntryError(
        error
      )
    ) {
      throw createHttpError(
        'Já existe um modelo com este nome para esta empresa',
        409
      )
    }

    if (
      isForeignKeyError(
        error
      )
    ) {
      throw createHttpError(
        'Empresa não encontrada',
        404
      )
    }

    throw error
  }

  const modelo =
    await findModeloById(id)

  if (!modelo) {
    throw createHttpError(
      'Erro ao criar modelo',
      500
    )
  }

  return modelo
}

export async function listModelos(): Promise<
  ModeloRow[]
> {
  return findAllModelos()
}

export async function getModeloById(
  id: number
): Promise<ModeloRow> {
  const modelo =
    await findModeloById(id)

  if (!modelo) {
    throw createHttpError(
      'Modelo não encontrado',
      404
    )
  }

  return modelo
}

export async function updateModelo(
  id: number,
  data: UpdateModeloInput
): Promise<ModeloRow> {
  const existingModelo =
    await findModeloById(id)

  if (!existingModelo) {
    throw createHttpError(
      'Modelo não encontrado',
      404
    )
  }

  const idEmpresa =
    data.id_empresa !==
    undefined
      ? data.id_empresa
      : existingModelo.id_empresa

  const nome =
    data.nome !==
    undefined
      ? data.nome
      : existingModelo.nome

  const descricao =
    data.descricao !==
    undefined
      ? data.descricao
      : existingModelo.descricao

  const status =
    data.status !==
    undefined
      ? data.status
      : existingModelo.status

  await ensureEmpresaExists(
    idEmpresa
  )

  await ensureNomeDisponivel(
    nome,
    idEmpresa,
    id
  )

  try {
    await updateModeloModel(
      id,
      {
        id_empresa:
          idEmpresa,

        nome,

        descricao,

        status,
      }
    )
  } catch (error) {
    if (
      isDuplicateEntryError(
        error
      )
    ) {
      throw createHttpError(
        'Já existe um modelo com este nome para esta empresa',
        409
      )
    }

    if (
      isForeignKeyError(
        error
      )
    ) {
      throw createHttpError(
        'Empresa não encontrada',
        404
      )
    }

    throw error
  }

  const modelo =
    await findModeloById(id)

  if (!modelo) {
    throw createHttpError(
      'Erro ao atualizar modelo',
      500
    )
  }

  return modelo
}

export async function deleteModelo(
  id: number
): Promise<void> {
  const modelo =
    await findModeloById(id)

  if (!modelo) {
    throw createHttpError(
      'Modelo não encontrado',
      404
    )
  }

  await deleteModeloModel(id)
}