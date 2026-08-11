import { Router } from 'express'

import {
  createFornecedorController,
  deleteFornecedorController,
  getFornecedorByIdController,
  listFornecedoresController,
  updateFornecedorController,
} from './fornecedor.controller.js'

const fornecedorRouter =
  Router()

fornecedorRouter.get(
  '/',
  listFornecedoresController
)

fornecedorRouter.get(
  '/:id',
  getFornecedorByIdController
)

fornecedorRouter.post(
  '/',
  createFornecedorController
)

fornecedorRouter.put(
  '/:id',
  updateFornecedorController
)

fornecedorRouter.delete(
  '/:id',
  deleteFornecedorController
)

export default fornecedorRouter
