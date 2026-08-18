import type {
  Request,
  Response,
  NextFunction,
} from 'express'

export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (
    req.user?.nivel_acesso !==
    'ADMIN'
  ) {
    res.status(403).json({
      error:
        'Acesso negado',
    })

    return
  }

  next()
}