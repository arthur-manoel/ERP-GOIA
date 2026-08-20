import type {
  Request,
  Response,
  NextFunction,
} from 'express'

import {
  cargoIdParamSchema,
  createCargoSchema,
  updateCargoSchema,
} from './cargos.schema.js'

import {
  createCargo,
  deleteCargo,
  getCargoById,
  listCargos,
  updateCargo,
} from './cargos.service.js'

export async function createCargoController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data =
      createCargoSchema.parse(
        req.body
      )

    const cargo =
      await createCargo(
        data
      )

    res.status(201).json({
      cargo,
    })
  } catch (error) {
    next(error)
  }
}

export async function listCargosController(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const cargos =
      await listCargos()

    res.status(200).json({
      cargos,
    })
  } catch (error) {
    next(error)
  }
}

export async function getCargoByIdController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } =
      cargoIdParamSchema.parse(
        req.params
      )

    const cargo =
      await getCargoById(
        id
      )

    res.status(200).json({
      cargo,
    })
  } catch (error) {
    next(error)
  }
}

export async function updateCargoController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } =
      cargoIdParamSchema.parse(
        req.params
      )

    const data =
      updateCargoSchema.parse(
        req.body
      )

    const cargo =
      await updateCargo(
        id,
        data
      )

    res.status(200).json({
      cargo,
    })
  } catch (error) {
    next(error)
  }
}

export async function deleteCargoController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } =
      cargoIdParamSchema.parse(
        req.params
      )

    await deleteCargo(id)

    res.status(204).send()
  } catch (error) {
    next(error)
  }
}