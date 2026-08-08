import type {
  Request,
  Response,
  NextFunction,
} from 'express'

import {
  registerSchema,
  loginSchema,
} from './auth.schema.js'

import {
  register,
  login,
  refresh,
  logout,
} from './auth.service.js'

import { env } from '../../config/env.js'

const cookieOptions = {
  httpOnly: true,
  secure:
    env.NODE_ENV ===
    'production',
  sameSite: 'lax' as const,

  maxAge:
    env.REFRESH_TOKEN_DAYS *
    24 *
    60 *
    60 *
    1000,
}

export async function registerController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data =
      registerSchema.parse(
        req.body
      )

    const user =
      await register(data)

    res
      .status(201)
      .json({
        user,
      })
  } catch (error) {
    next(error)
  }
}

export async function loginController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data =
      loginSchema.parse(
        req.body
      )

    const result =
      await login(data)

    res.cookie(
      'refreshToken',
      result.refreshToken,
      cookieOptions
    )

    res.json({
      user: result.user,
      accessToken:
        result.accessToken,
    })
  } catch (error) {
    next(error)
  }
}

export async function refreshController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const refreshToken =
      req.cookies?.refreshToken

    const result =
      await refresh(
        refreshToken
      )

    res.cookie(
      'refreshToken',
      result.refreshToken,
      cookieOptions
    )

    res.json({
      accessToken:
        result.accessToken,
    })
  } catch (error) {
    next(error)
  }
}

export async function logoutController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const refreshToken =
      req.cookies?.refreshToken

    await logout(
      refreshToken
    )

    res.clearCookie(
      'refreshToken',
      {
        httpOnly: true,

        secure:
          env.NODE_ENV ===
          'production',

        sameSite:
          'lax',
      }
    )

    res.status(204).send()
  } catch (error) {
    next(error)
  }
}