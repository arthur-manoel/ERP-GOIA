export type NotaFiscalTipo = 'ENTRADA' | 'SAIDA';

export type NotaFiscalStatus =
    | 'PENDENTE'
    | 'EM_TRANSITO'
    | 'ENTREGUE'
    | 'CANCELADA';


export interface NotaFiscal {
    id: number;

    numero: string;

    serie: string | null;

    chave_acesso: string | null;

    tipo: NotaFiscalTipo;

    status: NotaFiscalStatus;

    estoque_processado: number;

    data_emissao: Date | null;

    data_entrega: Date | null;

    valor_total: number;

    id_empresa: number;

    id_fornecedor: number | null;

    data_cadastro: Date;
}


export interface CriarNotaFiscalDTO {
    numero: string;

    serie?: string;

    chave_acesso?: string;

    tipo?: NotaFiscalTipo;

    data_emissao?: string;

    valor_total?: number;

    id_empresa: number;

    id_fornecedor?: number;
}


export interface AdicionarItemNotaFiscalDTO {
    codigo: string;

    nome: string;

    descricao?: string;

    id_categoria: number;

    id_modelo: number;

    id_cor: number;

    id_tamanho: number;

    quantidade: number;

    valor_unitario: number;
}