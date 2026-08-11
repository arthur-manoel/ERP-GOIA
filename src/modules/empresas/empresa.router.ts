import { Router } from 'express'

import {
  createEmpresaController,
  deleteEmpresaController,
  getEmpresaByIdController,
  listEmpresasController,
  updateEmpresaController,
} from './empresa.controller.js'

const empresaRouter =
  Router()

empresaRouter.get(
  '/',
  listEmpresasController
)

empresaRouter.get(
  '/:id',
  getEmpresaByIdController
)

empresaRouter.post(
  '/',
  createEmpresaController
)

empresaRouter.put(
  '/:id',
  updateEmpresaController
)

empresaRouter.delete(
  '/:id',
  deleteEmpresaController
)

export default empresaRouter