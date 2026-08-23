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
  ConsumoProducaoController,
} from './consumo_producao.controller.js'

const router =
  Router()

const controller =
  new ConsumoProducaoController()

/**
 * Todas as rotas exigem
 * autenticação.
 */
router.use(
  authenticate
)

/**
 * GET /consumos_producao
 *
 * Lista consumos de produção.
 *
 * Query params:
 * - page
 * - limit
 * - id_ordem_producao
 * - id_necessidade_producao
 * - id_reserva_estoque
 * - id_produto
 * - id_setor
 */
router.get(
  '/',
  controller.listar
)

/**
 * GET /consumos_producao/:id
 *
 * Busca um consumo
 * de produção pelo ID.
 */
router.get(
  '/:id',
  controller.buscarPorId
)

/**
 * POST /consumos_producao
 *
 * Registra um novo
 * consumo de produção.
 *
 * Requer ADMIN.
 */
router.post(
  '/',
  requireAdmin,
  controller.criar
)

/**
 * PUT /consumos_producao/:id
 *
 * Atualiza parcialmente
 * um consumo de produção.
 *
 * Não permite alteração de:
 * - id
 * - data_consumo
 *
 * Requer ADMIN.
 */
router.put(
  '/:id',
  requireAdmin,
  controller.atualizar
)

/**
 * DELETE /consumos_producao/:id
 *
 * Exclui fisicamente
 * um consumo de produção.
 *
 * Requer ADMIN.
 */
router.delete(
  '/:id',
  requireAdmin,
  controller.excluir
)

export default router