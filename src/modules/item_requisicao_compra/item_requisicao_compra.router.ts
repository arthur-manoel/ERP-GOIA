import { Router } from 'express'
import { authenticate } from '../../middlewares/authenticate.js'
import { requireAdmin } from '../../middlewares/requireAdmin.js'
import { ItemRequisicaoCompraController } from './item_requisicao_compra.controller.js'

const router = Router()
const controller = new ItemRequisicaoCompraController()

/** Todas as rotas exigem autenticação. */
router.use(authenticate)

/** GET /itens_requisicao_compra - Lista itens com paginação e filtros. */
router.get('/', controller.listar)

/** GET /itens_requisicao_compra/:id - Busca um item pelo ID. */
router.get('/:id', controller.buscarPorId)

/** POST /itens_requisicao_compra - Cria um item. Requer ADMIN. */
router.post('/', requireAdmin, controller.criar)

/** PUT /itens_requisicao_compra/:id - Atualiza parcialmente. Requer ADMIN. */
router.put('/:id', requireAdmin, controller.atualizar)

/** DELETE /itens_requisicao_compra/:id - Exclui fisicamente. Requer ADMIN. */
router.delete('/:id', requireAdmin, controller.excluir)

export default router
