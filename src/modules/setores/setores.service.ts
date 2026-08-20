import {
  createSetor as createSetorRepository,
  deleteSetor as deleteSetorRepository,
  findAllSetores,
  findEmpresaById,
  findSetorById,
  findSetorByNome,
  updateSetor as updateSetorRepository,
} from './setores.repository.js'

import type {
  SetorRow,
} from './setores.repository.js'

import type {
  CreateSetorInput,
  UpdateSetorInput,
} from './setores.schema.js'

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
    typeof error !==
      'object' ||
    error === null
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

function throwDuplicateSetorError(): never {
  throw createHttpError(
    'Já existe um setor com este nome para esta empresa',
    409
  )
}

export async function createSetor(
  data: CreateSetorInput
): Promise<SetorRow> {
  if (
    data.id_empresa !== null
  ) {
    const empresa =
      await findEmpresaById(
        data.id_empresa
      )

    if (!empresa) {
      throw createHttpError(
        'Empresa não encontrada',
        404
      )
    }
  }

  const existingSetor =
    await findSetorByNome(
      data.nome,
      data.id_empresa
    )

  if (existingSetor) {
    throwDuplicateSetorError()
  }

  let setorId: number

  try {
    setorId =
      await createSetorRepository({
        idEmpresa:
          data.id_empresa,

        nome:
          data.nome,

        tipo:
          data.tipo,

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
      throwDuplicateSetorError()
    }

    throw error
  }

  const setor =
    await findSetorById(
      setorId
    )

  if (!setor) {
    throw new Error(
      'Não foi possível localizar o setor após a criação'
    )
  }

  return setor
}

export async function listSetores(): Promise<
  SetorRow[]
> {
  return findAllSetores()
}

export async function getSetorById(
  id: number
): Promise<SetorRow> {
  const setor =
    await findSetorById(id)

  if (!setor) {
    throw createHttpError(
      'Setor não encontrado',
      404
    )
  }

  return setor
}

export async function updateSetor(
  id: number,
  data: UpdateSetorInput
): Promise<SetorRow> {
  const existingSetor =
    await findSetorById(id)

  if (!existingSetor) {
    throw createHttpError(
      'Setor não encontrado',
      404
    )
  }

  const idEmpresa =
    data.id_empresa !==
    undefined
      ? data.id_empresa
      : existingSetor.id_empresa

  const nome =
    data.nome !== undefined
      ? data.nome
      : existingSetor.nome

  const tipo =
    data.tipo !== undefined
      ? data.tipo
      : existingSetor.tipo

  const descricao =
    data.descricao !==
    undefined
      ? data.descricao
      : existingSetor.descricao

  const status =
    data.status !== undefined
      ? data.status
      : existingSetor.status

  if (
    data.id_empresa !==
      undefined &&
    idEmpresa !== null
  ) {
    const empresa =
      await findEmpresaById(
        idEmpresa
      )

    if (!empresa) {
      throw createHttpError(
        'Empresa não encontrada',
        404
      )
    }
  }

  if (
    data.nome !== undefined ||
    data.id_empresa !== undefined
  ) {
    const setorWithSameName =
      await findSetorByNome(
        nome,
        idEmpresa
      )

    if (
      setorWithSameName &&
      setorWithSameName.id !== id
    ) {
      throwDuplicateSetorError()
    }
  }

  try {
    await updateSetorRepository({
      id,
      idEmpresa,
      nome,
      tipo,
      descricao,
      status,
    })
  } catch (error) {
    if (
      isDuplicateEntryError(
        error
      )
    ) {
      throwDuplicateSetorError()
    }

    throw error
  }

  const updatedSetor =
    await findSetorById(id)

  if (!updatedSetor) {
    throw createHttpError(
      'Setor não encontrado',
      404
    )
  }

  return updatedSetor
}

export async function deleteSetor(
  id: number
): Promise<void> {
  const existingSetor =
    await findSetorById(id)

  if (!existingSetor) {
    throw createHttpError(
      'Setor não encontrado',
      404
    )
  }

  await deleteSetorRepository(
    id
  )
}