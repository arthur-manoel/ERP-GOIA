import { Router } from 'express'
import { authenticate } from '../../middlewares/authenticate.js'
import { requireAdmin } from '../../middlewares/requireAdmin.js'
import { RequisicaoCompraController } from './requisicao_compra.controller.js'

const router = Router()
const controller = new RequisicaoCompraController()

/** Todas as rotas exigem autenticação. */
router.use(authenticate)

/** GET /requisicoes_compra - Lista requisições com paginação e filtros. */
router.get('/', controller.listar)

/** GET /requisicoes_compra/:id - Busca uma requisição pelo ID. */
router.get('/:id', controller.buscarPorId)

/** POST /requisicoes_compra - Cria uma requisição. Requer ADMIN. */
router.post('/', requireAdmin, controller.criar)

/** PUT /requisicoes_compra/:id - Atualiza parcialmente uma requisição. Requer ADMIN. */
router.put('/:id', requireAdmin, controller.atualizar)

/** DELETE /requisicoes_compra/:id - Cancela logicamente uma requisição. Requer ADMIN. */
router.delete('/:id', requireAdmin, controller.cancelar)

export default router
