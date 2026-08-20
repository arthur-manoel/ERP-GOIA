import type {
  Request,
  Response,
} from 'express'

import {
  ZodError,
} from 'zod'

import {
  ConflictError,
  NOTA_FISCAL_MESSAGES,
  NotFoundError,
  ValidationError,
  createNotaFiscal as createNotaFiscalService,
  deleteNotaFiscal as deleteNotaFiscalService,
  getNotaFiscalById as getNotaFiscalByIdService,
  listNotasFiscais as listNotasFiscaisService,
  updateNotaFiscal as updateNotaFiscalService,
} from './nota_fiscal.service.js'

import {
  createNotaFiscalSchema,
  listNotasFiscaisSchema,
  notaFiscalIdSchema,
  updateNotaFiscalSchema,
} from './nota_fiscal.schema.js'

function handleError(
  res: Response,
  error: unknown
): void {
  if (
    error instanceof ZodError
  ) {
    res.status(400).json({
      success: false,
      error:
        'Dados inválidos',
      data: {
        issues:
          error.issues.map(
            (issue) => ({
              field:
                issue.path.join(
                  '.'
                ) || 'root',

              message:
                issue.message,
            })
          ),
      },
    })

    return
  }

  if (
    error instanceof
    ValidationError
  ) {
    res.status(400).json({
      success: false,
      error:
        error.message,
      ...(error.details !==
      undefined
        ? {
            data: {
              details:
                error.details,
            },
          }
        : {}),
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
    '[nota_fiscal] Erro inesperado:',
    error
  )

  res.status(500).json({
    success: false,
    error:
      'Erro interno do servidor',
  })
}

export async function listNotasFiscais(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const filters =
      listNotasFiscaisSchema.parse(
        req.query
      )

    const result =
      await listNotasFiscaisService(
        filters
      )

    res.status(200).json({
      success: true,
      data: result,
    })
  } catch (error) {
    handleError(
      res,
      error
    )
  }
}

export async function getNotaFiscalById(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const {
      id,
    } =
      notaFiscalIdSchema.parse(
        req.params
      )

    const notaFiscal =
      await getNotaFiscalByIdService(
        id
      )

    res.status(200).json({
      success: true,
      data: notaFiscal,
    })
  } catch (error) {
    handleError(
      res,
      error
    )
  }
}

export async function createNotaFiscal(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const data =
      createNotaFiscalSchema.parse(
        req.body
      )

    const notaFiscal =
      await createNotaFiscalService(
        data
      )

    res.status(201).json({
      success: true,

      data: notaFiscal,
    })
  } catch (error) {
    handleError(
      res,
      error
    )
  }
}

export async function updateNotaFiscal(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const {
      id,
    } =
      notaFiscalIdSchema.parse(
        req.params
      )

    const data =
      updateNotaFiscalSchema.parse(
        req.body
      )

    const notaFiscal =
      await updateNotaFiscalService(
        id,
        data
      )

    res.status(200).json({
      success: true,
      data: notaFiscal,
    })
  } catch (error) {
    handleError(
      res,
      error
    )
  }
}

export async function deleteNotaFiscal(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const {
      id,
    } =
      notaFiscalIdSchema.parse(
        req.params
      )

    await deleteNotaFiscalService(
      id
    )

    res.status(200).json({
      success: true,

      data: {
        message:
          NOTA_FISCAL_MESSAGES.DELETED,
      },
    })
  } catch (error) {
    handleError(
      res,
      error
    )
  }
}