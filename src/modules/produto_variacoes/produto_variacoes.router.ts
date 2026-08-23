import { Router } from 'express'
import { authenticate } from '../../middlewares/authenticate.js'
import { requireAdmin } from '../../middlewares/requireAdmin.js'
import { ProdutoVariacoesController } from './produto_variacoes.controller.js'

const router = Router()
const controller = new ProdutoVariacoesController()

/** Todas as rotas exigem autenticação. */
router.use(authenticate)
/** GET /produto_variacoes - Lista variações com paginação e filtros. */
router.get('/', controller.listar)
/** GET /produto_variacoes/:id - Busca uma variação pelo ID. */
router.get('/:id', controller.buscarPorId)
/** POST /produto_variacoes - Cria uma variação. Requer ADMIN. */
router.post('/', requireAdmin, controller.criar)
/** PUT /produto_variacoes/:id - Atualiza parcialmente uma variação. Requer ADMIN. */
router.put('/:id', requireAdmin, controller.atualizar)
/** DELETE /produto_variacoes/:id - Inativa logicamente uma variação. Requer ADMIN. */
router.delete('/:id', requireAdmin, controller.inativar)

export default router
