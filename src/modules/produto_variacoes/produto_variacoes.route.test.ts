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

test('todas as rotas de variações de produto exigem autenticação', async () => {
  const requests = [
    ['GET', '/produto_variacoes'], ['GET', '/produto_variacoes/1'],
    ['POST', '/produto_variacoes'], ['PUT', '/produto_variacoes/1'],
    ['DELETE', '/produto_variacoes/1'],
  ] as const
  for (const [method, path] of requests) {
    const response = await fetch(`${baseUrl}${path}`, {
      method, headers: { 'content-type': 'application/json' },
      ...(method === 'POST' || method === 'PUT' ? { body: '{}' } : {}),
    })
    assert.equal(response.status, 401, `${method} ${path}`)
  }
})

test('usuário comum não pode alterar variações de produto', async () => {
  const authorization = `Bearer ${token('USUARIO')}`
  for (const [method, path] of [
    ['POST', '/produto_variacoes'], ['PUT', '/produto_variacoes/1'],
    ['DELETE', '/produto_variacoes/1'],
  ] as const) {
    const response = await fetch(`${baseUrl}${path}`, {
      method, headers: { authorization, 'content-type': 'application/json' },
      ...(method === 'POST' || method === 'PUT' ? { body: '{}' } : {}),
    })
    assert.equal(response.status, 403, `${method} ${path}`)
  }
})

test('ADMIN recebe erro 400 para status inválido', async () => {
  const response = await fetch(`${baseUrl}/produto_variacoes`, {
    method: 'POST',
    headers: { authorization: `Bearer ${token('ADMIN')}`, 'content-type': 'application/json' },
    body: JSON.stringify({ id_empresa: 1, id_produto: 1, status: 'BLOQUEADO' }),
  })
  const body = await response.json() as { success?: boolean; error?: string }
  assert.equal(response.status, 400)
  assert.equal(body.success, false)
  assert.equal(body.error, 'Dados inválidos')
})

test('ADMIN não pode alterar id', async () => {
  const response = await fetch(`${baseUrl}/produto_variacoes/1`, {
    method: 'PUT',
    headers: { authorization: `Bearer ${token('ADMIN')}`, 'content-type': 'application/json' },
    body: JSON.stringify({ id: 2 }),
  })
  assert.equal(response.status, 400)
})
