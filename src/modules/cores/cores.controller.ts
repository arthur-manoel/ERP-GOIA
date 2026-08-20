import type {
  Request,
  Response,
} from 'express'

import {
  ConflictError,
  CorService,
  NotFoundError,
  ValidationError,
} from './cores.service.js'

const corService =
  new CorService()

function handleError(
  error: unknown,
  res: Response
): void {
  if (
    error instanceof
    ValidationError
  ) {
    res.status(400).json({
      success: false,
      error:
        error.message,
    })

    return
  }

  if (
    error instanceof
    NotFoundError
  ) {
    res.status(404).json({
      success: false,
      error:
        error.message,
    })

    return
  }

  if (
    error instanceof
    ConflictError
  ) {
    res.status(409).json({
      success: false,
      error:
        error.message,
    })

    return
  }

  console.error(
    '[CORES]',
    error
  )

  res.status(500).json({
    success: false,
    error:
      'Erro interno do servidor',
  })
}

export async function createCor(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const data =
      await corService.create(
        req.body
      )

    res.status(201).json({
      success: true,
      data,
    })
  } catch (error) {
    handleError(
      error,
      res
    )
  }
}

export async function listCores(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const data =
      await corService.findAll(
        req.query
      )

    res.status(200).json({
      success: true,
      data,
    })
  } catch (error) {
    handleError(
      error,
      res
    )
  }
}

export async function getCorById(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const data =
      await corService.findById(
        req.params
      )

    res.status(200).json({
      success: true,
      data,
    })
  } catch (error) {
    handleError(
      error,
      res
    )
  }
}

export async function updateCor(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const data =
      await corService.update(
        req.params,
        req.body
      )

    res.status(200).json({
      success: true,
      data,
    })
  } catch (error) {
    handleError(
      error,
      res
    )
  }
}

export async function deleteCor(
  req: Request,
  res: Response
): Promise<void> {
  try {
    await corService.delete(
      req.params
    )

    res.status(200).json({
      success: true,

      data: {
        message:
          'Cor desativada com sucesso',
      },
    })
  } catch (error) {
    handleError(
      error,
      res
    )
  }
}