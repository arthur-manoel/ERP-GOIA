import argon2 from 'argon2'

import {
  createUsuario as createUsuarioRepository,
  deleteUsuario as deleteUsuarioRepository,
  findAllUsuarios,
  findUsuarioByEmail,
  findUsuarioById,
  updateUsuario as updateUsuarioRepository,
} from './usuarios.repository.js'

import type {
  UsuarioPublicRow,
  UsuarioRow,
} from './usuarios.repository.js'

import type {
  CreateUsuarioInput,
  UpdateUsuarioInput,
  UsuarioNivelAcesso,
  UsuarioStatus,
} from './usuarios.schema.js'

interface AuthenticatedUser {
  id: number
  nivel_acesso:
    | 'ADMIN'
    | 'USUARIO'
}

export interface UsuarioPublic {
  id: number
  nome: string
  email: string
  nivel_acesso: UsuarioNivelAcesso
  status: UsuarioStatus
  data_cadastro: Date | string
}

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

function throwDuplicateEmailError(): never {
  throw createHttpError(
    'Este email já está cadastrado',
    409
  )
}

function toUsuarioPublic(
  usuario: UsuarioRow
): UsuarioPublic {
  return {
    id:
      usuario.id,

    nome:
      usuario.nome,

    email:
      usuario.email,

    nivel_acesso:
      usuario.nivel_acesso,

    status:
      usuario.status,

    data_cadastro:
      usuario.data_cadastro,
  }
}

export async function createUsuario(
  data: CreateUsuarioInput
): Promise<UsuarioPublic> {
  const existingUsuario =
    await findUsuarioByEmail(
      data.email
    )

  if (existingUsuario) {
    throwDuplicateEmailError()
  }

  const senhaHash =
    await argon2.hash(
      data.senha
    )

  let usuarioId: number

  try {
    usuarioId =
      await createUsuarioRepository({
        nome:
          data.nome,

        email:
          data.email,

        senhaHash,

        nivelAcesso:
          data.nivel_acesso,

        status:
          data.status,
      })
  } catch (error) {
    if (
      isDuplicateEntryError(
        error
      )
    ) {
      throwDuplicateEmailError()
    }

    throw error
  }

  const usuario =
    await findUsuarioById(
      usuarioId
    )

  if (!usuario) {
    throw new Error(
      'Não foi possível localizar o usuário após a criação'
    )
  }

  return toUsuarioPublic(
    usuario
  )
}

export async function listUsuarios(): Promise<
  UsuarioPublicRow[]
> {
  return findAllUsuarios()
}

export async function getUsuarioById(
  id: number
): Promise<UsuarioPublic> {
  const usuario =
    await findUsuarioById(id)

  if (!usuario) {
    throw createHttpError(
      'Usuário não encontrado',
      404
    )
  }

  return toUsuarioPublic(
    usuario
  )
}

export async function updateUsuario(
  id: number,
  data: UpdateUsuarioInput,
  authenticatedUser: AuthenticatedUser
): Promise<UsuarioPublic> {
  const existingUsuario =
    await findUsuarioById(id)

  if (!existingUsuario) {
    throw createHttpError(
      'Usuário não encontrado',
      404
    )
  }

  const isAdmin =
    authenticatedUser.nivel_acesso ===
    'ADMIN'

  const isOwnUser =
    authenticatedUser.id === id

  if (
    !isAdmin &&
    !isOwnUser
  ) {
    throw createHttpError(
      'Você não possui autorização para alterar este usuário',
      403
    )
  }

  if (!isAdmin) {
    if (
        data.nivel_acesso !== undefined ||
        data.status !== undefined
    ) {
        throw createHttpError(
        'Você pode alterar apenas seu nome, email e senha',
        403
        )
    }
}

  const nome =
    data.nome !== undefined
      ? data.nome
      : existingUsuario.nome

  const email =
    data.email !== undefined
      ? data.email
      : existingUsuario.email

  const nivelAcesso =
    data.nivel_acesso !==
    undefined
      ? data.nivel_acesso
      : existingUsuario.nivel_acesso

  const status =
    data.status !== undefined
      ? data.status
      : existingUsuario.status

  if (
    data.email !== undefined
  ) {
    const usuarioWithSameEmail =
      await findUsuarioByEmail(
        email
      )

    if (
      usuarioWithSameEmail &&
      usuarioWithSameEmail.id !== id
    ) {
      throwDuplicateEmailError()
    }
  }

  let senhaHash =
    existingUsuario.senha

  if (
    data.senha !== undefined
  ) {
    senhaHash =
      await argon2.hash(
        data.senha
      )
  }

  try {
    await updateUsuarioRepository({
      id,
      nome,
      email,
      senhaHash,
      nivelAcesso,
      status,
    })
  } catch (error) {
    if (
      isDuplicateEntryError(
        error
      )
    ) {
      throwDuplicateEmailError()
    }

    throw error
  }

  const updatedUsuario =
    await findUsuarioById(id)

  if (!updatedUsuario) {
    throw createHttpError(
      'Usuário não encontrado',
      404
    )
  }

  return toUsuarioPublic(
    updatedUsuario
  )
}
export async function deleteUsuario(
  id: number
): Promise<void> {
  const existingUsuario =
    await findUsuarioById(id)

  if (!existingUsuario) {
    throw createHttpError(
      'Usuário não encontrado',
      404
    )
  }

  await deleteUsuarioRepository(
    id
  )
}