import {
  createCargo as createCargoRepository,
  deleteCargo as deleteCargoRepository,
  findAllCargos,
  findCargoById,
  findCargoByNome,
  findEmpresaById,
  updateCargo as updateCargoRepository,
} from './cargos.repository.js'

import type {
  CargoRow,
} from './cargos.repository.js'

import type {
  CreateCargoInput,
  UpdateCargoInput,
} from './cargos.schema.js'

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

function throwDuplicateCargoError(): never {
  throw createHttpError(
    'Já existe um cargo com este nome para esta empresa',
    409
  )
}

export async function createCargo(
  data: CreateCargoInput
): Promise<CargoRow> {
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

  const existingCargo =
    await findCargoByNome(
      data.nome,
      data.id_empresa
    )

  if (existingCargo) {
    throwDuplicateCargoError()
  }

  const descricao =
    data.descricao !==
    undefined
      ? data.descricao
      : null

  let cargoId: number

  try {
    cargoId =
      await createCargoRepository(
        data.id_empresa,
        data.nome,
        descricao,
        data.status
      )
  } catch (error) {
    if (
      isDuplicateEntryError(
        error
      )
    ) {
      throwDuplicateCargoError()
    }

    throw error
  }

  const cargo =
    await findCargoById(
      cargoId
    )

  if (!cargo) {
    throw new Error(
      'Não foi possível localizar o cargo após a criação'
    )
  }

  return cargo
}

export async function listCargos(): Promise<
  CargoRow[]
> {
  return findAllCargos()
}

export async function getCargoById(
  id: number
): Promise<CargoRow> {
  const cargo =
    await findCargoById(id)

  if (!cargo) {
    throw createHttpError(
      'Cargo não encontrado',
      404
    )
  }

  return cargo
}

export async function updateCargo(
  id: number,
  data: UpdateCargoInput
): Promise<CargoRow> {
  const existingCargo =
    await findCargoById(id)

  if (!existingCargo) {
    throw createHttpError(
      'Cargo não encontrado',
      404
    )
  }

  const idEmpresa =
    data.id_empresa !==
    undefined
      ? data.id_empresa
      : existingCargo.id_empresa

  const nome =
    data.nome !== undefined
      ? data.nome
      : existingCargo.nome

  const descricao =
    data.descricao !==
    undefined
      ? data.descricao
      : existingCargo.descricao

  const status =
    data.status !== undefined
      ? data.status
      : existingCargo.status

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
    const cargoWithSameName =
      await findCargoByNome(
        nome,
        idEmpresa
      )

    if (
      cargoWithSameName &&
      cargoWithSameName.id !== id
    ) {
      throwDuplicateCargoError()
    }
  }

  try {
    await updateCargoRepository(
      id,
      idEmpresa,
      nome,
      descricao,
      status
    )
  } catch (error) {
    if (
      isDuplicateEntryError(
        error
      )
    ) {
      throwDuplicateCargoError()
    }

    throw error
  }

  const updatedCargo =
    await findCargoById(id)

  if (!updatedCargo) {
    throw createHttpError(
      'Cargo não encontrado',
      404
    )
  }

  return updatedCargo
}

export async function deleteCargo(
  id: number
): Promise<void> {
  const existingCargo =
    await findCargoById(id)

  if (!existingCargo) {
    throw createHttpError(
      'Cargo não encontrado',
      404
    )
  }

  await deleteCargoRepository(
    id
  )
}