import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';

import db from '../../config/database.js';

import {
    CriarNotaFiscalDTO
} from './././nota-fiscal.types.js';

import {
    NotaFiscalModel
} from './././nota-fiscal.model.js';


export class NotaFiscalRepository {

    async criar(
        dados: CriarNotaFiscalDTO
    ): Promise<number> {

        const [resultado] = await db.execute<ResultSetHeader>(
            `
            INSERT INTO nota_fiscal (
                numero,
                serie,
                chave_acesso,
                tipo,
                data_emissao,
                valor_total,
                id_empresa,
                id_fornecedor
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                dados.numero,
                dados.serie || null,
                dados.chave_acesso || null,
                dados.tipo || 'ENTRADA',
                dados.data_emissao || null,
                dados.valor_total || 0,
                dados.id_empresa,
                dados.id_fornecedor || null
            ]
        );

        return resultado.insertId;
    }


    async buscarPorId(
        id: number
    ): Promise<NotaFiscalModel | null> {

        const [rows] = await db.execute<RowDataPacket[]>(
            `
            SELECT
                id,
                numero,
                serie,
                chave_acesso,
                tipo,
                status,
                estoque_processado,
                data_emissao,
                data_entrega,
                valor_total,
                id_empresa,
                id_fornecedor,
                data_cadastro

            FROM nota_fiscal

            WHERE id = ?
            `,
            [id]
        );

        if (rows.length === 0) {
            return null;
        }

        return rows[0] as NotaFiscalModel;
    }


    async listarPorEmpresa(
        idEmpresa: number
    ): Promise<NotaFiscalModel[]> {

        const [rows] = await db.execute<RowDataPacket[]>(
            `
            SELECT
                id,
                numero,
                serie,
                chave_acesso,
                tipo,
                status,
                estoque_processado,
                data_emissao,
                data_entrega,
                valor_total,
                id_empresa,
                id_fornecedor,
                data_cadastro

            FROM nota_fiscal

            WHERE id_empresa = ?

            ORDER BY id DESC
            `,
            [idEmpresa]
        );

        return rows as NotaFiscalModel[];
    }


    async atualizarStatus(
        id: number,
        status: string
    ): Promise<void> {

        await db.execute(
            `
            UPDATE nota_fiscal

            SET status = ?

            WHERE id = ?
            `,
            [
                status,
                id
            ]
        );
    }


    async adicionarItem(
        idNota: number,
        codigo: string,
        nome: string,
        descricao: string | null,
        idCategoria: number,
        idModelo: number,
        idCor: number,
        idTamanho: number,
        quantidade: number,
        valorUnitario: number
    ): Promise<void> {

        await db.query(
            `
            CALL adicionar_item_nota(
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
            )
            `,
            [
                idNota,
                codigo,
                nome,
                descricao,
                idCategoria,
                idModelo,
                idCor,
                idTamanho,
                quantidade,
                valorUnitario
            ]
        );
    }


    async entregar(
        idNota: number,
        idUsuario: number
    ): Promise<void> {

        await db.query(
            `
            CALL entregar_nota_fiscal(?, ?)
            `,
            [
                idNota,
                idUsuario
            ]
        );
    }


    async excluir(
        id: number
    ): Promise<void> {

        await db.execute(
            `
            DELETE FROM nota_fiscal

            WHERE id = ?
            `,
            [id]
        );
    }
}