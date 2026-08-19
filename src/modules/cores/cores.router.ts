import {
  Router,
} from 'express'

import {
  CorController,
} from './cores.controller.js'

const router =
  Router()

const controller =
  new CorController()

/**
 * GET /cores
 *
 * Lista as cores.
 *
 * Query params:
 * - page
 * - limit
 * - q
 * - include_inativos
 */
router.get(
  '/',
  controller.findAll.bind(
    controller
  )
)

/**
 * GET /cores/:id
 *
 * Busca uma cor pelo ID.
 */
router.get(
  '/:id',
  controller.findById.bind(
    controller
  )
)

/**
 * POST /cores
 *
 * Cadastra uma nova cor.
 */
router.post(
  '/',
  controller.create.bind(
    controller
  )
)

/**
 * PUT /cores/:id
 *
 * Atualiza parcialmente
 * uma cor.
 */
router.put(
  '/:id',
  controller.update.bind(
    controller
  )
)

/**
 * DELETE /cores/:id
 *
 * Realiza exclusão lógica
 * definindo ativo = false.
 */
router.delete(
  '/:id',
  controller.softDelete.bind(
    controller
  )
)

export default router