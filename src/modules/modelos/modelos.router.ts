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
  createModeloController,
  deleteModeloController,
  getModeloByIdController,
  listModelosController,
  updateModeloController,
} from './modelos.controller.js'

const router =
  Router()

router.post(
  '/',
  authenticate,
  requireAdmin,
  createModeloController
)

router.get(
  '/',
  authenticate,
  listModelosController
)

router.get(
  '/:id',
  authenticate,
  getModeloByIdController
)

router.put(
  '/:id',
  authenticate,
  requireAdmin,
  updateModeloController
)

router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  deleteModeloController
)

export default router