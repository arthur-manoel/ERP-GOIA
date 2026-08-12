import {
    CriarNotaFiscalDTO,
    AdicionarItemNotaFiscalDTO
} from './././nota-fiscal.types.js';

import {
    NotaFiscalRepository
} from './././nota-fiscal.repository.js';


export class NotaFiscalService {

    private repository: NotaFiscalRepository;


    constructor() {

        this.repository =
            new NotaFiscalRepository();

    }


    async criar(
        dados: CriarNotaFiscalDTO
    ) {

        if (!dados.numero) {

            throw new Error(
                'O numero da nota fiscal e obrigatorio'
            );
        }


        if (!dados.id_empresa) {

            throw new Error(
                'A empresa da nota fiscal e obrigatoria'
            );
        }


        if (dados.valor_total !== undefined) {

            if (dados.valor_total < 0) {

                throw new Error(
                    'O valor total nao pode ser negativo'
                );
            }
        }


        const id =
            await this.repository.criar(dados);


        return this.repository.buscarPorId(id);
    }


    async buscarPorId(
        id: number
    ) {

        const nota =
            await this.repository.buscarPorId(id);


        if (!nota) {

            throw new Error(
                'Nota fiscal nao encontrada'
            );
        }


        return nota;
    }


    async listarPorEmpresa(
        idEmpresa: number
    ) {

        if (!idEmpresa) {

            throw new Error(
                'Empresa nao informada'
            );
        }


        return this.repository
            .listarPorEmpresa(idEmpresa);
    }


    async adicionarItem(
        idNota: number,
        dados: AdicionarItemNotaFiscalDTO
    ) {

        if (!dados.codigo) {

            throw new Error(
                'O codigo do produto e obrigatorio'
            );
        }


        if (!dados.nome) {

            throw new Error(
                'O nome do produto e obrigatorio'
            );
        }


        if (dados.quantidade <= 0) {

            throw new Error(
                'A quantidade deve ser maior que zero'
            );
        }


        if (dados.valor_unitario < 0) {

            throw new Error(
                'O valor unitario nao pode ser negativo'
            );
        }


        await this.repository.adicionarItem(

            idNota,

            dados.codigo,

            dados.nome,

            dados.descricao || null,

            dados.id_categoria,

            dados.id_modelo,

            dados.id_cor,

            dados.id_tamanho,

            dados.quantidade,

            dados.valor_unitario

        );


        return this.repository.buscarPorId(idNota);
    }


    async entregar(
        idNota: number,
        idUsuario: number
    ) {

        const nota =
            await this.repository.buscarPorId(idNota);


        if (!nota) {

            throw new Error(
                'Nota fiscal nao encontrada'
            );
        }


        if (nota.status === 'CANCELADA') {

            throw new Error(
                'Nao e possivel entregar uma NF cancelada'
            );
        }


        if (nota.estoque_processado === 1) {

            throw new Error(
                'O estoque desta NF ja foi processado'
            );
        }


        await this.repository.entregar(
            idNota,
            idUsuario
        );


        return this.repository.buscarPorId(idNota);
    }


    async excluir(
        id: number
    ) {

        const nota =
            await this.repository.buscarPorId(id);


        if (!nota) {

            throw new Error(
                'Nota fiscal nao encontrada'
            );
        }


        if (nota.status === 'ENTREGUE') {

            throw new Error(
                'Nao e possivel excluir uma NF entregue'
            );
        }


        await this.repository.excluir(id);
    }
}