import dotenv from 'dotenv';

dotenv.config();

const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3800,
  database: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    port: Number(process.env.DB_PORT) || 3306,
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'bdbitacora'
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'mat_bit_key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  }
};

export default config;