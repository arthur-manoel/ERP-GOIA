import type {
  Request,
  Response,
  NextFunction,
} from 'express'

import {
  createUsuarioSchema,
  updateUsuarioSchema,
  usuarioIdParamSchema,
} from './usuarios.schema.js'

import {
  createUsuario as createUsuarioService,
  deleteUsuario as deleteUsuarioService,
  getUsuarioById as getUsuarioByIdService,
  listUsuarios as listUsuariosService,
  updateUsuario as updateUsuarioService,
} from './usuarios.service.js'

export async function createUsuario(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data =
      createUsuarioSchema.parse(
        req.body
      )

    const usuario =
      await createUsuarioService(
        data
      )

    res.status(201).json({
      usuario,
    })
  } catch (error) {
    next(error)
  }
}

export async function listUsuarios(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const usuarios =
      await listUsuariosService()

    res.status(200).json({
      usuarios,
    })
  } catch (error) {
    next(error)
  }
}

export async function getUsuarioById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } =
      usuarioIdParamSchema.parse(
        req.params
      )

    const usuario =
      await getUsuarioByIdService(
        id
      )

    res.status(200).json({
      usuario,
    })
  } catch (error) {
    next(error)
  }
}

export async function updateUsuario(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } =
      usuarioIdParamSchema.parse(
        req.params
      )

    const data =
      updateUsuarioSchema.parse(
        req.body
      )

    if (!req.user) {
      res.status(401).json({
        error:
          'Usuário não autenticado',
      })

      return
    }

    const usuario =
      await updateUsuarioService(
        id,
        data,
        {
          id:
            req.user.id,

          nivel_acesso:
            req.user.nivel_acesso,
        }
      )

    res.status(200).json({
      usuario,
    })
  } catch (error) {
    next(error)
  }
}

export async function deleteUsuario(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } =
      usuarioIdParamSchema.parse(
        req.params
      )

    await deleteUsuarioService(
      id
    )

    res.status(204).send()
  } catch (error) {
    next(error)
  }
}