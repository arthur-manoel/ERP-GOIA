import {
  Router,
} from 'express'

import {
  ProdutoController,
} from './produtos.controller.js'

const router =
  Router()

const controller =
  new ProdutoController()

/**
 * GET /produtos
 *
 * Lista produtos.
 *
 * Query params:
 * - page
 * - limit
 * - q
 * - id_tipo_produto
 * - id_categoria
 * - id_modelo
 * - status
 * - include_inativos
 */
router.get(
  '/',
  controller.listar
)

/**
 * GET /produtos/:id
 *
 * Busca um produto pelo ID.
 */
router.get(
  '/:id',
  controller.buscarPorId
)

/**
 * POST /produtos
 *
 * Cadastra um produto.
 */
router.post(
  '/',
  controller.criar
)

/**
 * PUT /produtos/:id
 *
 * Atualiza parcialmente
 * um produto.
 */
router.put(
  '/:id',
  controller.atualizar
)

/**
 * DELETE /produtos/:id
 *
 * Exclusão lógica.
 *
 * Define:
 * status = INATIVO
 */
router.delete(
  '/:id',
  controller.excluir
)

export default router