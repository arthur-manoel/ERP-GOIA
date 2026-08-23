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
  NecessidadeProducaoController,
} from './necessidade_producao.controller.js'

const router =
  Router()

const controller =
  new NecessidadeProducaoController()

/**
 * Todas as rotas exigem
 * autenticação.
 */
router.use(
  authenticate
)

/**
 * GET /necessidades_producao
 *
 * Lista necessidades
 * de produção.
 *
 * Query params:
 * - page
 * - limit
 * - id_ordem_producao
 * - id_produto
 * - status
 */
router.get(
  '/',
  controller.listar
)

/**
 * GET /necessidades_producao/:id
 *
 * Busca uma necessidade
 * de produção pelo ID.
 */
router.get(
  '/:id',
  controller.buscarPorId
)

/**
 * POST /necessidades_producao
 *
 * Cria uma necessidade
 * de produção.
 *
 * Requer ADMIN.
 */
router.post(
  '/',
  requireAdmin,
  controller.criar
)

/**
 * PUT /necessidades_producao/:id
 *
 * Atualiza parcialmente
 * uma necessidade.
 *
 * Não permite alteração
 * do ID.
 *
 * Requer ADMIN.
 */
router.put(
  '/:id',
  requireAdmin,
  controller.atualizar
)

/**
 * DELETE /necessidades_producao/:id
 *
 * Cancela logicamente
 * uma necessidade.
 *
 * Define:
 * status = CANCELADO
 *
 * Requer ADMIN.
 */
router.delete(
  '/:id',
  requireAdmin,
  controller.cancelar
)

export default router