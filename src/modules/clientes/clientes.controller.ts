import type {
  Request,
  Response,
  NextFunction,
} from 'express'

import {
  clienteIdParamSchema,
  createClienteSchema,
  updateClienteSchema,
} from './clientes.schema.js'

import {
  createCliente as createClienteService,
  deleteCliente as deleteClienteService,
  getClienteById as getClienteByIdService,
  listClientes as listClientesService,
  updateCliente as updateClienteService,
} from './clientes.service.js'

export async function createCliente(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data =
      createClienteSchema.parse(
        req.body
      )

    const cliente =
      await createClienteService(
        data
      )

    res.status(201).json({
      cliente,
    })
  } catch (error) {
    next(error)
  }
}

export async function listClientes(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const clientes =
      await listClientesService()

    res.status(200).json({
      clientes,
    })
  } catch (error) {
    next(error)
  }
}

export async function getClienteById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } =
      clienteIdParamSchema.parse(
        req.params
      )

    const cliente =
      await getClienteByIdService(
        id
      )

    res.status(200).json({
      cliente,
    })
  } catch (error) {
    next(error)
  }
}

export async function updateCliente(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } =
      clienteIdParamSchema.parse(
        req.params
      )

    const data =
      updateClienteSchema.parse(
        req.body
      )

    const cliente =
      await updateClienteService(
        id,
        data
      )

    res.status(200).json({
      cliente,
    })
  } catch (error) {
    next(error)
  }
}

export async function deleteCliente(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } =
      clienteIdParamSchema.parse(
        req.params
      )

    await deleteClienteService(
      id
    )

    res.status(204).send()
  } catch (error) {
    next(error)
  }
}