import 'dotenv/config'

function getEnv(name: string): string {
  const value = process.env[name]

  if (!value) {
    throw new Error(
      `Variável de ambiente ${name} não definida`
    )
  }

  return value
}

export const env = {
  DB_HOST: getEnv('DB_HOST'),
  DB_USER: getEnv('DB_USER'),
  DB_PASSWORD: getEnv('DB_PASSWORD'),
  DB_NAME: getEnv('DB_NAME'),

  JWT_ACCESS_SECRET:
    getEnv('JWT_ACCESS_SECRET'),

  REFRESH_TOKEN_DAYS: Number(
    process.env.REFRESH_TOKEN_DAYS ?? 7
  ),

  PORT: Number(
    process.env.PORT ?? 3000
  ),

  NODE_ENV:
    process.env.NODE_ENV ?? 'development',
}