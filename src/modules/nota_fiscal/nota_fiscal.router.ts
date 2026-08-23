import {
  Router,
} from 'express'

import {
  createNotaFiscal,
  deleteNotaFiscal,
  getNotaFiscalById,
  listNotasFiscais,
  updateNotaFiscal,
} from './nota_fiscal.controller.js'

const router =
  Router()

/**
 * GET /notas_fiscais
 *
 * Lista notas fiscais.
 *
 * Query params disponíveis:
 * page
 * limit
 * q
 * id_empresa
 * id_fronecedor
 * id_pedido_compra
 * id_setor_destino
 * status
 * entrada_processada
 */
router.get(
  '/',

  listNotasFiscais
)

/**
 * GET /notas_fiscais/:id
 *
 * Retorna uma nota fiscal pelo ID.
 */
router.get(
  '/:id',

  getNotaFiscalById
)

/**
 * POST /notas_fiscais
 *
 * Cria uma nova nota fiscal.
 */
router.post(
  '/',

  createNotaFiscal
)

/**
 * PUT /notas_fiscais/:id
 *
 * Atualiza parcialmente
 * uma nota fiscal.
 */
router.put(
  '/:id',

  updateNotaFiscal
)

/**
 * DELETE /notas_fiscais/:id
 *
 * Exclui uma nota fiscal.
 */
router.delete(
  '/:id',

  deleteNotaFiscal
)

export default router