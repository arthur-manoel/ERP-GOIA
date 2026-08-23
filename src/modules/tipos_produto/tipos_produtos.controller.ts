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
  TipoProdutoService,
  ValidationError,
} from './tipos_produtos.service.js'

import {
  createTipoProdutoSchema,
  listTiposProdutosSchema,
  tipoProdutoIdSchema,
  updateTipoProdutoSchema,
} from './tipos_produtos.schema.js'

export class TipoProdutoController {
  private readonly service:
    TipoProdutoService

  constructor(
    service =
      new TipoProdutoService()
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
          listTiposProdutosSchema.parse(
            req.query
          )

        const tiposProdutos =
          await this.service.listar(
            filters
          )

        res.status(200).json({
          success: true,
          data: tiposProdutos,
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
        const { id } =
          tipoProdutoIdSchema.parse(
            req.params
          )

        const tipoProduto =
          await this.service.buscarPorId(
            id
          )

        res.status(200).json({
          success: true,
          data: tipoProduto,
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
          createTipoProdutoSchema.parse(
            req.body
          )

        const tipoProduto =
          await this.service.criar(
            data
          )

        res.status(201).json({
          success: true,
          data: tipoProduto,
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
        const { id } =
          tipoProdutoIdSchema.parse(
            req.params
          )

        const data =
          updateTipoProdutoSchema.parse(
            req.body
          )

        const tipoProduto =
          await this.service.atualizar(
            id,
            data
          )

        res.status(200).json({
          success: true,
          data: tipoProduto,
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
        const { id } =
          tipoProdutoIdSchema.parse(
            req.params
          )

        const resultado =
          await this.service.excluir(
            id
          )

        res.status(200).json({
          success: true,
          data: resultado,
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
                  issue.path.length > 0
                    ? issue.path.join(
                        '.'
                      )
                    : 'body',

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
      '[TipoProdutoController] Erro inesperado:',
      error
    )

    res.status(500).json({
      success: false,
      error:
        'Erro interno do servidor',
    })
  }
}