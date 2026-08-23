import { Router } from 'express'
import { authenticate } from '../../middlewares/authenticate.js'
import { requireAdmin } from '../../middlewares/requireAdmin.js'
import { CompraItensController } from './compra_itens.controller.js'

const router = Router()
const controller = new CompraItensController()

/** Todas as rotas exigem autenticação. */
router.use(authenticate)
/** GET /compra_itens - Lista itens com paginação e filtros. */
router.get('/', controller.listar)
/** GET /compra_itens/:id - Busca um item pelo ID. */
router.get('/:id', controller.buscarPorId)
/** POST /compra_itens - Cria um item e calcula o total. Requer ADMIN. */
router.post('/', requireAdmin, controller.criar)
/** PUT /compra_itens/:id - Atualiza parcialmente e recalcula o total. Requer ADMIN. */
router.put('/:id', requireAdmin, controller.atualizar)
/** DELETE /compra_itens/:id - Exclui fisicamente um item. Requer ADMIN. */
router.delete('/:id', requireAdmin, controller.excluir)

export default router
