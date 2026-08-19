import type {
  Request,
  Response,
} from 'express'

import {
  ZodError,
} from 'zod'

import {
  CategoriaService,
  ConflictError,
  NotFoundError,
  ValidationError,
} from './categoria.service.js'

import {
  categoriaIdSchema,
  createCategoriaSchema,
  listCategoriaSchema,
  updateCategoriaSchema,
} from './categoria.schema.js'

export class CategoriaController {
  private readonly service:
    CategoriaService

  constructor(
    service =
      new CategoriaService()
  ) {
    this.service =
      service
  }

  public listar =
    async (
      req: Request,
      res: Response
    ): Promise<void> => {
      try {
        const filters =
          listCategoriaSchema.parse(
            req.query
          )

        const categorias =
          await this.service.listar(
            filters
          )

        res.status(200).json({
          success: true,
          data: categorias,
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
          categoriaIdSchema.parse(
            req.params
          )

        const categoria =
          await this.service.buscarPorId(
            id
          )

        res.status(200).json({
          success: true,
          data: categoria,
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
          createCategoriaSchema.parse(
            req.body
          )

        const categoria =
          await this.service.criar(
            data
          )

        res.status(201).json({
          success: true,
          data: categoria,
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
          categoriaIdSchema.parse(
            req.params
          )

        const data =
          updateCategoriaSchema.parse(
            req.body
          )

        const categoria =
          await this.service.atualizar(
            id,
            data
          )

        res.status(200).json({
          success: true,
          data: categoria,
        })
      } catch (error) {
        this.handleError(
          res,
          error
        )
      }
    }

  public excluir =
    async (
      req: Request,
      res: Response
    ): Promise<void> => {
      try {
        const {
          id,
        } =
          categoriaIdSchema.parse(
            req.params
          )

        const result =
          await this.service.excluir(
            id
          )

        res.status(200).json({
          success: true,
          data: result,
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
                  ),

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
      '[CategoriaController] Erro inesperado:',
      error
    )

    res.status(500).json({
      success: false,
      error:
        'Erro interno do servidor',
    })
  }
}