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
  createCor,
  deleteCor,
  getCorById,
  listCores,
  updateCor,
} from './cores.controller.js'

const router =
  Router()

/**
 * Cria uma nova cor.
 */
router.post(
  '/',
  authenticate,
  requireAdmin,
  createCor
)

/**
 * Lista as cores.
 */
router.get(
  '/',
  authenticate,
  listCores
)

/**
 * Busca uma cor pelo ID.
 */
router.get(
  '/:id',
  authenticate,
  getCorById
)

/**
 * Atualiza uma cor.
 */
router.put(
  '/:id',
  authenticate,
  requireAdmin,
  updateCor
)

/**
 * Desativa uma cor.
 */
router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  deleteCor
)

export default router