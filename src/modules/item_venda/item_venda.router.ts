import { Router } from 'express'
import { authenticate } from '../../middlewares/authenticate.js'
import { requireAdmin } from '../../middlewares/requireAdmin.js'
import { ItemVendaController } from './item_venda.controller.js'

const router = Router()
const controller = new ItemVendaController()

/** Todas as rotas exigem autenticação. */
router.use(authenticate)

/** GET /itens_venda - Lista itens com paginação e filtros por venda ou produto. */
router.get('/', controller.listar)

/** GET /itens_venda/:id - Busca um item pelo ID. */
router.get('/:id', controller.buscarPorId)

/** POST /itens_venda - Cria um item e calcula o valor total. Requer ADMIN. */
router.post('/', requireAdmin, controller.criar)

/** PUT /itens_venda/:id - Atualiza parcialmente e recalcula o total. Requer ADMIN. */
router.put('/:id', requireAdmin, controller.atualizar)

/** DELETE /itens_venda/:id - Exclui fisicamente um item. Requer ADMIN. */
router.delete('/:id', requireAdmin, controller.excluir)

export default router
