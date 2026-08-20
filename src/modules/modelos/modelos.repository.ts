import type {
  ResultSetHeader,
  RowDataPacket,
} from 'mysql2'

import db from '../../config/database.js'

import type {
  ModeloStatus,
} from './modelos.schema.js'

export interface ModeloRow
  extends RowDataPacket {
  id: number
  id_empresa: number | null
  nome: string
  descricao: string | null
  status: ModeloStatus
}

interface EmpresaRow
  extends RowDataPacket {
  id: number
}

interface CreateModeloData {
  id_empresa: number | null
  nome: string
  descricao: string | null
  status: ModeloStatus
}

interface UpdateModeloData {
  id_empresa: number | null
  nome: string
  descricao: string | null
  status: ModeloStatus
}

export async function findEmpresaById(
  id: number
): Promise<boolean> {
  const [rows] =
    await db.execute<
      EmpresaRow[]
    >(
      `
        SELECT
          id
        FROM empresas
        WHERE id = ?
        LIMIT 1
      `,
      [id]
    )

  return Boolean(
    rows[0]
  )
}

export async function findAllModelos(): Promise<
  ModeloRow[]
> {
  const [rows] =
    await db.execute<
      ModeloRow[]
    >(
      `
        SELECT
          id,
          id_empresa,
          nome,
          descricao,
          status
        FROM modelos
        ORDER BY nome ASC
      `
    )

  return rows
}

export async function findModeloById(
  id: number
): Promise<ModeloRow | null> {
  const [rows] =
    await db.execute<
      ModeloRow[]
    >(
      `
        SELECT
          id,
          id_empresa,
          nome,
          descricao,
          status
        FROM modelos
        WHERE id = ?
        LIMIT 1
      `,
      [id]
    )

  return rows[0] ?? null
}

export async function findModeloByNome(
  nome: string,
  idEmpresa: number | null
): Promise<ModeloRow | null> {
  const [rows] =
    await db.execute<
      ModeloRow[]
    >(
      `
        SELECT
          id,
          id_empresa,
          nome,
          descricao,
          status
        FROM modelos
        WHERE nome = ?
          AND (
            id_empresa = ?
            OR (
              id_empresa IS NULL
              AND ? IS NULL
            )
          )
        LIMIT 1
      `,
      [
        nome,
        idEmpresa,
        idEmpresa,
      ]
    )

  return rows[0] ?? null
}

export async function createModelo(
  data: CreateModeloData
): Promise<number> {
  const [result] =
    await db.execute<
      ResultSetHeader
    >(
      `
        INSERT INTO modelos (
          id_empresa,
          nome,
          descricao,
          status
        )
        VALUES (?, ?, ?, ?)
      `,
      [
        data.id_empresa,
        data.nome,
        data.descricao,
        data.status,
      ]
    )

  return result.insertId
}

export async function updateModelo(
  id: number,
  data: UpdateModeloData
): Promise<void> {
  await db.execute<
    ResultSetHeader
  >(
    `
      UPDATE modelos
      SET
        id_empresa = ?,
        nome = ?,
        descricao = ?,
        status = ?
      WHERE id = ?
    `,
    [
      data.id_empresa,
      data.nome,
      data.descricao,
      data.status,
      id,
    ]
  )
}

export async function deleteModelo(
  id: number
): Promise<void> {
  await db.execute<
    ResultSetHeader
  >(
    `
      UPDATE modelos
      SET status = 'INATIVO'
      WHERE id = ?
    `,
    [id]
  )
}