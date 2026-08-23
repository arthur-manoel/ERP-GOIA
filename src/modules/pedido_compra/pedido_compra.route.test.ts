import assert from 'node:assert/strict'
import type { AddressInfo } from 'node:net'
import { after, before, test } from 'node:test'
import jwt from 'jsonwebtoken'
import app from '../../app.js'
import { env } from '../../config/env.js'

let baseUrl = ''
let server: ReturnType<typeof app.listen>
function token(nivelAcesso: 'ADMIN' | 'USUARIO'): string {
  return jwt.sign({ nivel_acesso: nivelAcesso }, env.JWT_ACCESS_SECRET, { subject: '1', expiresIn: '5m' })
}
before(() => {
  server = app.listen(0)
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`
})
after(async () => {
  await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
})

test('todas as rotas de pedido de compra exigem autenticação', async () => {
  const requests = [
    ['GET', '/pedidos_compra'], ['GET', '/pedidos_compra/1'],
    ['POST', '/pedidos_compra'], ['PUT', '/pedidos_compra/1'], ['DELETE', '/pedidos_compra/1'],
  ] as const
  for (const [method, path] of requests) {
    const response = await fetch(`${baseUrl}${path}`, {
      method, headers: { 'content-type': 'application/json' },
      ...(method === 'POST' || method === 'PUT' ? { body: '{}' } : {}),
    })
    assert.equal(response.status, 401, `${method} ${path}`)
  }
})

test('usuário comum não pode alterar pedidos de compra', async () => {
  const authorization = `Bearer ${token('USUARIO')}`
  for (const [method, path] of [
    ['POST', '/pedidos_compra'], ['PUT', '/pedidos_compra/1'], ['DELETE', '/pedidos_compra/1'],
  ] as const) {
    const response = await fetch(`${baseUrl}${path}`, {
      method, headers: { authorization, 'content-type': 'application/json' },
      ...(method === 'POST' || method === 'PUT' ? { body: '{}' } : {}),
    })
    assert.equal(response.status, 403, `${method} ${path}`)
  }
})

test('ADMIN recebe erro 400 para data ou status inválido', async () => {
  const response = await fetch(`${baseUrl}/pedidos_compra`, {
    method: 'POST',
    headers: { authorization: `Bearer ${token('ADMIN')}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      id_empresa: 1, id_fornecedor: 1, id_usuario: 1, numero: 'PC-001',
      data_pedido: '2026-02-30', status: 'DESCONHECIDO',
    }),
  })
  const body = await response.json() as { success?: boolean; error?: string }
  assert.equal(response.status, 400)
  assert.equal(body.success, false)
  assert.equal(body.error, 'Dados inválidos')
})

test('ADMIN não pode alterar id ou numero', async () => {
  const response = await fetch(`${baseUrl}/pedidos_compra/1`, {
    method: 'PUT',
    headers: { authorization: `Bearer ${token('ADMIN')}`, 'content-type': 'application/json' },
    body: JSON.stringify({ id: 2, numero: 'PC-002' }),
  })
  assert.equal(response.status, 400)
})
