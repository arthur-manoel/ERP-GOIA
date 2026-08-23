import { Router } from 'express'

import { authenticate } from '../../middlewares/authenticate.js'
import { requireAdmin } from '../../middlewares/requireAdmin.js'

import {
  ReservaEstoqueController,
} from './reserva_estoque.controller.js'

const router = Router()

const controller =
  new ReservaEstoqueController()

// Todas as rotas exigem autenticação
router.use(authenticate)

// GET /reserva_estoque
router.get(
  '/',
  controller.listar
)

// GET /reserva_estoque/:id
router.get(
  '/:id',
  controller.buscarPorId
)

// POST /reserva_estoque
// Requer ADMIN
router.post(
  '/',
  requireAdmin,
  controller.criar
)

// PUT /reserva_estoque/:id
// Requer ADMIN
router.put(
  '/:id',
  requireAdmin,
  controller.atualizar
)

// DELETE /reserva_estoque/:id
// Requer ADMIN
router.delete(
  '/:id',
  requireAdmin,
  controller.cancelar
)

export default router