import type {
  NextFunction,
  Request,
  Response,
} from 'express'

import {
  createModeloSchema,
  modeloIdParamSchema,
  updateModeloSchema,
} from './modelos.schema.js'

import {
  createModelo,
  deleteModelo,
  getModeloById,
  listModelos,
  updateModelo,
} from './modelos.service.js'

export async function createModeloController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data =
      createModeloSchema.parse(
        req.body
      )

    const modelo =
      await createModelo(data)

    res
      .status(201)
      .json({
        modelo,
      })
  } catch (error) {
    next(error)
  }
}

export async function listModelosController(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const modelos =
      await listModelos()

    res.json({
      modelos,
    })
  } catch (error) {
    next(error)
  }
}

export async function getModeloByIdController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } =
      modeloIdParamSchema.parse(
        req.params
      )

    const modelo =
      await getModeloById(id)

    res.json({
      modelo,
    })
  } catch (error) {
    next(error)
  }
}

export async function updateModeloController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } =
      modeloIdParamSchema.parse(
        req.params
      )

    const data =
      updateModeloSchema.parse(
        req.body
      )

    const modelo =
      await updateModelo(
        id,
        data
      )

    res.json({
      modelo,
    })
  } catch (error) {
    next(error)
  }
}

export async function deleteModeloController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } =
      modeloIdParamSchema.parse(
        req.params
      )

    await deleteModelo(id)

    res
      .status(204)
      .send()
  } catch (error) {
    next(error)
  }
}