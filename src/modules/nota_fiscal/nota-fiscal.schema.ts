import { z } from 'zod';

export const criarNotaFiscalSchema = z.object({
    numero: z.string().min(1),

    serie: z.string().optional(),

    chave_acesso: z
        .string()
        .length(44)
        .optional(),

    tipo: z
        .enum(['ENTRADA', 'SAIDA'])
        .default('ENTRADA'),

    data_emissao: z
        .string()
        .optional(),

    valor_total: z
        .number()
        .min(0)
        .default(0),

    id_empresa: z
        .number()
        .int()
        .positive(),

    id_fornecedor: z
        .number()
        .int()
        .positive()
        .optional()
});


export const adicionarItemNotaSchema = z.object({
    codigo: z
        .string()
        .min(1),

    nome: z
        .string()
        .min(1),

    descricao: z
        .string()
        .optional(),

    id_categoria: z
        .number()
        .int()
        .positive(),

    id_modelo: z
        .number()
        .int()
        .positive(),

    id_cor: z
        .number()
        .int()
        .positive(),

    id_tamanho: z
        .number()
        .int()
        .positive(),

    quantidade: z
        .number()
        .positive(),

    valor_unitario: z
        .number()
        .min(0)
});


export const entregarNotaFiscalSchema = z.object({
    id_usuario: z
        .number()
        .int()
        .positive()
});