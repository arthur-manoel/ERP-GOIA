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
  createSetor,
  deleteSetor,
  getSetorById,
  listSetores,
  updateSetor,
} from './setores.controller.js'

const router =
  Router()

router.post(
  '/',
  authenticate,
  requireAdmin,
  createSetor
)

router.get(
  '/',
  authenticate,
  listSetores
)

router.get(
  '/:id',
  authenticate,
  getSetorById
)

router.put(
  '/:id',
  authenticate,
  requireAdmin,
  updateSetor
)

router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  deleteSetor
)

export default router