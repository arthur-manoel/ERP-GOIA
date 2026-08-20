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
  CategoriaController,
} from './categoria.controller.js'

const router =
  Router()

const controller =
  new CategoriaController()

router.get(
  '/',
  authenticate,
  controller.findAll.bind(
    controller
  )
)

router.get(
  '/:id',
  authenticate,
  controller.findById.bind(
    controller
  )
)

router.post(
  '/',
  authenticate,
  requireAdmin,
  controller.create.bind(
    controller
  )
)

router.put(
  '/:id',
  authenticate,
  requireAdmin,
  controller.update.bind(
    controller
  )
)

router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  controller.delete.bind(
    controller
  )
)

export default router