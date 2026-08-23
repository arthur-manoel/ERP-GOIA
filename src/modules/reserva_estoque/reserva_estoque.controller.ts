import type {
  Request,
  Response,
} from 'express'

import {
  ZodError,
} from 'zod'

import {
  ConflictError,
  NotFoundError,
  ReservaEstoqueService,
  ValidationError,
} from './reserva_estoque.service.js'

import {
  createReservaEstoqueSchema,
  listReservaEstoqueSchema,
  reservaEstoqueIdSchema,
  updateReservaEstoqueSchema,
} from './reserva_estoque.schema.js'

export class ReservaEstoqueController {
  private readonly service =
    new ReservaEstoqueService()

  public listar =
    async (
      req: Request,
      res: Response
    ): Promise<void> => {
      try {
        const filters =
          listReservaEstoqueSchema
            .parse(
              req.query
            )

        const result =
          await this.service.listar(
            filters
          )

        res.status(200).json({
          success: true,

          data:
            result,
        })
      } catch (error) {
        this.handleError(
          res,
          error
        )
      }
    }

  public buscarPorId =
    async (
      req: Request,
      res: Response
    ): Promise<void> => {
      try {
        const {
          id,
        } =
          reservaEstoqueIdSchema
            .parse(
              req.params
            )

        const result =
          await this.service
            .buscarPorId(
              id
            )

        res.status(200).json({
          success: true,

          data:
            result,
        })
      } catch (error) {
        this.handleError(
          res,
          error
        )
      }
    }

  public criar =
    async (
      req: Request,
      res: Response
    ): Promise<void> => {
      try {
        const data =
          createReservaEstoqueSchema
            .parse(
              req.body
            )

        const result =
          await this.service.criar(
            data
          )

        res.status(201).json({
          success: true,

          data:
            result,
        })
      } catch (error) {
        this.handleError(
          res,
          error
        )
      }
    }

  public atualizar =
    async (
      req: Request,
      res: Response
    ): Promise<void> => {
      try {
        const {
          id,
        } =
          reservaEstoqueIdSchema
            .parse(
              req.params
            )

        const data =
          updateReservaEstoqueSchema
            .parse(
              req.body
            )

        const result =
          await this.service
            .atualizar(
              id,
              data
            )

        res.status(200).json({
          success: true,

          data:
            result,
        })
      } catch (error) {
        this.handleError(
          res,
          error
        )
      }
    }

  public cancelar =
    async (
      req: Request,
      res: Response
    ): Promise<void> => {
      try {
        const {
          id,
        } =
          reservaEstoqueIdSchema
            .parse(
              req.params
            )

        const result =
          await this.service
            .cancelar(
              id
            )

        res.status(200).json({
          success: true,

          data:
            result,
        })
      } catch (error) {
        this.handleError(
          res,
          error
        )
      }
    }

  private handleError(
    res: Response,
    error: unknown
  ): void {
    if (
      error instanceof
      ZodError
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
                  ) ||
                  'root',

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
      '[ReservaEstoqueController] Erro inesperado:',
      error
    )

    res.status(500).json({
      success: false,

      error:
        'Erro interno do servidor',
    })
  }
}