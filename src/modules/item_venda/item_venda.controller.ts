import type { Request, Response } from 'express'
import { ZodError } from 'zod'
import {
  ConflictError,
  ItemVendaService,
  NotFoundError,
  ValidationError,
} from './item_venda.service.js'
import {
  createItemVendaSchema,
  itemVendaIdSchema,
  listItemVendaSchema,
  updateItemVendaSchema,
} from './item_venda.schema.js'

export class ItemVendaController {
  private readonly service = new ItemVendaService()

  public listar = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.service.listar(listItemVendaSchema.parse(req.query))
      res.status(200).json({ success: true, data: result })
    } catch (error) { this.handleError(res, error) }
  }

  public buscarPorId = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = itemVendaIdSchema.parse(req.params)
      res.status(200).json({ success: true, data: await this.service.buscarPorId(id) })
    } catch (error) { this.handleError(res, error) }
  }

  public criar = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = createItemVendaSchema.parse(req.body)
      res.status(201).json({ success: true, data: await this.service.criar(data) })
    } catch (error) { this.handleError(res, error) }
  }

  public atualizar = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = itemVendaIdSchema.parse(req.params)
      const data = updateItemVendaSchema.parse(req.body)
      res.status(200).json({ success: true, data: await this.service.atualizar(id, data) })
    } catch (error) { this.handleError(res, error) }
  }

  public excluir = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = itemVendaIdSchema.parse(req.params)
      res.status(200).json({ success: true, data: await this.service.excluir(id) })
    } catch (error) { this.handleError(res, error) }
  }

  private handleError(res: Response, error: unknown): void {
    if (error instanceof ZodError) {
      res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        data: { issues: error.issues.map((issue) => ({
          field: issue.path.join('.') || 'root', message: issue.message,
        })) },
      })
      return
    }
    if (error instanceof ValidationError) {
      res.status(400).json({ success: false, error: error.message }); return
    }
    if (error instanceof NotFoundError) {
      res.status(404).json({ success: false, error: error.message }); return
    }
    if (error instanceof ConflictError) {
      res.status(409).json({ success: false, error: error.message }); return
    }
    console.error('[ItemVendaController] Erro inesperado:', error)
    res.status(500).json({ success: false, error: 'Erro interno do servidor' })
  }
}
