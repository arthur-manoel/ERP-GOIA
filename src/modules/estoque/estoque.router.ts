import {
  Router,
} from 'express'

import {
  EstoqueController,
} from './estoque.controller.js'

const router =
  Router()

const controller =
  new EstoqueController()

/**
 * GET /estoque
 *
 * Lista os registros de estoque.
 *
 * Query params:
 * - page
 * - limit
 * - id_empresa
 * - id_setor
 * - id_produto
 */
router.get(
  '/',
  controller.listar
)

/**
 * GET /estoque/:id
 *
 * Busca um registro
 * de estoque pelo ID.
 */
router.get(
  '/:id',
  controller.buscarPorId
)

/**
 * POST /estoque
 *
 * Cria um novo registro
 * de estoque.
 */
router.post(
  '/',
  controller.criar
)

/**
 * PUT /estoque/:id
 *
 * Atualiza parcialmente
 * um registro de estoque.
 *
 * Não permite alteração de:
 * - id
 * - data_atualizacao
 */
router.put(
  '/:id',
  controller.atualizar
)

/**
 * DELETE /estoque/:id
 *
 * Remove fisicamente um
 * registro de estoque.
 *
 * A tabela não possui campo
 * de status para soft delete.
 */
router.delete(
  '/:id',
  controller.excluir
)

export default router