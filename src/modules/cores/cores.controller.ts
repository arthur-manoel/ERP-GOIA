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

export class CorController {
  public async findAll(
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
      this.handleError(
        error,
        res
      )
    }
  }

  public async findById(
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
      this.handleError(
        error,
        res
      )
    }
  }

  public async create(
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
      this.handleError(
        error,
        res
      )
    }
  }

  public async update(
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
      this.handleError(
        error,
        res
      )
    }
  }

  public async softDelete(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const data =
        await corService.softDelete(
          req.params
        )

      res.status(200).json({
        success: true,
        data,
      })
    } catch (error) {
      this.handleError(
        error,
        res
      )
    }
  }

  private handleError(
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
        data: {
          details:
            error.details,
        },
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
      '[CORES] Erro inesperado:',
      error
    )

    res.status(500).json({
      success: false,
      error:
        'Erro interno do servidor',
    })
  }
}