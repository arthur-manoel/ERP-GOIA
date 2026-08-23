import { Router } from 'express'
import { authenticate } from '../../middlewares/authenticate.js'
import {
  consultar,
  editar,
  editarLote,
  excluir,
  recalcular,
} from './consumoPlanejado.controller.js'

const router = Router({ mergeParams: true })

// Todas as rotas exigem ?empresaId=<id>; o vínculo ativo do usuário é validado no serviço.
router.get('/', authenticate, consultar)
// Recria integralmente os valores a partir da ficha técnica e descarta edições manuais.
router.post('/recalcular', authenticate, recalcular)
// Preserva o total informado e recalcula quantidade por peça, estoque, necessidade e status.
router.patch('/:consumoId', authenticate, editar)
// Aplica todas as edições manuais em uma única transação.
router.put('/', authenticate, editarLote)
// Exclui todo o planejamento; não existe exclusão de componente individual.
router.delete('/', authenticate, excluir)

export default router
