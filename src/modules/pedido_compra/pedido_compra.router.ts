import { Router } from 'express'
import { authenticate } from '../../middlewares/authenticate.js'
import { requireAdmin } from '../../middlewares/requireAdmin.js'
import { PedidoCompraController } from './pedido_compra.controller.js'

const router = Router()
const controller = new PedidoCompraController()

/** Todas as rotas exigem autenticação. */
router.use(authenticate)

/** GET /pedidos_compra - Lista pedidos com paginação e filtros. */
router.get('/', controller.listar)

/** GET /pedidos_compra/:id - Busca um pedido pelo ID. */
router.get('/:id', controller.buscarPorId)

/** POST /pedidos_compra - Cria um pedido. Requer ADMIN. */
router.post('/', requireAdmin, controller.criar)

/** PUT /pedidos_compra/:id - Atualiza parcialmente um pedido. Requer ADMIN. */
router.put('/:id', requireAdmin, controller.atualizar)

/** DELETE /pedidos_compra/:id - Cancela logicamente um pedido. Requer ADMIN. */
router.delete('/:id', requireAdmin, controller.cancelar)

export default router
