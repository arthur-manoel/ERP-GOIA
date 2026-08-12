import { Router } from 'express';

import {
    NotaFiscalController
} from './././nota-fiscal.controller.js';


const router = Router();

const controller =
    new NotaFiscalController();


router.post(
    '/',
    controller.criar
);


router.get(
    '/empresa/:idEmpresa',
    controller.listarPorEmpresa
);


router.get(
    '/:id',
    controller.buscarPorId
);


router.post(
    '/:id/itens',
    controller.adicionarItem
);


router.put(
    '/:id/entregar',
    controller.entregar
);


router.delete(
    '/:id',
    controller.excluir
);


export default router;