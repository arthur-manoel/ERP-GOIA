import type {
  Request,
  Response,
  NextFunction,
} from 'express'

import {
  createEmpresaSchema,
  empresaIdSchema,
  updateEmpresaSchema,
} from './empresa.schema.js'

import {
  createEmpresa,
  deleteEmpresa,
  getEmpresaById,
  listEmpresas,
  updateEmpresa,
} from './empresa.service.js'

export async function listEmpresasController(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const empresas =
      await listEmpresas()

    res.json({
      empresas,
    })
  } catch (error: unknown) {
    next(error)
  }
}

export async function getEmpresaByIdController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id =
      empresaIdSchema.parse(
        req.params.id
      )

    const empresa =
      await getEmpresaById(id)

    res.json({
      empresa,
    })
  } catch (error: unknown) {
    next(error)
  }
}

export async function createEmpresaController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data =
      createEmpresaSchema.parse(
        req.body
      )

    const empresa =
      await createEmpresa(data)

    res
      .status(201)
      .json({
        empresa,
      })
  } catch (error: unknown) {
    next(error)
  }
}

export async function updateEmpresaController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id =
      empresaIdSchema.parse(
        req.params.id
      )

    const data =
      updateEmpresaSchema.parse(
        req.body
      )

    const empresa =
      await updateEmpresa(
        id,
        data
      )

    res.json({
      empresa,
    })
  } catch (error: unknown) {
    next(error)
  }
}

export async function deleteEmpresaController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id =
      empresaIdSchema.parse(
        req.params.id
      )

    await deleteEmpresa(id)

    res.json({
      message:
        'Empresa desativada com sucesso',
    })
  } catch (error: unknown) {
    next(error)
  }
}