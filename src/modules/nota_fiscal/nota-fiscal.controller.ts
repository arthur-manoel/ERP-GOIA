import { Request, Response } from 'express';

import {
    NotaFiscalService
} from './././nota-fiscal.service.js';


export class NotaFiscalController {

    private service: NotaFiscalService;


    constructor() {

        this.service =
            new NotaFiscalService();

    }


    criar = async (
        req: Request,
        res: Response
    ) => {

        try {

            const nota =
                await this.service.criar(req.body);


            return res
                .status(201)
                .json(nota);

        } catch (error) {

            return res
                .status(400)
                .json({
                    mensagem:
                        error instanceof Error
                            ? error.message
                            : 'Erro ao criar nota fiscal'
                });
        }
    };


    buscarPorId = async (
        req: Request,
        res: Response
    ) => {

        try {

            const id =
                Number(req.params.id);


            const nota =
                await this.service.buscarPorId(id);


            return res
                .status(200)
                .json(nota);

        } catch (error) {

            return res
                .status(404)
                .json({
                    mensagem:
                        error instanceof Error
                            ? error.message
                            : 'Nota fiscal nao encontrada'
                });
        }
    };


    listarPorEmpresa = async (
        req: Request,
        res: Response
    ) => {

        try {

            const idEmpresa =
                Number(req.params.idEmpresa);


            const notas =
                await this.service
                    .listarPorEmpresa(idEmpresa);


            return res
                .status(200)
                .json(notas);

        } catch (error) {

            return res
                .status(400)
                .json({
                    mensagem:
                        error instanceof Error
                            ? error.message
                            : 'Erro ao listar notas fiscais'
                });
        }
    };


    adicionarItem = async (
        req: Request,
        res: Response
    ) => {

        try {

            const idNota =
                Number(req.params.id);


            const nota =
                await this.service.adicionarItem(
                    idNota,
                    req.body
                );


            return res
                .status(201)
                .json(nota);

        } catch (error) {

            return res
                .status(400)
                .json({
                    mensagem:
                        error instanceof Error
                            ? error.message
                            : 'Erro ao adicionar item'
                });
        }
    };


    entregar = async (
        req: Request,
        res: Response
    ) => {

        try {

            const idNota =
                Number(req.params.id);


            /*
             * Temporariamente pegamos o ID
             * do usuário pelo body.
             *
             * Depois, com autenticação JWT,
             * o ideal será pegar do req.user.
             */

            const idUsuario =
                Number(req.body.id_usuario);


            const nota =
                await this.service.entregar(
                    idNota,
                    idUsuario
                );


            return res
                .status(200)
                .json({
                    mensagem:
                        'Nota fiscal entregue e estoque atualizado',
                    nota
                });

        } catch (error) {

            return res
                .status(400)
                .json({
                    mensagem:
                        error instanceof Error
                            ? error.message
                            : 'Erro ao entregar nota fiscal'
                });
        }
    };


    excluir = async (
        req: Request,
        res: Response
    ) => {

        try {

            const id =
                Number(req.params.id);


            await this.service.excluir(id);


            return res
                .status(204)
                .send();

        } catch (error) {

            return res
                .status(400)
                .json({
                    mensagem:
                        error instanceof Error
                            ? error.message
                            : 'Erro ao excluir nota fiscal'
                });
        }
    };
}