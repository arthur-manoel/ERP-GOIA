import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { ZodError } from 'zod'

import authRouter from './modules/auth/auth.router.js'
import fornecedorRouter from './modules/fornecedor/fornecedor.router.js'
import empresasRouter from './modules/empresas/empresa.router.js'
import modelosRouter from './modules/modelos/modelos.router.js'


import coresRouter from './modules/cores/cores.router.js'
import categoriaRouter from './modules/categoria/categoria.router.js'
import tipos_produtosRouter from './modules/tipos_produtos/tipos_produtos.router.js'


const app = express()

app.use(cors())

app.use(express.json())

app.use(cookieParser())

app.use('/auth', authRouter)
app.use('/fornecedor', fornecedorRouter)
app.use('/empresas', empresasRouter)
app.use('/modelos', modelosRouter)

app.use('./cores', coresRouter)


app.get('/', (req, res) => {
  return res.status(200).json({
    message: 'API online',
  })
})

app.use(
  (
    error: Error & {
      statusCode?: number
    },
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: error.issues,
      })
    }

    console.error(error)

    return res
      .status(error.statusCode ?? 500)
      .json({
        error:
          error.message ??
          'Erro interno do servidor',
      })
  }
)

export default app