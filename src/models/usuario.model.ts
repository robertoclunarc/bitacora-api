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