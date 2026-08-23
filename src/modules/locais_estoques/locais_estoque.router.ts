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
  LocaisEstoqueController,
} from './locais_estoque.controller.js'

const router =
  Router()

const controller =
  new LocaisEstoqueController()

/**
 * Todas as rotas exigem
 * autenticação.
 */

/**
 * GET /locais_estoque
 *
 * Lista locais de estoque.
 *
 * Query params:
 * - page
 * - limit
 * - id_empresa
 * - status
 */
router.get(
  '/',
  controller.listar
)

/**
 * GET /locais_estoque/:id
 *
 * Busca um local de estoque
 * pelo ID.
 */
router.get(
  '/:id',
  controller.buscarPorId
)

/**
 * POST /locais_estoque
 *
 * Cria um novo local
 * de estoque.
 *
 * Requer ADMIN.
 */
router.post(
  '/',

  controller.criar
)

/**
 * PUT /locais_estoque/:id
 *
 * Atualiza parcialmente
 * um local de estoque.
 *
 * Não permite alteração
 * do ID.
 *
 * Requer ADMIN.
 */
router.put(
  '/:id',

  controller.atualizar
)

/**
 * DELETE /locais_estoque/:id
 *
 * Realiza exclusão lógica.
 *
 * Define:
 * status = INATIVO
 *
 * Requer ADMIN.
 */
router.delete(
  '/:id',

  controller.excluir
)

export default router