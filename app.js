import 'dotenv/config'

import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

import authRouter from './src/modules/auth/auth.router.js'

const app = express()

// Middlewares globais
app.use(cors())

app.use(express.json())

app.use(cookieParser())

// Rotas
app.use('/auth', authRouter)

app.get('/', (req, res) => {
  return res.status(200).json({
    message: 'API online',
  })
})

// Middleware global de erros
app.use((error, req, res, next) => {
  if (error.name === 'ZodError') {
    return res.status(400).json({
      error: 'Dados inválidos',
      details: error.issues,
    })
  }

  console.error(error)

  return res.status(error.statusCode || 500).json({
    error: error.message || 'Erro interno do servidor',
  })
})

export default app