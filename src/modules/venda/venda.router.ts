import {
  Router,
} from 'express'

import {
  authenticate,
} from '../../middlewares/authenticate.js'

import {
  requireAdmin,
} from '../../middlewares/requireAdmin.js'

import {
  VendaController,
} from './venda.controller.js'

const router =
  Router()

const controller =
  new VendaController()

/**
 * Todas as rotas exigem
 * autenticação.
 */

router.use(
  authenticate
)
/**
 * GET /vendas
 *
 * Lista vendas.
 *
 * Query params:
 * - page
 * - limit
 * - id_empresa
 * - id_cliente
 * - status
 * - data_venda_de
 * - data_venda_ate
 */
router.get(
  '/',
  controller.listar
)

/**
 * GET /vendas/:id
 *
 * Busca uma venda
 * pelo ID.
 */
router.get(
  '/:id',
  controller.buscarPorId
)

/**
 * POST /vendas
 *
 * Cria uma nova venda.
 *
 * Requer ADMIN.
 */
router.post(
  '/',
  requireAdmin,
  controller.criar
)

/**
 * PUT /vendas/:id
 *
 * Atualiza parcialmente
 * uma venda.
 *
 * Não permite alteração de:
 * - id
 * - numero
 * - data_entrega
 *
 * Requer ADMIN.
 */
router.put(
  '/:id',
  requireAdmin,
  controller.atualizar
)

/**
 * DELETE /vendas/:id
 *
 * Realiza exclusão lógica.
 *
 * Define:
 * status = CANCELADA
 *
 * Requer ADMIN.
 */
router.delete(
  '/:id',
  requireAdmin,
  controller.cancelar
)

export default router
