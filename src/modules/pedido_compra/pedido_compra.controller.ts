import type { Request, Response } from 'express'
import { ZodError } from 'zod'
import {
  ConflictError, NotFoundError, PedidoCompraService, ValidationError,
} from './pedido_compra.service.js'
import {
  createPedidoCompraSchema, listPedidoCompraSchema, pedidoCompraIdSchema, updatePedidoCompraSchema,
} from './pedido_compra.schema.js'

export class PedidoCompraController {
  private readonly service = new PedidoCompraService()

  public listar = async (req: Request, res: Response): Promise<void> => {
    try {
      res.status(200).json({ success: true, data: await this.service.listar(listPedidoCompraSchema.parse(req.query)) })
    } catch (error) { this.handleError(res, error) }
  }
  public buscarPorId = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = pedidoCompraIdSchema.parse(req.params)
      res.status(200).json({ success: true, data: await this.service.buscarPorId(id) })
    } catch (error) { this.handleError(res, error) }
  }
  public criar = async (req: Request, res: Response): Promise<void> => {
    try {
      res.status(201).json({ success: true, data: await this.service.criar(createPedidoCompraSchema.parse(req.body)) })
    } catch (error) { this.handleError(res, error) }
  }
  public atualizar = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = pedidoCompraIdSchema.parse(req.params)
      res.status(200).json({ success: true, data: await this.service.atualizar(id, updatePedidoCompraSchema.parse(req.body)) })
    } catch (error) { this.handleError(res, error) }
  }
  public cancelar = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = pedidoCompraIdSchema.parse(req.params)
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
    console.error('[PedidoCompraController] Erro inesperado:', error)
    res.status(500).json({ success: false, error: 'Erro interno do servidor' })
  }
}
