import type {
  Request,
  Response,
  NextFunction,
} from 'express'

import jwt from 'jsonwebtoken'

import { env } from '../config/env.js'

interface JwtPayload {
  sub: string
  nivel_acesso: 'ADMIN' | 'USUARIO'
}

export interface AuthenticatedRequest
  extends Request {
  user: {
    id: number
    nivel_acesso:
      | 'ADMIN'
      | 'USUARIO'
  }
}

export function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader =
    req.headers.authorization

  if (
    !authHeader ||
    !authHeader.startsWith(
      'Bearer '
    )
  ) {
    res.status(401).json({
      error:
        'Token não informado',
    })

    return
  }

  const token =
    authHeader.slice(7)

  try {
    const payload =
      jwt.verify(
        token,
        env.JWT_ACCESS_SECRET
      )

    if (
      typeof payload !==
        'object' ||
      payload === null ||
      typeof payload.sub !==
        'string' ||
      (
        payload.nivel_acesso !==
          'ADMIN' &&
        payload.nivel_acesso !==
          'USUARIO'
      )
    ) {
      res.status(401).json({
        error:
          'Token inválido',

        code:
          'TOKEN_INVALID',
      })

      return
    }

    req.user = {
      id: Number(
        payload.sub
      ),

      nivel_acesso:
        payload.nivel_acesso,
    }

    next()
  } catch (error) {
    if (
      error instanceof
      jwt.TokenExpiredError
    ) {
      res.status(401).json({
        error:
          'Token expirado',

        code:
          'TOKEN_EXPIRED',
      })

      return
    }

    if (
      error instanceof
      jwt.JsonWebTokenError
    ) {
      res.status(401).json({
        error:
          'Token inválido',

        code:
          'TOKEN_INVALID',
      })

      return
    }

    next(error)
  }
}