import mysql from 'mysql2/promise'
import { env } from './env.js'

<<<<<<< HEAD
=======

>>>>>>> 142d2f9 (Update 18 8)
const db = mysql.createPool({
  host: env.DB_HOST,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  port: Number(env.DB_PORT) || 13044, // 👈 Adicionado a porta aqui

  // ⚠️ Configuração de SSL necessária para o Aiven
  ssl: {
    rejectUnauthorized: false // Permite a conexão segura sem exigir o arquivo .pem local
  },

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

export default db
