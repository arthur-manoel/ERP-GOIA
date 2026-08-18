declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number
        nivel_acesso:
          | 'ADMIN'
          | 'USUARIO'
      }
    }
  }
}

export {}