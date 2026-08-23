import type { NextFunction, Request, Response } from 'express'
import {
  atualizarConsumoSchema,
  atualizarConsumosSchema,
  consumoParamsSchema,
  empresaQuerySchema,
  ordemEmpresaParamsSchema,
  recalcularConsumoSchema,
} from './consumoPlanejado.schema.js'
import {
  consultarPlanejamento,
  editarConsumos,
  excluirPlanejamentoCompleto,
  recalcularPlanejamento,
} from './consumoPlanejado.service.js'

function usuario(req: Request) {
  if (!req.user)
    throw Object.assign(new Error('Usuário não autenticado'), {
      statusCode: 401,
    })
  return req.user
}

export async function consultar(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { ordemId } = ordemEmpresaParamsSchema.parse(req.params)
    const { empresaId } = empresaQuerySchema.parse(req.query)
    res
      .status(200)
      .json(await consultarPlanejamento(ordemId, empresaId, usuario(req)))
  } catch (error) {
    next(error)
  }
}

export async function recalcular(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { ordemId } = ordemEmpresaParamsSchema.parse(req.params)
    const { empresaId } = empresaQuerySchema.parse(req.query)
    const { gerarPedidoCompra } = recalcularConsumoSchema.parse(req.body ?? {})
    res
      .status(200)
      .json(
        await recalcularPlanejamento(
          ordemId,
          empresaId,
          usuario(req),
          gerarPedidoCompra,
        ),
      )
  } catch (error) {
    next(error)
  }
}

export async function editar(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { ordemId, consumoId } = consumoParamsSchema.parse(req.params)
    const { empresaId } = empresaQuerySchema.parse(req.query)
    const data = atualizarConsumoSchema.parse(req.body)
    res
      .status(200)
      .json(
        await editarConsumos(
          ordemId,
          empresaId,
          usuario(req),
          [{ id: consumoId, quantidadeNecessaria: data.quantidadeNecessaria }],
          data.gerarPedidoCompra,
        ),
      )
  } catch (error) {
    next(error)
  }
}

export async function editarLote(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { ordemId } = ordemEmpresaParamsSchema.parse(req.params)
    const { empresaId } = empresaQuerySchema.parse(req.query)
    const data = atualizarConsumosSchema.parse(req.body)
    res
      .status(200)
      .json(
        await editarConsumos(
          ordemId,
          empresaId,
          usuario(req),
          data.consumos,
          data.gerarPedidoCompra,
        ),
      )
  } catch (error) {
    next(error)
  }
}

export async function excluir(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { ordemId } = ordemEmpresaParamsSchema.parse(req.params)
    const { empresaId } = empresaQuerySchema.parse(req.query)
    await excluirPlanejamentoCompleto(ordemId, empresaId, usuario(req))
    res.status(204).send()
  } catch (error) {
    next(error)
  }
}
