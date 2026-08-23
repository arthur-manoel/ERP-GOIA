import { Router } from 'express'
import { authenticate } from '../../middlewares/authenticate.js'
import { requireAdmin } from '../../middlewares/requireAdmin.js'
import { ItemPedidoCompraController } from './item_pedido_compra.controller.js'

const router = Router()
const controller = new ItemPedidoCompraController()

/** Todas as rotas exigem autenticação. */
router.use(authenticate)

/** GET /itens_pedido_compra - Lista itens com paginação e filtros por pedido ou produto. */
router.get('/', controller.listar)

/** GET /itens_pedido_compra/:id - Busca um item pelo ID. */
router.get('/:id', controller.buscarPorId)

/** POST /itens_pedido_compra - Cria um item e calcula seu valor total. */
router.post('/', requireAdmin, controller.criar)

/** PUT /itens_pedido_compra/:id - Atualiza parcialmente um item. */
router.put('/:id', requireAdmin, controller.atualizar)

/** DELETE /itens_pedido_compra/:id - Exclui fisicamente um item. */
router.delete('/:id', requireAdmin, controller.excluir)

export default router
