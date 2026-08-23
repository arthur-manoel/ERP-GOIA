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
  MovimentacaoEstoqueController,
} from './movimentacao_estoque.controller.js'

const router =
  Router()

const controller =
  new MovimentacaoEstoqueController()

/**
 * Todas as rotas exigem
 * autenticação.
 */

/**
 * GET /movimentacao_estoque
 *
 * Lista movimentações
 * de estoque.
 *
 * Query params:
 * - page
 * - limit
 * - id_empresa
 * - id_setor
 * - id_produto
 * - tipo
 * - origem_tipo
 */
router.get(
  '/',
  controller.listar
)

/**
 * GET /movimentacao_estoque/:id
 *
 * Busca uma movimentação
 * pelo ID.
 */
router.get(
  '/:id',
  controller.buscarPorId
)

/**
 * POST /movimentacao_estoque
 *
 * Cria uma nova
 * movimentação de estoque.
 *
 * Requer ADMIN.
 */
router.post(
  '/',

  controller.criar
)

/**
 * PUT /movimentacao_estoque/:id
 *
 * Atualiza parcialmente
 * uma movimentação.
 *
 * Não permite alteração de:
 * - id
 * - data_movimentacao
 *
 * Requer ADMIN.
 */
router.put(
  '/:id',

  controller.atualizar
)

/**
 * DELETE /movimentacao_estoque/:id
 *
 * Remove fisicamente
 * uma movimentação.
 *
 * Requer ADMIN.
 */
router.delete(
  '/:id',

  controller.excluir
)

export default router