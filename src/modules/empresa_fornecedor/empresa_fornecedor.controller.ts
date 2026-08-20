import type {
  Request,
  Response,
} from 'express'

import {
  ZodError,
} from 'zod'

import {
  ConflictError,
  EmpresaFornecedorService,
  NotFoundError,
  ValidationError,
} from './empresa_fornecedor.service.js'

import {
  createEmpresaFornecedorSchema,
  empresaFornecedorIdSchema,
  listEmpresaFornecedorSchema,
  updateEmpresaFornecedorSchema,
} from './empresa_fornecedor.schema.js'

export class EmpresaFornecedorController {
  private readonly service:
    EmpresaFornecedorService

  constructor(
    service =
      new EmpresaFornecedorService()
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
          listEmpresaFornecedorSchema.parse(
            req.query
          )

        const result =
          await this.service.listar(
            filters
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

  public buscarPorId =
    async (
      req: Request,
      res: Response
    ): Promise<void> => {
      try {
        const { id } =
          empresaFornecedorIdSchema.parse(
            req.params
          )

        const result =
          await this.service.buscarPorId(
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

  public criar =
    async (
      req: Request,
      res: Response
    ): Promise<void> => {
      try {
        const data =
          createEmpresaFornecedorSchema.parse(
            req.body
          )

        const result =
          await this.service.criar(
            data
          )

        res.status(201).json({
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

  public atualizar =
    async (
      req: Request,
      res: Response
    ): Promise<void> => {
      try {
        const { id } =
          empresaFornecedorIdSchema.parse(
            req.params
          )

        const data =
          updateEmpresaFornecedorSchema.parse(
            req.body
          )

        const result =
          await this.service.atualizar(
            id,
            data
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

  public excluir =
    async (
      req: Request,
      res: Response
    ): Promise<void> => {
      try {
        const { id } =
          empresaFornecedorIdSchema.parse(
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
      '[EmpresaFornecedorController] Erro inesperado:',
      error
    )

    res.status(500).json({
      success: false,

      error:
        'Erro interno do servidor',
    })
  }
}