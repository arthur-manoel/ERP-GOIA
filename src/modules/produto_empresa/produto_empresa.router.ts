import {
  Router,
} from 'express'

import {
  ProdutoEmpresaController,
} from './produto_empresa.controller.js'

const router =
  Router()

const controller =
  new ProdutoEmpresaController()

/**
 * GET /produto_empresa
 *
 * Lista produtos vinculados
 * às empresas.
 */
router.get(
  '/',
  controller.listar
)

/**
 * GET /produto_empresa/:id
 *
 * Busca um produto da empresa
 * pelo ID.
 */
router.get(
  '/:id',
  controller.buscarPorId
)

/**
 * POST /produto_empresa
 *
 * Vincula um produto
 * a uma empresa.
 */
router.post(
  '/',
  controller.criar
)

/**
 * PUT /produto_empresa/:id
 *
 * Atualiza parcialmente
 * um produto da empresa.
 */
router.put(
  '/:id',
  controller.atualizar
)

/**
 * DELETE /produto_empresa/:id
 *
 * Exclusão lógica.
 *
 * Altera status para INATIVO.
 */
router.delete(
  '/:id',
  controller.excluir
)

export default router