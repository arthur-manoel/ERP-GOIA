import type {
  PoolConnection,
  ResultSetHeader,
  RowDataPacket,
} from 'mysql2/promise'
import db from '../../config/database.js'

export type Executor = Pick<PoolConnection, 'execute' | 'query'>

export interface OrdemRow extends RowDataPacket {
  id: number
  id_empresa: number
  numero: string
  status:
    | 'PLANEJADA'
    | 'AGUARDANDO_MATERIAL'
    | 'LIBERADA'
    | 'EM_PRODUCAO'
    | 'PAUSADA'
    | 'CONCLUIDA'
    | 'CANCELADA'
  quantidade_planejada: string
}

export interface ItemRow extends RowDataPacket {
  id: number
  id_produto: number
  produto: string
  cor: string | null
  tamanho: string
  quantidade: string
  produto_habilitado: number
}

export interface FichaRow extends RowDataPacket {
  id: number
  versao: number
  total_ativas: number
}
export interface ComponenteRow extends RowDataPacket {
  id_materia_prima: number
  quantidade: string
  materia_prima_habilitada: number
}

export interface ConsumoRow extends RowDataPacket {
  id: number
  id_ordem_producao: number
  id_ordem_producao_item: number
  id_materia_prima: number
  quantidade_por_peca: string
  quantidade_necessaria: string
  quantidade_disponivel: string
  quantidade_faltante: string
  codigo: string
  materia_prima: string
  unidade: string
}

export interface EstoqueRow extends RowDataPacket {
  id_materia_prima: number
  disponivel: string
}
export interface NecessidadeRow extends RowDataPacket {
  id_produto: number
  quantidade_consumida: string
}
export interface PedidoRow extends RowDataPacket {
  id: number
  status: string
}

const executor = (connection?: Executor): Executor => connection ?? db

export async function obterConexao(): Promise<PoolConnection> {
  return db.getConnection()
}

export async function usuarioTemAcessoEmpresa(
  usuarioId: number,
  empresaId: number,
  connection?: Executor,
): Promise<boolean> {
  const [rows] = await executor(connection).execute<RowDataPacket[]>(
    `
    SELECT 1 FROM \`usuario_empresa\`
    WHERE \`id_usuario\` = ? AND \`id_empresa\` = ? AND \`status\` = 'ATIVO'
    LIMIT 1
  `,
    [usuarioId, empresaId],
  )
  return rows.length > 0
}

export async function buscarOrdemDaEmpresa(
  ordemId: number,
  empresaId: number,
  connection?: Executor,
  bloquear = false,
): Promise<OrdemRow | null> {
  const [rows] = await executor(connection).execute<OrdemRow[]>(
    `
    SELECT \`id\`, \`id_empresa\`, \`numero\`, \`status\`, \`quantidade_planejada\`
    FROM \`ordem_producao\`
    WHERE \`id\` = ? AND \`id_empresa\` = ? LIMIT 1 ${bloquear ? 'FOR UPDATE' : ''}
  `,
    [ordemId, empresaId],
  )
  return rows[0] ?? null
}

export async function buscarItensDaOrdem(
  ordemId: number,
  empresaId: number,
  connection?: Executor,
): Promise<ItemRow[]> {
  const [rows] = await executor(connection).execute<ItemRow[]>(
    `
    SELECT oi.\`id\`, oi.\`id_produto\`, p.\`nome\` AS \`produto\`, c.\`nome\` AS \`cor\`,
      oi.\`tamanho\`, oi.\`quantidade\`, EXISTS(
        SELECT 1 FROM \`produto_empresa\` pe
        WHERE pe.\`id_empresa\` = ? AND pe.\`id_produto\` = oi.\`id_produto\` AND pe.\`status\` = 'ATIVO'
      ) AS \`produto_habilitado\`
    FROM \`ordem_producao_item\` oi
    INNER JOIN \`produtos\` p ON p.\`id\` = oi.\`id_produto\`
    LEFT JOIN \`cores\` c ON c.\`id\` = oi.\`id_cor\`
    WHERE oi.\`id_ordem_producao\` = ? ORDER BY oi.\`id\`
  `,
    [empresaId, ordemId],
  )
  return rows
}

export async function buscarFichaTecnicaAtiva(
  produtoId: number,
  empresaId: number,
  connection?: Executor,
): Promise<FichaRow | null> {
  const [rows] = await executor(connection).execute<FichaRow[]>(
    `
    SELECT ft.\`id\`, ft.\`versao\`, COUNT(*) OVER () AS \`total_ativas\`
    FROM \`ficha_tecnica\` ft
    WHERE ft.\`id_empresa\` = ? AND ft.\`id_produto\` = ? AND ft.\`status\` = 'ATIVA'
    ORDER BY ft.\`versao\` DESC, ft.\`id\` DESC LIMIT 1
  `,
    [empresaId, produtoId],
  )
  return rows[0] ?? null
}

export async function buscarComponentesDaFicha(
  fichaId: number,
  empresaId: number,
  connection?: Executor,
): Promise<ComponenteRow[]> {
  const [rows] = await executor(connection).execute<ComponenteRow[]>(
    `
    SELECT fti.\`id_produto_componente\` AS \`id_materia_prima\`, fti.\`quantidade\`, EXISTS(
      SELECT 1 FROM \`produto_empresa\` pe
      WHERE pe.\`id_empresa\` = ? AND pe.\`id_produto\` = fti.\`id_produto_componente\` AND pe.\`status\` = 'ATIVO'
    ) AS \`materia_prima_habilitada\`
    FROM \`ficha_tecnica_item\` fti WHERE fti.\`id_ficha_tecnica\` = ? ORDER BY fti.\`id\`
  `,
    [empresaId, fichaId],
  )
  return rows
}

export async function buscarPlanejamentoDaOrdem(
  ordemId: number,
  connection?: Executor,
): Promise<ConsumoRow[]> {
  const [rows] = await executor(connection).execute<ConsumoRow[]>(
    `
    SELECT cp.\`id\`, cp.\`id_ordem_producao\`, cp.\`id_ordem_producao_item\`, cp.\`id_materia_prima\`,
      cp.\`quantidade_por_peca\`, cp.\`quantidade_necessaria\`, cp.\`quantidade_disponivel\`,
      cp.\`quantidade_faltante\`, p.\`codigo\`, p.\`nome\` AS \`materia_prima\`, p.\`unidade\`
    FROM \`ordem_producao_consumo_planejado\` cp
    INNER JOIN \`produtos\` p ON p.\`id\` = cp.\`id_materia_prima\`
    WHERE cp.\`id_ordem_producao\` = ? ORDER BY cp.\`id_ordem_producao_item\`, cp.\`id\`
  `,
    [ordemId],
  )
  return rows
}

export async function buscarPlanejamentoPorIds(
  ordemId: number,
  ids: number[],
  connection: Executor,
): Promise<ConsumoRow[]> {
  if (ids.length === 0) return []
  const [rows] = await connection.query<ConsumoRow[]>(
    `
    SELECT cp.*, p.\`codigo\`, p.\`nome\` AS \`materia_prima\`, p.\`unidade\`
    FROM \`ordem_producao_consumo_planejado\` cp
    INNER JOIN \`produtos\` p ON p.\`id\` = cp.\`id_materia_prima\`
    WHERE cp.\`id_ordem_producao\` = ? AND cp.\`id\` IN (?) FOR UPDATE
  `,
    [ordemId, ids],
  )
  return rows
}

export async function bloquearEstoques(
  empresaId: number,
  materiaIds: number[],
  connection: Executor,
): Promise<void> {
  if (materiaIds.length === 0) return
  await connection.query(
    'SELECT `id` FROM `estoque` WHERE `id_empresa` = ? AND `id_produto` IN (?) FOR UPDATE',
    [empresaId, materiaIds],
  )
}

export async function buscarEstoqueDisponivelPorMaterias(
  empresaId: number,
  materiaIds: number[],
  connection?: Executor,
): Promise<EstoqueRow[]> {
  if (materiaIds.length === 0) return []
  const [rows] = await executor(connection).query<EstoqueRow[]>(
    `
    SELECT \`id_produto\` AS \`id_materia_prima\`,
      GREATEST(0, SUM(\`quantidade\` - \`quantidade_reservada\`)) AS \`disponivel\`
    FROM \`estoque\` WHERE \`id_empresa\` = ? AND \`id_produto\` IN (?) GROUP BY \`id_produto\`
  `,
    [empresaId, materiaIds],
  )
  return rows
}

export interface PlanejamentoData {
  itemId: number
  materiaPrimaId: number
  porPeca: number
  necessaria: number
  disponivel: number
  faltante: number
}

export async function substituirPlanejamento(
  ordemId: number,
  dados: PlanejamentoData[],
  connection: Executor,
): Promise<void> {
  const [existentes] = await connection.execute<
    Array<
      RowDataPacket & {
        id: number
        id_ordem_producao_item: number
        id_materia_prima: number
      }
    >
  >(
    'SELECT `id`, `id_ordem_producao_item`, `id_materia_prima` FROM `ordem_producao_consumo_planejado` WHERE `id_ordem_producao` = ? FOR UPDATE',
    [ordemId],
  )
  const chavesMantidas = new Set(
    dados.map((dado) => `${dado.itemId}:${dado.materiaPrimaId}`),
  )
  for (const dado of dados) {
    await connection.execute<ResultSetHeader>(
      `
      INSERT INTO \`ordem_producao_consumo_planejado\`
        (\`id_ordem_producao\`, \`id_ordem_producao_item\`, \`id_materia_prima\`, \`quantidade_por_peca\`, \`quantidade_necessaria\`, \`quantidade_disponivel\`, \`quantidade_faltante\`)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        \`quantidade_por_peca\` = VALUES(\`quantidade_por_peca\`),
        \`quantidade_necessaria\` = VALUES(\`quantidade_necessaria\`),
        \`quantidade_disponivel\` = VALUES(\`quantidade_disponivel\`),
        \`quantidade_faltante\` = VALUES(\`quantidade_faltante\`)
    `,
      [
        ordemId,
        dado.itemId,
        dado.materiaPrimaId,
        dado.porPeca,
        dado.necessaria,
        dado.disponivel,
        dado.faltante,
      ],
    )
  }
  const idsRemover = existentes
    .filter(
      (item) =>
        !chavesMantidas.has(
          `${item.id_ordem_producao_item}:${item.id_materia_prima}`,
        ),
    )
    .map((item) => item.id)
  if (idsRemover.length > 0) {
    await connection.query(
      'DELETE FROM `ordem_producao_consumo_planejado` WHERE `id_ordem_producao` = ? AND `id` IN (?)',
      [ordemId, idsRemover],
    )
  }
}

export async function atualizarQuantidadePlanejada(
  id: number,
  porPeca: number,
  necessaria: number,
  connection: Executor,
): Promise<void> {
  await connection.execute(
    'UPDATE `ordem_producao_consumo_planejado` SET `quantidade_por_peca` = ?, `quantidade_necessaria` = ? WHERE `id` = ?',
    [porPeca, necessaria, id],
  )
}

export async function atualizarDisponibilidade(
  id: number,
  disponivel: number,
  faltante: number,
  connection: Executor,
): Promise<void> {
  await connection.execute(
    'UPDATE `ordem_producao_consumo_planejado` SET `quantidade_disponivel` = ?, `quantidade_faltante` = ? WHERE `id` = ?',
    [disponivel, faltante, id],
  )
}

export async function buscarNecessidades(
  ordemId: number,
  connection: Executor,
): Promise<NecessidadeRow[]> {
  const [rows] = await connection.execute<NecessidadeRow[]>(
    'SELECT `id_produto`, `quantidade_consumida` FROM `necessidade_producao` WHERE `id_ordem_producao` = ? FOR UPDATE',
    [ordemId],
  )
  return rows
}

export async function sincronizarNecessidades(
  ordemId: number,
  totais: Map<number, { necessaria: number; reservada: number }>,
  connection: Executor,
): Promise<void> {
  const existentes = await buscarNecessidades(ordemId, connection)
  const consumido = new Map(
    existentes.map((item) => [
      item.id_produto,
      Number(item.quantidade_consumida),
    ]),
  )
  const idsExistentes = new Set(existentes.map((item) => item.id_produto))
  for (const [materiaId, total] of totais) {
    const quantidadeConsumida = consumido.get(materiaId) ?? 0
    const status =
      quantidadeConsumida >= total.necessaria
        ? 'CONSUMIDA'
        : total.reservada >= total.necessaria
          ? 'RESERVADA'
          : total.reservada > 0 || quantidadeConsumida > 0
            ? 'PARCIAL'
            : 'PENDENTE'
    if (idsExistentes.has(materiaId)) {
      await connection.execute(
        'UPDATE `necessidade_producao` SET `quantidade_necessaria` = ?, `quantidade_reservada` = ?, `status` = ? WHERE `id_ordem_producao` = ? AND `id_produto` = ?',
        [total.necessaria, total.reservada, status, ordemId, materiaId],
      )
    } else {
      await connection.execute(
        'INSERT INTO `necessidade_producao` (`id_ordem_producao`, `id_produto`, `quantidade_necessaria`, `quantidade_reservada`, `quantidade_consumida`, `status`) VALUES (?, ?, ?, ?, 0, ?)',
        [ordemId, materiaId, total.necessaria, total.reservada, status],
      )
    }
  }
  const manter = [...totais.keys()]
  if (manter.length > 0) {
    await connection.query(
      'DELETE FROM `necessidade_producao` WHERE `id_ordem_producao` = ? AND `id_produto` NOT IN (?) AND `quantidade_consumida` = 0',
      [ordemId, manter],
    )
    await connection.query(
      "UPDATE `necessidade_producao` SET `quantidade_necessaria` = `quantidade_consumida`, `quantidade_reservada` = 0, `status` = 'CANCELADA' WHERE `id_ordem_producao` = ? AND `id_produto` NOT IN (?)",
      [ordemId, manter],
    )
  } else {
    await connection.execute(
      'DELETE FROM `necessidade_producao` WHERE `id_ordem_producao` = ? AND `quantidade_consumida` = 0',
      [ordemId],
    )
    await connection.execute(
      "UPDATE `necessidade_producao` SET `quantidade_necessaria` = `quantidade_consumida`, `quantidade_reservada` = 0, `status` = 'CANCELADA' WHERE `id_ordem_producao` = ?",
      [ordemId],
    )
  }
}

export async function atualizarStatusDaOrdem(
  ordemId: number,
  status: 'LIBERADA' | 'AGUARDANDO_MATERIAL',
  connection: Executor,
): Promise<void> {
  await connection.execute(
    "UPDATE `ordem_producao` SET `status` = ? WHERE `id` = ? AND `status` NOT IN ('CONCLUIDA', 'CANCELADA')",
    [status, ordemId],
  )
}

export async function buscarPedidoAutomaticoDaOrdem(
  ordemId: number,
  connection: Executor,
): Promise<PedidoRow | null> {
  const [rows] = await connection.execute<PedidoRow[]>(
    "SELECT `id`, `status` FROM `pedido_compra` WHERE `id_ordem_producao` = ? AND `observacao` LIKE 'Gerado automaticamente pelo consumo planejado%' LIMIT 1 FOR UPDATE",
    [ordemId],
  )
  return rows[0] ?? null
}

export async function excluirPlanejamento(
  ordemId: number,
  connection: Executor,
): Promise<void> {
  await connection.execute(
    'DELETE FROM `ordem_producao_consumo_planejado` WHERE `id_ordem_producao` = ?',
    [ordemId],
  )
}

export async function excluirNecessidadesSemConsumo(
  ordemId: number,
  connection: Executor,
): Promise<void> {
  await connection.execute(
    'DELETE FROM `necessidade_producao` WHERE `id_ordem_producao` = ? AND `quantidade_consumida` = 0',
    [ordemId],
  )
}
