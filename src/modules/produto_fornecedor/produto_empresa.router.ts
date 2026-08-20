import {
  Router,
} from 'express'

import {
  ProdutoFornecedorController,
} from './produto_fornecedor.controller.js'

const router =
  Router()

const controller =
  new ProdutoFornecedorController()

/**
 * GET /produto_fornecedor
 *
 * Lista os vínculos entre
 * produtos e fornecedores.
 *
 * Query params:
 * - page
 * - limit
 * - id_empresa
 * - id_produto
 * - id_fornecedor
 * - include_inativos
 */
router.get(
  '/',
  controller.listar
)

/**
 * GET /produto_fornecedor/:id
 *
 * Busca um vínculo pelo ID.
 */
router.get(
  '/:id',
  controller.buscarPorId
)

/**
 * POST /produto_fornecedor
 *
 * Cria um vínculo entre
 * produto e fornecedor.
 */
router.post(
  '/',
  controller.criar
)

/**
 * PUT /produto_fornecedor/:id
 *
 * Atualiza parcialmente
 * um vínculo existente.
 */
router.put(
  '/:id',
  controller.atualizar
)

/**
 * DELETE /produto_fornecedor/:id
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