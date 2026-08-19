import {
  Router,
} from 'express'

import {
  TipoProdutoController,
} from './tipos_produtos.controller.js'

const router =
  Router()

const controller =
  new TipoProdutoController()

/**
 * GET /tipos_produtos
 *
 * Lista os tipos de produtos.
 *
 * Por padrão, retorna apenas
 * registros ativos.
 *
 * Query params:
 * - page
 * - limit
 * - q
 * - include_inativos
 */
router.get(
  '/',
  controller.listar
)

/**
 * GET /tipos_produtos/:id
 *
 * Busca um tipo de produto
 * pelo ID.
 */
router.get(
  '/:id',
  controller.buscarPorId
)

/**
 * POST /tipos_produtos
 *
 * Cadastra um novo tipo
 * de produto.
 *
 * Body:
 * - nome
 * - descricao (opcional)
 * - ativo (opcional)
 */
router.post(
  '/',
  controller.criar
)

/**
 * PUT /tipos_produtos/:id
 *
 * Atualiza parcialmente um
 * tipo de produto.
 *
 * Campos permitidos:
 * - nome
 * - descricao
 * - ativo
 *
 * id e data_cadastro não
 * podem ser alterados.
 */
router.put(
  '/:id',
  controller.atualizar
)

/**
 * DELETE /tipos_produtos/:id
 *
 * Realiza exclusão lógica
 * definindo ativo = false.
 */
router.delete(
  '/:id',
  controller.excluir
)

export default router