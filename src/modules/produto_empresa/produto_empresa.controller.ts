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
  ProdutoEmpresaService,
  ValidationError,
} from './produto_empresa.service.js'

import {
  createProdutoEmpresaSchema,
  listProdutoEmpresaSchema,
  produtoEmpresaIdSchema,
  updateProdutoEmpresaSchema,
} from './produto_empresa.schema.js'

export class ProdutoEmpresaController {
  private readonly service =
    new ProdutoEmpresaService()

  public listar =
    async (
      req: Request,
      res: Response
    ): Promise<void> => {
      try {
        const filters =
          listProdutoEmpresaSchema
            .parse(
              req.query
            )

        const result =
          await this.service
            .listar(
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
          produtoEmpresaIdSchema
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
          createProdutoEmpresaSchema
            .parse(
              req.body
            )

        const result =
          await this.service
            .criar(
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
          produtoEmpresaIdSchema
            .parse(
              req.params
            )

        const data =
          updateProdutoEmpresaSchema
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

  public excluir =
    async (
      req: Request,
      res: Response
    ): Promise<void> => {
      try {
        const {
          id,
        } =
          produtoEmpresaIdSchema
            .parse(
              req.params
            )

        const result =
          await this.service
            .excluir(
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
      '[ProdutoEmpresaController] Erro inesperado:',
      error
    )

    res.status(500).json({
      success: false,

      error:
        'Erro interno do servidor',
    })
  }
}