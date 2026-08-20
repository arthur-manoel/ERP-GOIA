import type {
  ResultSetHeader,
  RowDataPacket,
} from 'mysql2'

import db from '../../config/database.js'

import type {
  ClienteStatus,
} from './clientes.schema.js'

export interface ClienteRow
  extends RowDataPacket {
  id: number
  id_empresa: number | null
  nome_razao_social: string
  cpf_cnpj: string
  email: string | null
  telefone: string | null
  endereco: string | null
  numero: string | null
  complemento: string | null
  bairro: string | null
  cidade: string | null
  estado: string | null
  cep: string | null
  status: ClienteStatus
  data_cadastro: Date | string
}

interface EmpresaRow
  extends RowDataPacket {
  id: number
}

interface CreateClienteData {
  idEmpresa: number | null
  nomeRazaoSocial: string
  cpfCnpj: string
  email: string | null
  telefone: string | null
  endereco: string | null
  numero: string | null
  complemento: string | null
  bairro: string | null
  cidade: string | null
  estado: string | null
  cep: string | null
  status: ClienteStatus
}

interface UpdateClienteData
  extends CreateClienteData {
  id: number
}

export async function createCliente(
  data: CreateClienteData
): Promise<number> {
  const [result] =
    await db.execute<ResultSetHeader>(
      `
        INSERT INTO clientes (
          id_empresa,
          nome_razao_social,
          cpf_cnpj,
          email,
          telefone,
          endereco,
          numero,
          complemento,
          bairro,
          cidade,
          estado,
          cep,
          status,
          data_cadastro
        )
        VALUES (
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          NOW()
        )
      `,
      [
        data.idEmpresa,
        data.nomeRazaoSocial,
        data.cpfCnpj,
        data.email,
        data.telefone,
        data.endereco,
        data.numero,
        data.complemento,
        data.bairro,
        data.cidade,
        data.estado,
        data.cep,
        data.status,
      ]
    )

  return result.insertId
}

export async function findAllClientes(): Promise<
  ClienteRow[]
> {
  const [rows] =
    await db.execute<ClienteRow[]>(
      `
        SELECT
          id,
          id_empresa,
          nome_razao_social,
          cpf_cnpj,
          email,
          telefone,
          endereco,
          numero,
          complemento,
          bairro,
          cidade,
          estado,
          cep,
          status,
          data_cadastro
        FROM clientes
      `
    )

  return rows
}

export async function findClienteById(
  id: number
): Promise<ClienteRow | null> {
  const [rows] =
    await db.execute<ClienteRow[]>(
      `
        SELECT
          id,
          id_empresa,
          nome_razao_social,
          cpf_cnpj,
          email,
          telefone,
          endereco,
          numero,
          complemento,
          bairro,
          cidade,
          estado,
          cep,
          status,
          data_cadastro
        FROM clientes
        WHERE id = ?
        LIMIT 1
      `,
      [
        id,
      ]
    )

  return rows[0] ?? null
}

export async function findClienteByCpf(
  cpfCnpj: string,
  idEmpresa: number | null
): Promise<ClienteRow | null> {
  const [rows] =
    await db.execute<ClienteRow[]>(
      `
        SELECT
          id,
          id_empresa,
          nome_razao_social,
          cpf_cnpj,
          email,
          telefone,
          endereco,
          numero,
          complemento,
          bairro,
          cidade,
          estado,
          cep,
          status,
          data_cadastro
        FROM clientes
        WHERE id_empresa <=> ?
          AND cpf_cnpj = ?
        LIMIT 1
      `,
      [
        idEmpresa,
        cpfCnpj,
      ]
    )

  return rows[0] ?? null
}

export async function findEmpresaById(
  id: number
): Promise<EmpresaRow | null> {
  const [rows] =
    await db.execute<EmpresaRow[]>(
      `
        SELECT
          id
        FROM empresas
        WHERE id = ?
        LIMIT 1
      `,
      [
        id,
      ]
    )

  return rows[0] ?? null
}

export async function updateCliente(
  data: UpdateClienteData
): Promise<void> {
  await db.execute<ResultSetHeader>(
    `
      UPDATE clientes
      SET
        id_empresa = ?,
        nome_razao_social = ?,
        cpf_cnpj = ?,
        email = ?,
        telefone = ?,
        endereco = ?,
        numero = ?,
        complemento = ?,
        bairro = ?,
        cidade = ?,
        estado = ?,
        cep = ?,
        status = ?
      WHERE id = ?
    `,
    [
      data.idEmpresa,
      data.nomeRazaoSocial,
      data.cpfCnpj,
      data.email,
      data.telefone,
      data.endereco,
      data.numero,
      data.complemento,
      data.bairro,
      data.cidade,
      data.estado,
      data.cep,
      data.status,
      data.id,
    ]
  )
}

export async function deleteCliente(
  id: number
): Promise<void> {
  await db.execute<ResultSetHeader>(
    `
      UPDATE clientes
      SET status = 'INATIVO'
      WHERE id = ?
    `,
    [
      id,
    ]
  )
}