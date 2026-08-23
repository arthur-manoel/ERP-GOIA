import type { PoolConnection } from 'mysql2/promise'
import {
  atualizarDisponibilidade,
  atualizarQuantidadePlanejada,
  atualizarStatusDaOrdem,
  bloquearEstoques,
  buscarComponentesDaFicha,
  buscarEstoqueDisponivelPorMaterias,
  buscarFichaTecnicaAtiva,
  buscarItensDaOrdem,
  buscarOrdemDaEmpresa,
  buscarPedidoAutomaticoDaOrdem,
  buscarPlanejamentoDaOrdem,
  buscarPlanejamentoPorIds,
  excluirNecessidadesSemConsumo,
  excluirPlanejamento,
  obterConexao,
  substituirPlanejamento,
  sincronizarNecessidades,
  usuarioTemAcessoEmpresa,
} from './consumoPlanejado.repository.js'
import type {
  ConsumoRow,
  ItemRow,
  OrdemRow,
  PlanejamentoData,
} from './consumoPlanejado.repository.js'

interface UsuarioAutenticado {
  id: number
  nivel_acesso: 'ADMIN' | 'USUARIO'
}
interface Edicao {
  id: number
  quantidadeNecessaria: number
}

function httpError(
  message: string,
  statusCode: number,
): Error & { statusCode: number } {
  const error = new Error(message) as Error & { statusCode: number }
  error.statusCode = statusCode
  return error
}

export function arredondarDecimal(value: number): number {
  return Math.round((value + Number.EPSILON) * 1000) / 1000
}

export function distribuirEstoque<
  T extends {
    id: number
    materiaPrimaId: number
    quantidadeNecessaria: number
  },
>(
  linhas: T[],
  saldos: Map<number, number>,
): Array<T & { quantidadeDisponivel: number; quantidadeFaltante: number }> {
  const restantes = new Map(saldos)
  return linhas.map((linha) => {
    const restante = Math.max(0, restantes.get(linha.materiaPrimaId) ?? 0)
    const disponivel = arredondarDecimal(
      Math.min(linha.quantidadeNecessaria, restante),
    )
    restantes.set(
      linha.materiaPrimaId,
      arredondarDecimal(restante - disponivel),
    )
    return {
      ...linha,
      quantidadeDisponivel: disponivel,
      quantidadeFaltante: arredondarDecimal(
        Math.max(0, linha.quantidadeNecessaria - disponivel),
      ),
    }
  })
}

async function autorizar(
  usuario: UsuarioAutenticado,
  empresaId: number,
  connection?: PoolConnection,
): Promise<void> {
  if (usuario.nivel_acesso === 'ADMIN') return
  if (!(await usuarioTemAcessoEmpresa(usuario.id, empresaId, connection))) {
    throw httpError('Usuário sem permissão para acessar esta empresa', 403)
  }
}

function validarEstado(ordem: OrdemRow): void {
  if (ordem.status === 'CONCLUIDA' || ordem.status === 'CANCELADA') {
    throw httpError(
      `Não é permitido alterar o consumo de uma ordem ${ordem.status.toLowerCase()}`,
      409,
    )
  }
}

async function obterOrdem(
  ordemId: number,
  empresaId: number,
  usuario: UsuarioAutenticado,
  connection?: PoolConnection,
  bloquear = false,
): Promise<OrdemRow> {
  await autorizar(usuario, empresaId, connection)
  const ordem = await buscarOrdemDaEmpresa(
    ordemId,
    empresaId,
    connection,
    bloquear,
  )
  if (!ordem)
    throw httpError('Ordem de produção não encontrada para esta empresa', 404)
  return ordem
}

async function validarFichaDoItem(
  item: ItemRow,
  empresaId: number,
  connection: PoolConnection,
) {
  if (!item.produto_habilitado)
    throw httpError(
      `O produto do item ${item.id} não está habilitado para a empresa`,
      403,
    )
  if (Number(item.quantidade) <= 0)
    throw httpError(
      `O item ${item.id} possui quantidade planejada inválida`,
      400,
    )
  const ficha = await buscarFichaTecnicaAtiva(
    item.id_produto,
    empresaId,
    connection,
  )
  if (!ficha)
    throw httpError(
      `O produto ${item.produto} não possui ficha técnica ativa`,
      400,
    )
  if (Number(ficha.total_ativas) > 1)
    throw httpError(
      `O produto ${item.produto} possui mais de uma ficha técnica ativa`,
      409,
    )
  const componentes = await buscarComponentesDaFicha(
    ficha.id,
    empresaId,
    connection,
  )
  if (componentes.length === 0)
    throw httpError(
      `A ficha técnica ativa do produto ${item.produto} não possui componentes`,
      400,
    )
  for (const componente of componentes) {
    if (!componente.materia_prima_habilitada)
      throw httpError(
        `A matéria-prima ${componente.id_materia_prima} não está habilitada para a empresa`,
        403,
      )
    if (Number(componente.quantidade) <= 0)
      throw httpError(
        `A ficha técnica contém quantidade inválida para a matéria-prima ${componente.id_materia_prima}`,
        400,
      )
  }
  return componentes
}

function consolidar(
  linhas: Array<{
    materiaPrimaId: number
    quantidadeNecessaria: number
    quantidadeDisponivel: number
  }>,
): Map<number, { necessaria: number; reservada: number }> {
  const totais = new Map<number, { necessaria: number; reservada: number }>()
  for (const linha of linhas) {
    const atual = totais.get(linha.materiaPrimaId) ?? {
      necessaria: 0,
      reservada: 0,
    }
    atual.necessaria = arredondarDecimal(
      atual.necessaria + linha.quantidadeNecessaria,
    )
    atual.reservada = arredondarDecimal(
      atual.reservada + linha.quantidadeDisponivel,
    )
    totais.set(linha.materiaPrimaId, atual)
  }
  return totais
}

async function recalcularDisponibilidade(
  ordemId: number,
  empresaId: number,
  connection: PoolConnection,
): Promise<void> {
  const consumos = await buscarPlanejamentoDaOrdem(ordemId, connection)
  const materiaIds = [...new Set(consumos.map((item) => item.id_materia_prima))]
  await bloquearEstoques(empresaId, materiaIds, connection)
  const estoques = await buscarEstoqueDisponivelPorMaterias(
    empresaId,
    materiaIds,
    connection,
  )
  const distribuidos = distribuirEstoque(
    consumos.map((item) => ({
      id: item.id,
      materiaPrimaId: item.id_materia_prima,
      quantidadeNecessaria: Number(item.quantidade_necessaria),
    })),
    new Map(
      estoques.map((item) => [item.id_materia_prima, Number(item.disponivel)]),
    ),
  )
  for (const item of distribuidos)
    await atualizarDisponibilidade(
      item.id,
      item.quantidadeDisponivel,
      item.quantidadeFaltante,
      connection,
    )
  await sincronizarNecessidades(ordemId, consolidar(distribuidos), connection)
  await atualizarStatusDaOrdem(
    ordemId,
    distribuidos.some((item) => item.quantidadeFaltante > 0)
      ? 'AGUARDANDO_MATERIAL'
      : 'LIBERADA',
    connection,
  )
}

function validarPedidoCompra(gerarPedidoCompra: boolean): void {
  if (gerarPedidoCompra)
    throw httpError(
      'A geração automática de pedido de compra não está disponível: o projeto não possui regra para selecionar o fornecedor da matéria-prima',
      400,
    )
}

async function emTransacao<T>(
  callback: (connection: PoolConnection) => Promise<T>,
): Promise<T> {
  const connection = await obterConexao()
  try {
    await connection.beginTransaction()
    const result = await callback(connection)
    await connection.commit()
    return result
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

function numero(value: string): number {
  return Number(value)
}

async function montarResposta(
  ordemId: number,
  empresaId: number,
  usuario: UsuarioAutenticado,
) {
  const ordem = await obterOrdem(ordemId, empresaId, usuario)
  const itens = await buscarItensDaOrdem(ordemId, empresaId)
  const consumos = await buscarPlanejamentoDaOrdem(ordemId)
  const porItem = new Map<number, ConsumoRow[]>()
  consumos.forEach((consumo) =>
    porItem.set(consumo.id_ordem_producao_item, [
      ...(porItem.get(consumo.id_ordem_producao_item) ?? []),
      consumo,
    ]),
  )
  const totais = new Map<
    number,
    {
      materiaPrimaId: number
      materiaPrima: string
      unidade: string
      quantidadeNecessaria: number
      quantidadeDisponivel: number
      quantidadeFaltante: number
    }
  >()
  consumos.forEach((consumo) => {
    const atual = totais.get(consumo.id_materia_prima) ?? {
      materiaPrimaId: consumo.id_materia_prima,
      materiaPrima: consumo.materia_prima,
      unidade: consumo.unidade,
      quantidadeNecessaria: 0,
      quantidadeDisponivel: 0,
      quantidadeFaltante: 0,
    }
    atual.quantidadeNecessaria = arredondarDecimal(
      atual.quantidadeNecessaria + numero(consumo.quantidade_necessaria),
    )
    atual.quantidadeDisponivel = arredondarDecimal(
      atual.quantidadeDisponivel + numero(consumo.quantidade_disponivel),
    )
    atual.quantidadeFaltante = arredondarDecimal(
      atual.quantidadeFaltante + numero(consumo.quantidade_faltante),
    )
    totais.set(consumo.id_materia_prima, atual)
  })
  return {
    ordemId: ordem.id,
    numero: ordem.numero,
    status: ordem.status.toLowerCase(),
    quantidadePlanejada: numero(ordem.quantidade_planejada),
    itens: itens.map((item) => ({
      itemId: item.id,
      produtoId: item.id_produto,
      produto: item.produto,
      cor: item.cor,
      tamanho: item.tamanho,
      quantidade: numero(item.quantidade),
      materiasPrimas: (porItem.get(item.id) ?? []).map((consumo) => ({
        id: consumo.id,
        materiaPrimaId: consumo.id_materia_prima,
        codigo: consumo.codigo,
        materiaPrima: consumo.materia_prima,
        unidade: consumo.unidade,
        quantidadePorPeca: numero(consumo.quantidade_por_peca),
        quantidadeNecessaria: numero(consumo.quantidade_necessaria),
        quantidadeDisponivel: numero(consumo.quantidade_disponivel),
        quantidadeFaltante: numero(consumo.quantidade_faltante),
      })),
    })),
    totais: [...totais.values()],
  }
}

export async function consultarPlanejamento(
  ordemId: number,
  empresaId: number,
  usuario: UsuarioAutenticado,
) {
  return montarResposta(ordemId, empresaId, usuario)
}

export async function recalcularPlanejamento(
  ordemId: number,
  empresaId: number,
  usuario: UsuarioAutenticado,
  gerarPedidoCompra: boolean,
) {
  validarPedidoCompra(gerarPedidoCompra)
  await emTransacao(async (connection) => {
    const ordem = await obterOrdem(
      ordemId,
      empresaId,
      usuario,
      connection,
      true,
    )
    validarEstado(ordem)
    const itens = await buscarItensDaOrdem(ordemId, empresaId, connection)
    if (itens.length === 0)
      throw httpError('A ordem de produção não possui itens', 400)
    const base: Array<{
      id: number
      materiaPrimaId: number
      quantidadeNecessaria: number
      quantidadePorPeca: number
    }> = []
    for (const item of itens) {
      const componentes = await validarFichaDoItem(item, empresaId, connection)
      const agrupados = new Map<number, number>()
      componentes.forEach((componente) =>
        agrupados.set(
          componente.id_materia_prima,
          arredondarDecimal(
            (agrupados.get(componente.id_materia_prima) ?? 0) +
              Number(componente.quantidade),
          ),
        ),
      )
      agrupados.forEach((porPeca, materiaPrimaId) =>
        base.push({
          id: item.id,
          materiaPrimaId,
          quantidadePorPeca: porPeca,
          quantidadeNecessaria: arredondarDecimal(
            porPeca * Number(item.quantidade),
          ),
        }),
      )
    }
    const materiaIds = [...new Set(base.map((item) => item.materiaPrimaId))]
    await bloquearEstoques(empresaId, materiaIds, connection)
    const estoques = await buscarEstoqueDisponivelPorMaterias(
      empresaId,
      materiaIds,
      connection,
    )
    const distribuidos = distribuirEstoque(
      base.map((item) => ({
        id: item.id,
        materiaPrimaId: item.materiaPrimaId,
        quantidadeNecessaria: item.quantidadeNecessaria,
        quantidadePorPeca: item.quantidadePorPeca,
      })),
      new Map(
        estoques.map((item) => [
          item.id_materia_prima,
          Number(item.disponivel),
        ]),
      ),
    )
    const dados: PlanejamentoData[] = distribuidos.map((item) => ({
      itemId: item.id,
      materiaPrimaId: item.materiaPrimaId,
      porPeca: item.quantidadePorPeca,
      necessaria: item.quantidadeNecessaria,
      disponivel: item.quantidadeDisponivel,
      faltante: item.quantidadeFaltante,
    }))
    await substituirPlanejamento(ordemId, dados, connection)
    await sincronizarNecessidades(ordemId, consolidar(distribuidos), connection)
    await atualizarStatusDaOrdem(
      ordemId,
      distribuidos.some((item) => item.quantidadeFaltante > 0)
        ? 'AGUARDANDO_MATERIAL'
        : 'LIBERADA',
      connection,
    )
  })
  return montarResposta(ordemId, empresaId, usuario)
}

export async function editarConsumos(
  ordemId: number,
  empresaId: number,
  usuario: UsuarioAutenticado,
  edicoes: Edicao[],
  gerarPedidoCompra: boolean,
) {
  validarPedidoCompra(gerarPedidoCompra)
  await emTransacao(async (connection) => {
    const ordem = await obterOrdem(
      ordemId,
      empresaId,
      usuario,
      connection,
      true,
    )
    validarEstado(ordem)
    const consumos = await buscarPlanejamentoPorIds(
      ordemId,
      edicoes.map((item) => item.id),
      connection,
    )
    if (consumos.length !== edicoes.length)
      throw httpError(
        'Um ou mais consumos não pertencem à ordem ou não foram encontrados',
        404,
      )
    const itens = await buscarItensDaOrdem(ordemId, empresaId, connection)
    const itensPorId = new Map(itens.map((item) => [item.id, item]))
    for (const edicao of edicoes) {
      const consumo = consumos.find((item) => item.id === edicao.id)!
      const item = itensPorId.get(consumo.id_ordem_producao_item)
      if (!item) throw httpError('O item do consumo não pertence à ordem', 404)
      const componentes = await validarFichaDoItem(item, empresaId, connection)
      if (
        !componentes.some(
          (componente) =>
            componente.id_materia_prima === consumo.id_materia_prima,
        )
      )
        throw httpError(
          'A matéria-prima não pertence à ficha técnica ativa do produto',
          400,
        )
      const quantidadeItem = Number(item.quantidade)
      await atualizarQuantidadePlanejada(
        consumo.id,
        arredondarDecimal(edicao.quantidadeNecessaria / quantidadeItem),
        edicao.quantidadeNecessaria,
        connection,
      )
    }
    await recalcularDisponibilidade(ordemId, empresaId, connection)
  })
  return montarResposta(ordemId, empresaId, usuario)
}

export async function excluirPlanejamentoCompleto(
  ordemId: number,
  empresaId: number,
  usuario: UsuarioAutenticado,
): Promise<void> {
  await emTransacao(async (connection) => {
    const ordem = await obterOrdem(
      ordemId,
      empresaId,
      usuario,
      connection,
      true,
    )
    validarEstado(ordem)
    const pedido = await buscarPedidoAutomaticoDaOrdem(ordemId, connection)
    if (pedido)
      throw httpError(
        'Exclua ou cancele o pedido de compra automático vinculado antes de excluir o planejamento',
        409,
      )
    await excluirPlanejamento(ordemId, connection)
    await excluirNecessidadesSemConsumo(ordemId, connection)
    await atualizarStatusDaOrdem(ordemId, 'AGUARDANDO_MATERIAL', connection)
  })
}
