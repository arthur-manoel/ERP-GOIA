import assert from 'node:assert/strict'
import test from 'node:test'
import { atualizarConsumosSchema } from './consumoPlanejado.schema.js'
import {
  arredondarDecimal,
  distribuirEstoque,
} from './consumoPlanejado.service.js'

test('calcula e arredonda consumo em DECIMAL(15,3)', () => {
  assert.equal(arredondarDecimal(0.75 * 100), 75)
  assert.equal(arredondarDecimal(10 / 3), 3.333)
})

test('soma implícita por linhas da mesma matéria-prima sem reutilizar saldo', () => {
  const resultado = distribuirEstoque(
    [
      { id: 1, materiaPrimaId: 2, quantidadeNecessaria: 70 },
      { id: 2, materiaPrimaId: 2, quantidadeNecessaria: 50 },
    ],
    new Map([[2, 100]]),
  )
  assert.deepEqual(
    resultado.map((item) => [
      item.quantidadeDisponivel,
      item.quantidadeFaltante,
    ]),
    [
      [70, 0],
      [30, 20],
    ],
  )
})

test('calcula falta total quando não há estoque', () => {
  const [resultado] = distribuirEstoque(
    [{ id: 1, materiaPrimaId: 2, quantidadeNecessaria: 12.5 }],
    new Map(),
  )
  assert.equal(resultado?.quantidadeDisponivel, 0)
  assert.equal(resultado?.quantidadeFaltante, 12.5)
})

test('não distribui estoque de outra matéria-prima', () => {
  const [resultado] = distribuirEstoque(
    [{ id: 1, materiaPrimaId: 2, quantidadeNecessaria: 5 }],
    new Map([[3, 100]]),
  )
  assert.equal(resultado?.quantidadeFaltante, 5)
})

test('schema normaliza quantidade necessária para três casas', () => {
  const parsed = atualizarConsumosSchema.parse({
    consumos: [{ id: 1, quantidadeNecessaria: 1.2346 }],
  })
  assert.equal(parsed.consumos[0]?.quantidadeNecessaria, 1.235)
})

test('schema rejeita quantidade zero, negativa e não finita', () => {
  for (const value of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
    assert.equal(
      atualizarConsumosSchema.safeParse({
        consumos: [{ id: 1, quantidadeNecessaria: value }],
      }).success,
      false,
    )
  }
})

test('schema rejeita IDs repetidos em edição em lote', () => {
  const result = atualizarConsumosSchema.safeParse({
    consumos: [
      { id: 1, quantidadeNecessaria: 1 },
      { id: 1, quantidadeNecessaria: 2 },
    ],
  })
  assert.equal(result.success, false)
})
