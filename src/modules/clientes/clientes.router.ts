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
  createCliente,
  deleteCliente,
  getClienteById,
  listClientes,
  updateCliente,
} from './clientes.controller.js'

const router =
  Router()

router.post(
  '/',
  authenticate,
  requireAdmin,
  createCliente
)

router.get(
  '/',
  authenticate,
  listClientes
)

router.get(
  '/:id',
  authenticate,
  getClienteById
)

router.put(
  '/:id',
  authenticate,
  requireAdmin,
  updateCliente
)

router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  deleteCliente
)

export default router