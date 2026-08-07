import jwt from 'jsonwebtoken'

export function authenticate(
  req,
  res,
  next
) {
  const authHeader =
    req.headers.authorization

  if (
    !authHeader ||
    !authHeader.startsWith(
      'Bearer '
    )
  ) {
    return res
      .status(401)
      .json({
        error:
          'Token não informado',
      })
  }

  const token =
    authHeader.slice(7)

  try {
    const payload =
      jwt.verify(
        token,
        process.env
          .JWT_ACCESS_SECRET
      )

    req.user = {
      id:
        payload.sub,

      role:
        payload.role,
    }

    return next()
  } catch (error) {
    if (
      error.name ===
      'TokenExpiredError'
    ) {
      return res
        .status(401)
        .json({
          error:
            'Token expirado',

          code:
            'TOKEN_EXPIRED',
        })
    }

    if (
      error.name ===
      'JsonWebTokenError'
    ) {
      return res
        .status(401)
        .json({
          error:
            'Token inválido',

          code:
            'TOKEN_INVALID',
        })
    }

    return next(error)
  }
}