import type { Request, Response } from 'express'
import { ZodError } from 'zod'
import { CompraItensService, ConflictError, NotFoundError, ValidationError } from './compra_itens.service.js'
import { compraItemIdSchema, createCompraItemSchema, listCompraItensSchema, updateCompraItemSchema } from './compra_itens.schema.js'

export class CompraItensController {
  private readonly service = new CompraItensService()
  public listar = async (req: Request, res: Response): Promise<void> => {
    try { res.status(200).json({ success: true, data: await this.service.listar(listCompraItensSchema.parse(req.query)) }) }
    catch (error) { this.handleError(res, error) }
  }
  public buscarPorId = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = compraItemIdSchema.parse(req.params)
      res.status(200).json({ success: true, data: await this.service.buscarPorId(id) })
    } catch (error) { this.handleError(res, error) }
  }
  public criar = async (req: Request, res: Response): Promise<void> => {
    try { res.status(201).json({ success: true, data: await this.service.criar(createCompraItemSchema.parse(req.body)) }) }
    catch (error) { this.handleError(res, error) }
  }
  public atualizar = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = compraItemIdSchema.parse(req.params)
      res.status(200).json({ success: true, data: await this.service.atualizar(id, updateCompraItemSchema.parse(req.body)) })
    } catch (error) { this.handleError(res, error) }
  }
  public excluir = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = compraItemIdSchema.parse(req.params)
      res.status(200).json({ success: true, data: await this.service.excluir(id) })
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
    console.error('[CompraItensController] Erro inesperado:', error)
    res.status(500).json({ success: false, error: 'Erro interno do servidor' })
  }
}
