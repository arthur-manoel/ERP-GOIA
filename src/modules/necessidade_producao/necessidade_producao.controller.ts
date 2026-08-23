import type {
  Request,
  Response,
} from 'express'

import {
  ZodError,
} from 'zod'

import {
  ConflictError,
  NecessidadeProducaoService,
  NotFoundError,
  ValidationError,
} from './necessidade_producao.service.js'

import {
  createNecessidadeProducaoSchema,
  listNecessidadeProducaoSchema,
  necessidadeProducaoIdSchema,
  updateNecessidadeProducaoSchema,
} from './necessidade_producao.schema.js'

export class NecessidadeProducaoController {
  private readonly service =
    new NecessidadeProducaoService()

  public listar =
    async (
      req: Request,
      res: Response
    ): Promise<void> => {
      try {
        const filters =
          listNecessidadeProducaoSchema
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
          necessidadeProducaoIdSchema
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
          createNecessidadeProducaoSchema
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
          necessidadeProducaoIdSchema
            .parse(
              req.params
            )

        const data =
          updateNecessidadeProducaoSchema
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
          necessidadeProducaoIdSchema
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
      '[NecessidadeProducaoController] Erro inesperado:',
      error
    )

    res.status(500).json({
      success: false,

      error:
        'Erro interno do servidor',
    })
  }
}