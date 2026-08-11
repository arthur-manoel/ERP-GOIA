import type {
  Request,
  Response,
  NextFunction,
} from 'express'

import {
  createFornecedorSchema,
  fornecedorIdSchema,
  updateFornecedorSchema,
} from './fornecedor.schema.js'

import {
  createFornecedor,
  deleteFornecedor,
  getFornecedorById,
  listFornecedores,
  updateFornecedor,
} from './fornecedor.service.js'

export async function listFornecedoresController(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const fornecedores =
      await listFornecedores()

    res.json({
      fornecedores,
    })
  } catch (error) {
    next(error)
  }
}

export async function getFornecedorByIdController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id =
      fornecedorIdSchema.parse(
        req.params.id
      )

    const fornecedor =
      await getFornecedorById(id)

    res.json({
      fornecedor,
    })
  } catch (error) {
    next(error)
  }
}

export async function createFornecedorController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data =
      createFornecedorSchema.parse(
        req.body
      )

    const fornecedor =
      await createFornecedor(data)

    res
      .status(201)
      .json({
        fornecedor,
      })
  } catch (error) {
    next(error)
  }
}

export async function updateFornecedorController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id =
      fornecedorIdSchema.parse(
        req.params.id
      )

    const data =
      updateFornecedorSchema.parse(
        req.body
      )

    const fornecedor =
      await updateFornecedor(
        id,
        data
      )

    res.json({
      fornecedor,
    })
  } catch (error) {
    next(error)
  }
}

export async function deleteFornecedorController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id =
      fornecedorIdSchema.parse(
        req.params.id
      )

    await deleteFornecedor(id)

    res.json({
      message:
        'Fornecedor desativado com sucesso',
    })
  } catch (error) {
    next(error)
  }
}
