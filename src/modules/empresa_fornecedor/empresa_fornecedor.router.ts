import {
  Router,
} from 'express'

import {
  EmpresaFornecedorController,
} from './empresa_fornecedor.controller.js'

const router =
  Router()

const controller =
  new EmpresaFornecedorController()

/**
 * GET /empresa_fornecedor
 *
 * Lista associações entre
 * empresas e fornecedores.
 *
 * Query params:
 * - page
 * - limit
 * - id_empresa
 * - id_fornecedor
 * - include_inativos
 */
router.get(
  '/',
  controller.listar
)

/**
 * GET /empresa_fornecedor/:id
 *
 * Busca uma associação pelo ID.
 */
router.get(
  '/:id',
  controller.buscarPorId
)

/**
 * POST /empresa_fornecedor
 *
 * Cria uma associação.
 *
 * Body:
 * - id_empresa
 * - id_fornecedor
 * - prazo_pagamento
 * - prazo_entrega
 * - observacao
 * - status
 */
router.post(
  '/',
  controller.criar
)

/**
 * PUT /empresa_fornecedor/:id
 *
 * Atualiza parcialmente
 * uma associação.
 */
router.put(
  '/:id',
  controller.atualizar
)

/**
 * DELETE /empresa_fornecedor/:id
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