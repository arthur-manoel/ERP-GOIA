import type {
  ResultSetHeader,
  RowDataPacket,
} from 'mysql2'

import db from '../../config/database.js'

import type {
  SetorStatus,
} from './setores.schema.js'

export interface SetorRow
  extends RowDataPacket {
  id: number
  id_empresa: number | null
  nome: string
  tipo: string
  descricao: string | null
  status: SetorStatus
}

interface EmpresaRow
  extends RowDataPacket {
  id: number
}

interface CreateSetorData {
  idEmpresa: number | null
  nome: string
  tipo: string
  descricao: string | null
  status: SetorStatus
}

interface UpdateSetorData
  extends CreateSetorData {
  id: number
}

export async function createSetor(
  data: CreateSetorData
): Promise<number> {
  const [result] =
    await db.execute<ResultSetHeader>(
      `
        INSERT INTO setores (
          id_empresa,
          nome,
          tipo,
          descricao,
          status
        )
        VALUES (?, ?, ?, ?, ?)
      `,
      [
        data.idEmpresa,
        data.nome,
        data.tipo,
        data.descricao,
        data.status,
      ]
    )

  return result.insertId
}

export async function findAllSetores(): Promise<
  SetorRow[]
> {
  const [rows] =
    await db.execute<SetorRow[]>(
      `
        SELECT
          id,
          id_empresa,
          nome,
          tipo,
          descricao,
          status
        FROM setores
      `
    )

  return rows
}

export async function findSetorById(
  id: number
): Promise<SetorRow | null> {
  const [rows] =
    await db.execute<SetorRow[]>(
      `
        SELECT
          id,
          id_empresa,
          nome,
          tipo,
          descricao,
          status
        FROM setores
        WHERE id = ?
        LIMIT 1
      `,
      [
        id,
      ]
    )

  return rows[0] ?? null
}

export async function findSetorByNome(
  nome: string,
  idEmpresa: number | null
): Promise<SetorRow | null> {
  const [rows] =
    await db.execute<SetorRow[]>(
      `
        SELECT
          id,
          id_empresa,
          nome,
          tipo,
          descricao,
          status
        FROM setores
        WHERE id_empresa <=> ?
          AND nome = ?
        LIMIT 1
      `,
      [
        idEmpresa,
        nome,
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

export async function updateSetor(
  data: UpdateSetorData
): Promise<void> {
  await db.execute<ResultSetHeader>(
    `
      UPDATE setores
      SET
        id_empresa = ?,
        nome = ?,
        tipo = ?,
        descricao = ?,
        status = ?
      WHERE id = ?
    `,
    [
      data.idEmpresa,
      data.nome,
      data.tipo,
      data.descricao,
      data.status,
      data.id,
    ]
  )
}

export async function deleteSetor(
  id: number
): Promise<void> {
  await db.execute<ResultSetHeader>(
    `
      UPDATE setores
      SET status = 'INATIVO'
      WHERE id = ?
    `,
    [
      id,
    ]
  )
}