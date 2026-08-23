import { z } from 'zod'

export const createOrdemProducaoSchema =
  z.object({
    id_empresa: z.coerce
      .number()
      .int()
      .positive(),

    id_local_estoque: z.coerce
      .number()
      .int()
      .positive(),

    id_usuario: z.coerce
      .number()
      .int()
      .positive(),

    id_setor: z.coerce
      .number()
      .int()
      .positive(),

    numero: z.string()
      .trim()
      .min(
        1,
        'O número da ordem é obrigatório'
      ),

    status: z.enum([
      'ABERTA',
      'EM_ANDAMENTO',
      'CONCLUIDA',
      'CANCELADA',
    ]),

    data_inicio: z.string()
      .min(
        1,
        'A data de início é obrigatória'
      ),

    data_previsao: z.string()
      .min(
        1,
        'A data de previsão é obrigatória'
      ),

    observacao: z
      .string()
      .nullable()
      .optional(),
  })

export const updateOrdemProducaoSchema =
  z.object({
    id_empresa: z.coerce
      .number()
      .int()
      .positive()
      .optional(),

    id_local_estoque: z.coerce
      .number()
      .int()
      .positive()
      .optional(),

    id_usuario: z.coerce
      .number()
      .int()
      .positive()
      .optional(),

    id_setor: z.coerce
      .number()
      .int()
      .positive()
      .optional(),

    status: z.enum([
      'ABERTA',
      'EM_ANDAMENTO',
      'CONCLUIDA',
      'CANCELADA',
    ]).optional(),

    data_inicio: z.string()
      .min(1)
      .optional(),

    data_previsao: z.string()
      .min(1)
      .optional(),

    observacao: z
      .string()
      .nullable()
      .optional(),
  })

export const ordemProducaoIdSchema =
  z.object({
    id: z.coerce
      .number()
      .int()
      .positive(),
  })

export const listOrdemProducaoSchema =
  z.object({
    page: z.coerce
      .number()
      .int()
      .positive()
      .default(1),

    limit: z.coerce
      .number()
      .int()
      .positive()
      .max(100)
      .default(20),

    idEmpresa: z.coerce
      .number()
      .int()
      .positive()
      .optional(),

    idSetor: z.coerce
      .number()
      .int()
      .positive()
      .optional(),

    status: z.enum([
      'ABERTA',
      'EM_ANDAMENTO',
      'CONCLUIDA',
      'CANCELADA',
    ]).optional(),

    dataInicioDe: z.string()
      .optional(),

    dataInicioAte: z.string()
      .optional(),
  })