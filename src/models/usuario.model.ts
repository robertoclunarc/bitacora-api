import pool from '../config/database';
import { Usuario } from '../types/interfaces';
import bcrypt from 'bcryptjs';

export const findAll = async (): Promise<Usuario[]> => {
  try {
    const [rows] = await pool.query(
      'SELECT login, trabajador, estatus, nivel, fecha_ultima_sesion, nombres, fkarea, email FROM usuarios ORDER BY nombres'
    );
    return rows as Usuario[];
  } catch (error) {
    console.error('Error en findAll usuarios:', error);
    throw error;
  }
};

export const findById = async (login: string): Promise<Usuario | null> => {
  try {
    const [rows]: any = await pool.query(
      'SELECT login, trabajador, estatus, nivel, fecha_ultima_sesion, nombres, fkarea, email FROM usuarios WHERE login = ?',
      [login]
    );
    
    if (rows.length === 0) {
      return null;
    }
    
    return rows[0] as Usuario;
  } catch (error) {
    console.error(`Error en findById usuario ${login}:`, error);
    throw error;
  }
};

export const findByTrabajador = async (cedula: string): Promise<Usuario | null> => {
  try {
    const [rows]: any = await pool.query(
      'SELECT login, trabajador, estatus, nivel, fecha_ultima_sesion, nombres, fkarea, email FROM usuarios WHERE trabajador = ?',
      [cedula]
    );
    
    if (rows.length === 0) {
      return null;
    }
    
    return rows[0] as Usuario;
  } catch (error) {
    console.error(`Error en findByTrabajador trabajador ${cedula}:`, error);
    throw error;
  }
};

export const create = async (usuario: Usuario, password: string): Promise<boolean> => {
  try {
    const { login, trabajador, estatus, nivel, nombres, fkarea, email } = usuario;
    
    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insertar registro en la tabla de usuarios
    await pool.query(
      'INSERT INTO usuarios (login, trabajador, estatus, nivel, nombres, fkarea, email, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [login, trabajador, estatus, nivel, nombres, fkarea, email, hashedPassword]
    );
    
    return true;
  } catch (error) {
    console.error('Error en create usuario:', error);
    throw error;
  }
};

export const update = async (login: string, usuario: Usuario): Promise<boolean> => {
  try {
    const { trabajador, estatus, nivel, nombres, fkarea, email } = usuario;
    
    const [result]: any = await pool.query(
      'UPDATE usuarios SET trabajador = ?, estatus = ?, nivel = ?, nombres = ?, fkarea = ?, email = ? WHERE login = ?',
      [trabajador, estatus, nivel, nombres, fkarea, email, login]
    );
    
    return result.affectedRows > 0;
  } catch (error) {
    console.error(`Error en update usuario ${login}:`, error);
    throw error;
  }
};

export const changePassword = async (login: string, newPassword: string): Promise<boolean> => {
  try {
    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    const [result]: any = await pool.query(
      'UPDATE usuarios SET password = ? WHERE login = ?',
      [hashedPassword, login]
    );
    
    return result.affectedRows > 0;
  } catch (error) {
    console.error(`Error en changePassword usuario ${login}:`, error);
    throw error;
  }
};

export const remove = async (login: string): Promise<boolean> => {
  try {
    const [result]: any = await pool.query('DELETE FROM usuarios WHERE login = ?', [login]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error(`Error en remove usuario ${login}:`, error);
    throw error;
  }
};

export const verifyPassword = async (login: string, password: string): Promise<boolean> => {
  try {
    const [rows]: any = await pool.query(
      'SELECT password FROM usuarios WHERE login = ?',
      [login]
    );
    
    if (rows.length === 0) {
      return false;
    }
    
    const hashedPassword = rows[0].password;
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    console.error(`Error en verifyPassword usuario ${login}:`, error);
    throw error;
  }
};

export const getTotalUsuarios = async (): Promise<number> => {
  try {
    const query = `
      SELECT COUNT(*) AS total
      FROM usuarios
      WHERE estatus ='ACTIVO'
    `;

    const [rows]: any = await pool.query(query);
    return rows[0].total;
  } catch (error) {
    console.error('Error al obtener total de usuarios:', error);
    throw error;
  }
};

export const getActividadUsuarios = async (): Promise<{ total: number, porcentaje: number }> => {
  try {
    // Obtener usuarios activos en las últimas 2 semanas (por ejemplo)
    const query = `
      SELECT 
        COUNT(DISTINCT login) AS usuariosActivos,
        (SELECT COUNT(*) FROM usuarios WHERE estatus='ACTIVO') AS totalUsuarios
      FROM (
        SELECT DISTINCT login FROM bitacora 
        WHERE fecha_hora_registrado >= DATE_SUB(NOW(), INTERVAL 14 DAY)
        UNION
        SELECT DISTINCT login_registrado FROM reuniones 
        WHERE fecha_registrado >= DATE_SUB(NOW(), INTERVAL 14 DAY)
        UNION
        SELECT DISTINCT login_registrado FROM carteleras 
        WHERE fecha_registrado >= DATE_SUB(NOW(), INTERVAL 14 DAY)
        UNION
        SELECT DISTINCT login_registrado FROM tareas 
        WHERE fecha_registrado >= DATE_SUB(NOW(), INTERVAL 14 DAY)
      ) AS usuarios_activos
    `;

    const [rows]: any = await pool.query(query);
    
    const usuariosActivos = rows[0].usuariosActivos || 0;
    const totalUsuarios = rows[0].totalUsuarios || 1; // Evitar división por cero
    
    return {
      total: usuariosActivos,
      porcentaje: Math.round((usuariosActivos / totalUsuarios) * 100)
    };
  } catch (error) {
    console.error('Error al obtener actividad de usuarios:', error);
    throw error;
  }
};