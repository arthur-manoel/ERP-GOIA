import type {
  Request,
  Response,
  NextFunction,
} from 'express'

import {
  createSetorSchema,
  setorIdParamSchema,
  updateSetorSchema,
} from './setores.schema.js'

import {
  createSetor as createSetorService,
  deleteSetor as deleteSetorService,
  getSetorById as getSetorByIdService,
  listSetores as listSetoresService,
  updateSetor as updateSetorService,
} from './setores.service.js'

export async function createSetor(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data =
      createSetorSchema.parse(
        req.body
      )

    const setor =
      await createSetorService(
        data
      )

    res.status(201).json({
      setor,
    })
  } catch (error) {
    next(error)
  }
}

export async function listSetores(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const setores =
      await listSetoresService()

    res.status(200).json({
      setores,
    })
  } catch (error) {
    next(error)
  }
}

export async function getSetorById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } =
      setorIdParamSchema.parse(
        req.params
      )

    const setor =
      await getSetorByIdService(
        id
      )

    res.status(200).json({
      setor,
    })
  } catch (error) {
    next(error)
  }
}

export async function updateSetor(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } =
      setorIdParamSchema.parse(
        req.params
      )

    const data =
      updateSetorSchema.parse(
        req.body
      )

    const setor =
      await updateSetorService(
        id,
        data
      )

    res.status(200).json({
      setor,
    })
  } catch (error) {
    next(error)
  }
}

export async function deleteSetor(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } =
      setorIdParamSchema.parse(
        req.params
      )

    await deleteSetorService(
      id
    )

    res.status(204).send()
  } catch (error) {
    next(error)
  }
}