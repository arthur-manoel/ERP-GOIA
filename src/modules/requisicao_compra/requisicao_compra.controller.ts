import type { Request, Response } from 'express'
import { ZodError } from 'zod'
import {
  ConflictError, NotFoundError, RequisicaoCompraService, ValidationError,
} from './requisicao_compra.service.js'
import {
  createRequisicaoCompraSchema, listRequisicaoCompraSchema,
  requisicaoCompraIdSchema, updateRequisicaoCompraSchema,
} from './requisicao_compra.schema.js'

export class RequisicaoCompraController {
  private readonly service = new RequisicaoCompraService()

  public listar = async (req: Request, res: Response): Promise<void> => {
    try {
      res.status(200).json({ success: true, data: await this.service.listar(listRequisicaoCompraSchema.parse(req.query)) })
    } catch (error) { this.handleError(res, error) }
  }
  public buscarPorId = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = requisicaoCompraIdSchema.parse(req.params)
      res.status(200).json({ success: true, data: await this.service.buscarPorId(id) })
    } catch (error) { this.handleError(res, error) }
  }
  public criar = async (req: Request, res: Response): Promise<void> => {
    try {
      res.status(201).json({ success: true, data: await this.service.criar(createRequisicaoCompraSchema.parse(req.body)) })
    } catch (error) { this.handleError(res, error) }
  }
  public atualizar = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = requisicaoCompraIdSchema.parse(req.params)
      res.status(200).json({ success: true, data: await this.service.atualizar(id, updateRequisicaoCompraSchema.parse(req.body)) })
    } catch (error) { this.handleError(res, error) }
  }
  public cancelar = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = requisicaoCompraIdSchema.parse(req.params)
      res.status(200).json({ success: true, data: await this.service.cancelar(id) })
    } catch (error) { this.handleError(res, error) }
  }

  private handleError(res: Response, error: unknown): void {
    if (error instanceof ZodError) {
      res.status(400).json({ success: false, error: 'Dados inválidos', data: {
        issues: error.issues.map((issue) => ({ field: issue.path.join('.') || 'root', message: issue.message })),
      } }); return
    }
    if (error instanceof ValidationError) { res.status(400).json({ success: false, error: error.message }); return }
    if (error instanceof NotFoundError) { res.status(404).json({ success: false, error: error.message }); return }
    if (error instanceof ConflictError) { res.status(409).json({ success: false, error: error.message }); return }
    console.error('[RequisicaoCompraController] Erro inesperado:', error)
    res.status(500).json({ success: false, error: 'Erro interno do servidor' })
  }
}
