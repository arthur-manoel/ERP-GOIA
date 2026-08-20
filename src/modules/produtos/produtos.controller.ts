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
  ProdutoService,
  ValidationError,
} from './produtos.service.js'

import {
  createProdutoSchema,
  listProdutosSchema,
  produtoIdSchema,
  updateProdutoSchema,
} from './produtos.schema.js'

export class ProdutoController {
  private readonly service:
    ProdutoService

  constructor(
    service =
      new ProdutoService()
  ) {
    this.service = service
  }

  public listar =
    async (
      req: Request,
      res: Response
    ): Promise<void> => {
      try {
        const filters =
          listProdutosSchema.parse(
            req.query
          )

        const produtos =
          await this.service.listar(
            filters
          )

        res.status(200).json({
          success: true,
          data: produtos,
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
          produtoIdSchema.parse(
            req.params
          )

        const produto =
          await this.service.buscarPorId(
            id
          )

        res.status(200).json({
          success: true,
          data: produto,
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
          createProdutoSchema.parse(
            req.body
          )

        const produto =
          await this.service.criar(
            data
          )

        res.status(201).json({
          success: true,
          data: produto,
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
          produtoIdSchema.parse(
            req.params
          )

        const data =
          updateProdutoSchema.parse(
            req.body
          )

        const produto =
          await this.service.atualizar(
            id,
            data
          )

        res.status(200).json({
          success: true,
          data: produto,
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
          produtoIdSchema.parse(
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
                  issue.code ===
                  'unrecognized_keys'
                    ? issue.keys.join(
                        ', '
                      )
                    : issue.path.join(
                        '.'
                      ) || 'root',

                message:
                  issue.code ===
                  'unrecognized_keys'
                    ? 'Existem campos não permitidos na requisição'
                    : issue.message,
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
      '[ProdutoController] Erro inesperado:',
      error
    )

    res.status(500).json({
      success: false,
      error:
        'Erro interno do servidor',
    })
  }
}