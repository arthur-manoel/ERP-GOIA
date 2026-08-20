import {
  createModelo as createModeloRepository,
  deleteModelo as deleteModeloRepository,
  findAllModelos,
  findEmpresaById,
  findModeloById,
  findModeloByNome,
  updateModelo as updateModeloRepository,
} from './modelos.repository.js'

import type {
  ModeloRow,
} from './modelos.repository.js'

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
    new Error(
      message
    ) as Error & {
      statusCode: number
    }

  error.statusCode =
    statusCode

  return error
}

function isDuplicateEntryError(
  error: unknown
): boolean {
  if (
    !(error instanceof Error)
  ) {
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
  if (
    !(error instanceof Error)
  ) {
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

async function validateEmpresa(
  idEmpresa: number | null
): Promise<void> {
  if (
    idEmpresa === null
  ) {
    return
  }

  const empresaExiste =
    await findEmpresaById(
      idEmpresa
    )

  if (
    !empresaExiste
  ) {
    throw createHttpError(
      'Empresa não encontrada',
      404
    )
  }
}

async function validateModeloDuplicado(
  nome: string,
  idEmpresa: number | null,
  modeloId?: number
): Promise<void> {
  const modeloExistente =
    await findModeloByNome(
      nome,
      idEmpresa
    )

  if (
    modeloExistente &&
    modeloExistente.id !==
      modeloId
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
  await validateEmpresa(
    data.id_empresa
  )

  await validateModeloDuplicado(
    data.nome,
    data.id_empresa
  )

  let modeloId: number

  try {
    modeloId =
      await createModeloRepository({
        id_empresa:
          data.id_empresa,

        nome:
          data.nome,

        descricao:
          data.descricao,

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
    await findModeloById(
      modeloId
    )

  if (
    !modelo
  ) {
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
    await findModeloById(
      id
    )

  if (
    !modelo
  ) {
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
  const modeloExistente =
    await findModeloById(
      id
    )

  if (
    !modeloExistente
  ) {
    throw createHttpError(
      'Modelo não encontrado',
      404
    )
  }

  const idEmpresa =
    data.id_empresa !==
    undefined
      ? data.id_empresa
      : modeloExistente.id_empresa

  const nome =
    data.nome !==
    undefined
      ? data.nome
      : modeloExistente.nome

  const descricao =
    data.descricao !==
    undefined
      ? data.descricao
      : modeloExistente.descricao

  const status =
    data.status !==
    undefined
      ? data.status
      : modeloExistente.status

  await validateEmpresa(
    idEmpresa
  )

  await validateModeloDuplicado(
    nome,
    idEmpresa,
    id
  )

  try {
    await updateModeloRepository(
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

  const modeloAtualizado =
    await findModeloById(
      id
    )

  if (
    !modeloAtualizado
  ) {
    throw createHttpError(
      'Erro ao atualizar modelo',
      500
    )
  }

  return modeloAtualizado
}

export async function deleteModelo(
  id: number
): Promise<void> {
  const modelo =
    await findModeloById(
      id
    )

  if (
    !modelo
  ) {
    throw createHttpError(
      'Modelo não encontrado',
      404
    )
  }

  await deleteModeloRepository(
    id
  )
}