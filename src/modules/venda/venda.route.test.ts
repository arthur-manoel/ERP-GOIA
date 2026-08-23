import assert from 'node:assert/strict'
import type { AddressInfo } from 'node:net'
import { after, before, test } from 'node:test'

import jwt from 'jsonwebtoken'

import app from '../../app.js'
import { env } from '../../config/env.js'

let baseUrl = ''
let server: ReturnType<typeof app.listen>

function token(
  nivelAcesso: 'ADMIN' | 'USUARIO'
): string {
  return jwt.sign(
    {
      nivel_acesso:
        nivelAcesso,
    },
    env.JWT_ACCESS_SECRET,
    {
      subject: '1',
      expiresIn: '5m',
    }
  )
}

before(() => {
  server = app.listen(0)

  const address =
    server.address() as AddressInfo

  baseUrl =
    `http://127.0.0.1:${address.port}`
})

after(async () => {
  await new Promise<void>(
    (resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error)
          return
        }

        resolve()
      })
    }
  )
})

test(
  'todas as rotas de venda exigem autenticação',
  async () => {
    const requests = [
      ['GET', '/venda'],
      ['GET', '/venda/1'],
      ['POST', '/venda'],
      ['PUT', '/venda/1'],
      ['DELETE', '/venda/1'],
    ] as const

    for (const [method, path] of requests) {
      const response = await fetch(
        `${baseUrl}${path}`,
        {
          method,
          headers: {
            'content-type':
              'application/json',
          },
          ...(method === 'POST' ||
          method === 'PUT'
            ? {
                body: '{}',
              }
            : {}),
        }
      )

      assert.equal(
        response.status,
        401,
        `${method} ${path}`
      )
    }
  }
)

test(
  'usuário comum não pode alterar vendas',
  async () => {
    const authorization =
      `Bearer ${token('USUARIO')}`

    for (const [method, path] of [
      ['POST', '/venda'],
      ['PUT', '/venda/1'],
      ['DELETE', '/venda/1'],
    ] as const) {
      const response = await fetch(
        `${baseUrl}${path}`,
        {
          method,
          headers: {
            authorization,
            'content-type':
              'application/json',
          },
          ...(method === 'POST' ||
          method === 'PUT'
            ? {
                body: '{}',
              }
            : {}),
        }
      )

      assert.equal(
        response.status,
        403,
        `${method} ${path}`
      )
    }
  }
)

test(
  'rejeita data fora do formato YYYY-MM-DD',
  async () => {
    const response = await fetch(
      `${baseUrl}/venda`,
      {
        method: 'POST',
        headers: {
          authorization:
            `Bearer ${token('ADMIN')}`,
          'content-type':
            'application/json',
        },
        body: JSON.stringify({
          id_empresa: 1,
          id_cliente: 1,
          id_usuario: 1,
          numero: 'TESTE-DATA',
          data_venda: '2026-1-01',
          valor_total: 10,
        }),
      }
    )

    const body =
      await response.json() as {
        error?: string
      }

    assert.equal(response.status, 400)
    assert.equal(
      body.error,
      'A data informada é inválida. Utilize o formato YYYY-MM-DD'
    )
  }
)
