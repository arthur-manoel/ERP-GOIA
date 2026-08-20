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
  createUsuario,
  deleteUsuario,
  getUsuarioById,
  listUsuarios,
  updateUsuario,
} from './usuarios.controller.js'

const router =
  Router()

router.post(
  '/',
  authenticate,
  requireAdmin,
  createUsuario
)

router.get(
  '/',
  authenticate,
  listUsuarios
)

router.get(
  '/:id',
  authenticate,
  getUsuarioById
)

router.put(
  '/:id',
  authenticate,
  updateUsuario
)

router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  deleteUsuario
)

export default router