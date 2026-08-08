import type {
  Request,
  Response,
  NextFunction,
} from 'express'

import jwt, {
  JwtPayload,
} from 'jsonwebtoken'

import { env } from '../config/env.js'

interface AccessTokenPayload
  extends JwtPayload {
  sub: string
  role: string
}

export function authenticate(
  req: Request,
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
      ) as AccessTokenPayload

    if (
      typeof payload.sub !==
        'string' ||
      typeof payload.role !==
        'string'
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
      id: payload.sub,
      role: payload.role,
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