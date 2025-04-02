import bcrypt from 'bcryptjs';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import pool from '../config/database';
import { Usuario, AuthUser } from '../types/interfaces';
import config from '../config/config';

const JWT_SECRET: Secret = config.jwt.secret;
const JWT_EXPIRES_IN = (config.jwt.expiresIn) as SignOptions["expiresIn"];

export const loginUser = async (login: string, password: string): Promise<{ token: string, user: AuthUser } | null> => {
  try {
    const [rows]: any = await pool.execute(
      'SELECT login, trabajador, estatus, nivel, nombres, fkarea, email, password FROM usuarios WHERE login = ?',
      [login]
    );

    if (rows.length === 0) {
      return null;
    }

    const user = rows[0] as Usuario;
    
    // En un caso real, aquí verificarías la contraseña hasheada
    
    const passwordMatch = user.password ? await bcrypt.compare(password, user.password) : false;
    
    if (!passwordMatch) {
      return null;
    }

    // Actualizar fecha de última sesión
    await pool.execute(
      'UPDATE usuarios SET fecha_ultima_sesion = NOW() WHERE login = ?',
      [login]
    );

    const userForToken: AuthUser = {
      login: user.login,
      nombres: user.nombres,
      nivel: user.nivel,
      fkarea: user.fkarea
    };

    const options: SignOptions = { expiresIn: JWT_EXPIRES_IN };

    const token = jwt.sign(
      userForToken,
      JWT_SECRET,
      options
    );

    return { token, user: userForToken };
  } catch (error) {
    console.error('Error en login:', error);
    return null;
  }
};

export const changePassword = async (
  login: string, 
  currentPassword: string, 
  newPassword: string
): Promise<boolean> => {
  try {
    // Aquí verificarías la contraseña actual contra la almacenada en la BD
    // Este es un código simulado - en un sistema real, verificarías contra el hash almacenado
    const passwordMatch = await bcrypt.compare(currentPassword, '$2a$10$randomhashhere');
    
    if (!passwordMatch) {
      return false;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Aquí actualizarías la contraseña en la BD
    // Esta implementación es simulada - en un sistema real, tendrías una columna para la contraseña
    // await pool.execute(
    //   'UPDATE usuarios SET password = ? WHERE login = ?',
    //   [hashedPassword, login]
    // );

    return true;
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    return false;
  }
};