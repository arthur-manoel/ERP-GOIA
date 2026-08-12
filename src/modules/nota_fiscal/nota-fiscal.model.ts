export interface NotaFiscalModel {
    id: number;

    numero: string;

    serie: string | null;

    chave_acesso: string | null;

    tipo: string;

    status: string;

    estoque_processado: number;

    data_emissao: Date | null;

    data_entrega: Date | null;

    valor_total: number;

    id_empresa: number;

    id_fornecedor: number | null;

    data_cadastro: Date;
}