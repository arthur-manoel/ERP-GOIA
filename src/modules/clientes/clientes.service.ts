import {
  createCliente as createClienteRepository,
  deleteCliente as deleteClienteRepository,
  findAllClientes,
  findClienteByCpf,
  findClienteById,
  findEmpresaById,
  updateCliente as updateClienteRepository,
} from './clientes.repository.js'

import type {
  ClienteRow,
} from './clientes.repository.js'

import type {
  CreateClienteInput,
  UpdateClienteInput,
} from './clientes.schema.js'

interface DatabaseError
  extends Error {
  code?: string
  errno?: number
}

function createHttpError(
  message: string,
  statusCode: number
): Error & {
  statusCode: number
} {
  const error =
    new Error(
      message
    ) as Error & {
      statusCode: number
    }

  error.statusCode =
    statusCode

  return error
}

function isDuplicateEntryError(
  error: unknown
): boolean {
  if (
    typeof error !==
      'object' ||
    error === null
  ) {
    return false
  }

  const databaseError =
    error as DatabaseError

  return (
    databaseError.code ===
      'ER_DUP_ENTRY' ||
    databaseError.errno ===
      1062
  )
}

function throwDuplicateClienteError(): never {
  throw createHttpError(
    'Já existe um cliente com este CPF para esta empresa',
    409
  )
}

export async function createCliente(
  data: CreateClienteInput
): Promise<ClienteRow> {
  if (
    data.id_empresa !== null
  ) {
    const empresa =
      await findEmpresaById(
        data.id_empresa
      )

    if (!empresa) {
      throw createHttpError(
        'Empresa não encontrada',
        404
      )
    }
  }

  const existingCliente =
    await findClienteByCpf(
      data.cpf_cnpj,
      data.id_empresa
    )

  if (existingCliente) {
    throwDuplicateClienteError()
  }

  let clienteId: number

  try {
    clienteId =
      await createClienteRepository({
        idEmpresa:
          data.id_empresa,

        nomeRazaoSocial:
          data.nome_razao_social,

        cpfCnpj:
          data.cpf_cnpj,

        email:
          data.email ??
          null,

        telefone:
          data.telefone ??
          null,

        endereco:
          data.endereco ??
          null,

        numero:
          data.numero ??
          null,

        complemento:
          data.complemento ??
          null,

        bairro:
          data.bairro ??
          null,

        cidade:
          data.cidade ??
          null,

        estado:
          data.estado ??
          null,

        cep:
          data.cep ??
          null,

        status:
          data.status,
      })
  } catch (error) {
    if (
      isDuplicateEntryError(
        error
      )
    ) {
      throwDuplicateClienteError()
    }

    throw error
  }

  const cliente =
    await findClienteById(
      clienteId
    )

  if (!cliente) {
    throw new Error(
      'Não foi possível localizar o cliente após a criação'
    )
  }

  return cliente
}

export async function listClientes(): Promise<
  ClienteRow[]
> {
  return findAllClientes()
}

export async function getClienteById(
  id: number
): Promise<ClienteRow> {
  const cliente =
    await findClienteById(id)

  if (!cliente) {
    throw createHttpError(
      'Cliente não encontrado',
      404
    )
  }

  return cliente
}

export async function updateCliente(
  id: number,
  data: UpdateClienteInput
): Promise<ClienteRow> {
  const existingCliente =
    await findClienteById(id)

  if (!existingCliente) {
    throw createHttpError(
      'Cliente não encontrado',
      404
    )
  }

  const idEmpresa =
    data.id_empresa !==
    undefined
      ? data.id_empresa
      : existingCliente.id_empresa

  const nomeRazaoSocial =
    data.nome_razao_social !==
    undefined
      ? data.nome_razao_social
      : existingCliente.nome_razao_social

  const cpfCnpj =
    data.cpf_cnpj !== undefined
      ? data.cpf_cnpj
      : existingCliente.cpf_cnpj

  const email =
    data.email !== undefined
      ? data.email
      : existingCliente.email

  const telefone =
    data.telefone !== undefined
      ? data.telefone
      : existingCliente.telefone

  const endereco =
    data.endereco !== undefined
      ? data.endereco
      : existingCliente.endereco

  const numero =
    data.numero !== undefined
      ? data.numero
      : existingCliente.numero

  const complemento =
    data.complemento !==
    undefined
      ? data.complemento
      : existingCliente.complemento

  const bairro =
    data.bairro !== undefined
      ? data.bairro
      : existingCliente.bairro

  const cidade =
    data.cidade !== undefined
      ? data.cidade
      : existingCliente.cidade

  const estado =
    data.estado !== undefined
      ? data.estado
      : existingCliente.estado

  const cep =
    data.cep !== undefined
      ? data.cep
      : existingCliente.cep

  const status =
    data.status !== undefined
      ? data.status
      : existingCliente.status

  if (
    data.id_empresa !==
      undefined &&
    idEmpresa !== null
  ) {
    const empresa =
      await findEmpresaById(
        idEmpresa
      )

    if (!empresa) {
      throw createHttpError(
        'Empresa não encontrada',
        404
      )
    }
  }

  if (
    data.cpf_cnpj !==
      undefined ||
    data.id_empresa !==
      undefined
  ) {
    const clienteWithSameCpf =
      await findClienteByCpf(
        cpfCnpj,
        idEmpresa
      )

    if (
      clienteWithSameCpf &&
      clienteWithSameCpf.id !== id
    ) {
      throwDuplicateClienteError()
    }
  }

  try {
    await updateClienteRepository({
      id,
      idEmpresa,
      nomeRazaoSocial,
      cpfCnpj,
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
    })
  } catch (error) {
    if (
      isDuplicateEntryError(
        error
      )
    ) {
      throwDuplicateClienteError()
    }

    throw error
  }

  const updatedCliente =
    await findClienteById(id)

  if (!updatedCliente) {
    throw createHttpError(
      'Cliente não encontrado',
      404
    )
  }

  return updatedCliente
}

export async function deleteCliente(
  id: number
): Promise<void> {
  const existingCliente =
    await findClienteById(id)

  if (!existingCliente) {
    throw createHttpError(
      'Cliente não encontrado',
      404
    )
  }

  await deleteClienteRepository(
    id
  )
}