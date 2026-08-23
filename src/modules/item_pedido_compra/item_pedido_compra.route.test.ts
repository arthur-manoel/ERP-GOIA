import assert from 'node:assert/strict'
import type { AddressInfo } from 'node:net'
import { after, before, test } from 'node:test'

import jwt from 'jsonwebtoken'

import app from '../../app.js'
import { env } from '../../config/env.js'

let baseUrl = ''
let server: ReturnType<typeof app.listen>

function token(nivelAcesso: 'ADMIN' | 'USUARIO'): string {
  return jwt.sign(
    { nivel_acesso: nivelAcesso },
    env.JWT_ACCESS_SECRET,
    { subject: '1', expiresIn: '5m' }
  )
}

before(() => {
  server = app.listen(0)
  const address = server.address() as AddressInfo
  baseUrl = `http://127.0.0.1:${address.port}`
})

after(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve())
  })
})

test('todas as rotas de item de pedido de compra exigem autenticação', async () => {
  const requests = [
    ['GET', '/itens_pedido_compra'],
    ['GET', '/itens_pedido_compra/1'],
    ['POST', '/itens_pedido_compra'],
    ['PUT', '/itens_pedido_compra/1'],
    ['DELETE', '/itens_pedido_compra/1'],
  ] as const

  for (const [method, path] of requests) {
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: { 'content-type': 'application/json' },
      ...(method === 'POST' || method === 'PUT' ? { body: '{}' } : {}),
    })
    assert.equal(response.status, 401, `${method} ${path}`)
  }
})

test('usuário comum não pode alterar itens de pedido de compra', async () => {
  const authorization = `Bearer ${token('USUARIO')}`

  for (const [method, path] of [
    ['POST', '/itens_pedido_compra'],
    ['PUT', '/itens_pedido_compra/1'],
    ['DELETE', '/itens_pedido_compra/1'],
  ] as const) {
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: { authorization, 'content-type': 'application/json' },
      ...(method === 'POST' || method === 'PUT' ? { body: '{}' } : {}),
    })
    assert.equal(response.status, 403, `${method} ${path}`)
  }
})

test('ADMIN recebe erro 400 ao criar item com valores inválidos', async () => {
  const response = await fetch(`${baseUrl}/itens_pedido_compra`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token('ADMIN')}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      id_pedido_compra: 1,
      id_produto: 1,
      quantidade: -1,
      valor_unitario: -10,
    }),
  })

  const body = await response.json() as {
    success?: boolean
    error?: string
    data?: { issues?: unknown[] }
  }

  assert.equal(response.status, 400)
  assert.equal(body.success, false)
  assert.equal(body.error, 'Dados inválidos')
  assert.ok(body.data?.issues?.length)
})

test('ADMIN não pode enviar id ou id_pedido_compra na atualização', async () => {
  const response = await fetch(`${baseUrl}/itens_pedido_compra/1`, {
    method: 'PUT',
    headers: {
      authorization: `Bearer ${token('ADMIN')}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ id: 2, id_pedido_compra: 2 }),
  })

  assert.equal(response.status, 400)
})
