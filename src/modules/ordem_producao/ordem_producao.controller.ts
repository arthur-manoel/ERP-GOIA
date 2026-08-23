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
  OrdemProducaoService,
  ValidationError,
} from './ordem_producao.service.js'

import {
  createOrdemProducaoSchema,
  listOrdemProducaoSchema,
  ordemProducaoIdSchema,
  updateOrdemProducaoSchema,
} from './ordem_producao.schema.js'

export class OrdemProducaoController {
  private readonly service =
    new OrdemProducaoService()

  public listar =
    async (
      req: Request,
      res: Response
    ): Promise<void> => {
      try {
        const filters =
          listOrdemProducaoSchema
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
          ordemProducaoIdSchema
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
          createOrdemProducaoSchema
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
          ordemProducaoIdSchema
            .parse(
              req.params
            )

        const data =
          updateOrdemProducaoSchema
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
          ordemProducaoIdSchema
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
      '[OrdemProducaoController] Erro inesperado:',
      error
    )

    res.status(500).json({
      success: false,

      error:
        'Erro interno do servidor',
    })
  }
} 