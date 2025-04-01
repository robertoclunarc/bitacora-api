import mysql from 'mysql2/promise';
import config from './config';

const pool = mysql.createPool({
  host: config.database.host,
  user: config.database.user,
  password: config.database.password,
  database: config.database.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Función para verificar la conexión
export const testConnection = async (): Promise<void> => {
  try {
    const connection = await pool.getConnection();
    console.log('Connection to database established successfully');
    connection.release();
  } catch (err) {
    console.error('Error connecting to database:', err);
    throw err;
  }
};

export default pool;