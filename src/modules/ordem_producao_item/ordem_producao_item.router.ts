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
  OrdemProducaoItemController,
} from './ordem_producao_item.controller.js'

const router =
  Router()

const controller =
  new OrdemProducaoItemController()

/**
 * Todas as rotas exigem
 * autenticação.
 */

/**
 * GET /ordens_producao_itens
 *
 * Lista itens das ordens
 * de produção.
 *
 * Query params:
 * - page
 * - limit
 * - id_ordem_producao
 * - id_produto
 * - id_modelo
 * - id_cor
 * - id_tamanho
 */
router.get(
  '/',
  controller.listar
)

/**
 * GET /ordens_producao_itens/:id
 *
 * Busca um item da ordem
 * de produção pelo ID.
 */
router.get(
  '/:id',
  controller.buscarPorId
)

/**
 * POST /ordens_producao_itens
 *
 * Cria um novo item
 * da ordem de produção.
 *
 * Requer ADMIN.
 */
router.post(
  '/',

  controller.criar
)

/**
 * PUT /ordens_producao_itens/:id
 *
 * Atualiza parcialmente
 * um item.
 *
 * Não permite alteração de:
 * - id
 * - id_ordem_producao
 *
 * Requer ADMIN.
 */
router.put(
  '/:id',

  controller.atualizar
)

/**
 * DELETE /ordens_producao_itens/:id
 *
 * Exclui fisicamente
 * um item da ordem.
 *
 * Requer ADMIN.
 */
router.delete(
  '/:id',

  controller.excluir
)

export default router