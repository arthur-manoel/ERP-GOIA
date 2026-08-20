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
  createCargoController,
  deleteCargoController,
  getCargoByIdController,
  listCargosController,
  updateCargoController,
} from './cargos.controller.js'

const router =
  Router()

router.post(
  '/',
  authenticate,
  requireAdmin,
  createCargoController
)

router.get(
  '/',
  authenticate,
  listCargosController
)

router.get(
  '/:id',
  authenticate,
  getCargoByIdController
)

router.put(
  '/:id',
  authenticate,
  requireAdmin,
  updateCargoController
)

router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  deleteCargoController
)

export default router