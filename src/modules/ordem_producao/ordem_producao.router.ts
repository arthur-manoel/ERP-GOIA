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
  OrdemProducaoController,
} from './ordem_producao.controller.js'

const router =
  Router()

const controller =
  new OrdemProducaoController()

/**
 * Todas as rotas exigem
 * autenticação.
 */
router.use(
  authenticate
)

/**
 * GET /ordens_producao
 *
 * Lista ordens de produção.
 *
 * Query params:
 * - page
 * - limit
 * - id_empresa
 * - id_setor
 * - status
 * - data_inicio_de
 * - data_inicio_ate
 */
router.get(
  '/',
  controller.listar
)

/**
 * GET /ordens_producao/:id
 *
 * Busca uma ordem de produção
 * pelo ID.
 */
router.get(
  '/:id',
  controller.buscarPorId
)

/**
 * POST /ordens_producao
 *
 * Cria uma nova ordem
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
 * PUT /ordens_producao/:id
 *
 * Atualiza parcialmente
 * uma ordem de produção.
 *
 * Não permite alteração de:
 * - id
 * - numero
 * - data_conclusao
 *
 * Requer ADMIN.
 */
router.put(
  '/:id',
  requireAdmin,
  controller.atualizar
)

/**
 * DELETE /ordens_producao/:id
 *
 * Cancela logicamente
 * uma ordem de produção.
 *
 * Define:
 * status = CANCELADA
 * data_conclusao = CURRENT_DATE
 *
 * Requer ADMIN.
 */
router.delete(
  '/:id',
  requireAdmin,
  controller.cancelar
)

export default router