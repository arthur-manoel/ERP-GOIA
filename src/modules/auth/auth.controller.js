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

const cookieOptions = {
  httpOnly: true,

  secure:
    process.env.NODE_ENV ===
    'production',

  sameSite: 'lax',

  maxAge:
    7 *
    24 *
    60 *
    60 *
    1000,
}

export async function registerController(
  req,
  res,
  next
) {
  try {
    const data =
      registerSchema.parse(
        req.body
      )

    const user =
      await register(data)

    return res
      .status(201)
      .json({
        user,
      })
  } catch (error) {
    next(error)
  }
}

export async function loginController(
  req,
  res,
  next
) {
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

    return res.json({
      user: result.user,
      accessToken:
        result.accessToken,
    })
  } catch (error) {
    next(error)
  }
}

export async function refreshController(
  req,
  res,
  next
) {
  try {
    const refreshToken =
      req.cookies
        .refreshToken

    const result =
      await refresh(
        refreshToken
      )

    res.cookie(
      'refreshToken',
      result.refreshToken,
      cookieOptions
    )

    return res.json({
      accessToken:
        result.accessToken,
    })
  } catch (error) {
    next(error)
  }
}

export async function logoutController(
  req,
  res,
  next
) {
  try {
    const refreshToken =
      req.cookies
        .refreshToken

    await logout(
      refreshToken
    )

    res.clearCookie(
      'refreshToken',
      {
        httpOnly: true,

        secure:
          process.env
            .NODE_ENV ===
          'production',

        sameSite:
          'lax',
      }
    )

    return res
      .status(204)
      .send()
  } catch (error) {
    next(error)
  }
}