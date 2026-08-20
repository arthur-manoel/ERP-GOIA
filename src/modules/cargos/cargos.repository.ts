import type {
  ResultSetHeader,
  RowDataPacket,
} from 'mysql2'

import db from '../../config/database.js'

import type {
  CargoStatus,
} from './cargos.schema.js'

export interface CargoRow
  extends RowDataPacket {
  id: number
  id_empresa: number | null
  nome: string
  descricao: string | null
  status: CargoStatus
}

interface EmpresaRow
  extends RowDataPacket {
  id: number
}

export async function createCargo(
  idEmpresa: number | null,
  nome: string,
  descricao: string | null,
  status: CargoStatus
): Promise<number> {
  const [result] =
    await db.execute<ResultSetHeader>(
      `
        INSERT INTO cargos (
          id_empresa,
          nome,
          descricao,
          status
        )
        VALUES (?, ?, ?, ?)
      `,
      [
        idEmpresa,
        nome,
        descricao,
        status,
      ]
    )

  return result.insertId
}

export async function findAllCargos(): Promise<
  CargoRow[]
> {
  const [rows] =
    await db.execute<CargoRow[]>(
      `
        SELECT
          id,
          id_empresa,
          nome,
          descricao,
          status
        FROM cargos
      `
    )

  return rows
}

export async function findCargoById(
  id: number
): Promise<CargoRow | null> {
  const [rows] =
    await db.execute<CargoRow[]>(
      `
        SELECT
          id,
          id_empresa,
          nome,
          descricao,
          status
        FROM cargos
        WHERE id = ?
        LIMIT 1
      `,
      [
        id,
      ]
    )

  return rows[0] ?? null
}

export async function findCargoByNome(
  nome: string,
  idEmpresa: number | null
): Promise<CargoRow | null> {
  const [rows] =
    await db.execute<CargoRow[]>(
      `
        SELECT
          id,
          id_empresa,
          nome,
          descricao,
          status
        FROM cargos
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

export async function updateCargo(
  id: number,
  idEmpresa: number | null,
  nome: string,
  descricao: string | null,
  status: CargoStatus
): Promise<void> {
  await db.execute<ResultSetHeader>(
    `
      UPDATE cargos
      SET
        id_empresa = ?,
        nome = ?,
        descricao = ?,
        status = ?
      WHERE id = ?
    `,
    [
      idEmpresa,
      nome,
      descricao,
      status,
      id,
    ]
  )
}

export async function deleteCargo(
  id: number
): Promise<void> {
  await db.execute<ResultSetHeader>(
    `
      UPDATE cargos
      SET status = 'INATIVO'
      WHERE id = ?
    `,
    [
      id,
    ]
  )
}