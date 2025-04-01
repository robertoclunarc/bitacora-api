import pool from '../config/database';
import { MenuUsuario } from '../types/interfaces';

export const findAll = async (): Promise<MenuUsuario[]> => {
  try {
    const [rows] = await pool.query('SELECT * FROM menus_usuarios');
    return rows as MenuUsuario[];
  } catch (error) {
    console.error('Error en findAll menus_usuarios:', error);
    throw error;
  }
};

export const findByIdAndLogin = async (idmenu: number, login: string): Promise<MenuUsuario | null> => {
  try {
    const [rows]: any = await pool.query(
      'SELECT * FROM menus_usuarios WHERE idmenu = ? AND login = ?',
      [idmenu, login]
    );
    
    if (rows.length === 0) {
      return null;
    }
    
    return rows[0] as MenuUsuario;
  } catch (error) {
    console.error(`Error en findByIdAndLogin menu ${idmenu}, login ${login}:`, error);
    throw error;
  }
};

export const findByMenu = async (idmenu: number): Promise<MenuUsuario[]> => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM menus_usuarios WHERE idmenu = ?',
      [idmenu]
    );
    return rows as MenuUsuario[];
  } catch (error) {
    console.error(`Error en findByMenu ${idmenu}:`, error);
    throw error;
  }
};

export const findByLogin = async (login: string): Promise<MenuUsuario[]> => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM menus_usuarios WHERE login = ?',
      [login]
    );
    return rows as MenuUsuario[];
  } catch (error) {
    console.error(`Error en findByLogin ${login}:`, error);
    throw error;
  }
};

export const create = async (menuUsuario: MenuUsuario): Promise<boolean> => {
  try {
    const {
      idmenu,
      login,
      pupdate,
      pinsert,
      pdelete,
      pselect,
      export: exportPermission,
      estatus
    } = menuUsuario;
    
    await pool.query(
      `INSERT INTO menus_usuarios (
        idmenu, login, pupdate, pinsert, pdelete, pselect, export, estatus
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        idmenu,
        login,
        pupdate,
        pinsert,
        pdelete,
        pselect,
        exportPermission,
        estatus || 'ACTIVO'
      ]
    );
    
    return true;
  } catch (error) {
    console.error('Error en create menu_usuario:', error);
    throw error;
  }
};

export const update = async (idmenu: number, login: string, menuUsuario: MenuUsuario): Promise<boolean> => {
  try {
    const {
      pupdate,
      pinsert,
      pdelete,
      pselect,
      export: exportPermission,
      estatus
    } = menuUsuario;
    
    const [result]: any = await pool.query(
      `UPDATE menus_usuarios SET 
        pupdate = ?, pinsert = ?, pdelete = ?, pselect = ?, export = ?, estatus = ?
      WHERE idmenu = ? AND login = ?`,
      [
        pupdate,
        pinsert,
        pdelete,
        pselect,
        exportPermission,
        estatus,
        idmenu,
        login
      ]
    );
    
    return result.affectedRows > 0;
  } catch (error) {
    console.error(`Error en update menu_usuario ${idmenu}, ${login}:`, error);
    throw error;
  }
};

export const remove = async (idmenu: number, login: string): Promise<boolean> => {
  try {
    const [result]: any = await pool.query(
      'DELETE FROM menus_usuarios WHERE idmenu = ? AND login = ?',
      [idmenu, login]
    );
    return result.affectedRows > 0;
  } catch (error) {
    console.error(`Error en remove menu_usuario ${idmenu}, ${login}:`, error);
    throw error;
  }
};

export const bulkAssign = async (menuIds: number[], login: string, defaultPermissions: {
  pupdate: boolean,
  pinsert: boolean,
  pdelete: boolean,
  pselect: boolean,
  export?: boolean,
  estatus: string
}): Promise<boolean> => {
  try {
    // Eliminar asignaciones existentes para este usuario
    await pool.query('DELETE FROM menus_usuarios WHERE login = ?', [login]);
    
    if (menuIds.length === 0) {
      return true; // No hay menús para asignar
    }
    
    // Preparar valores para inserción masiva
    const values = menuIds.map(idmenu => [
      idmenu,
      login,
      defaultPermissions.pupdate,
      defaultPermissions.pinsert,
      defaultPermissions.pdelete,
      defaultPermissions.pselect,
      defaultPermissions.export || false,
      defaultPermissions.estatus || 'ACTIVO'
    ]);
    
    const placeholders = values.map(() => '(?, ?, ?, ?, ?, ?, ?, ?)').join(', ');
    const flatValues = values.flat();
    
    await pool.query(
      `INSERT INTO menus_usuarios (
        idmenu, login, pupdate, pinsert, pdelete, pselect, export, estatus
      ) VALUES ${placeholders}`,
      flatValues
    );
    
    return true;
  } catch (error) {
    console.error(`Error en bulkAssign para usuario ${login}:`, error);
    throw error;
  }
};

export const getUserMenusWithDetails = async (login: string): Promise<any[]> => {
  try {
    const [rows] = await pool.query(
      `SELECT mu.*, m.name, m.url, m.icon, m.idpadre
       FROM menus_usuarios mu
       INNER JOIN menus m ON mu.idmenu = m.idmenu
       WHERE mu.login = ? AND mu.estatus = 'ACTIVO' AND m.estatus = true
       ORDER BY m.orden, m.idpadre NULLS FIRST, m.idmenu`,
      [login]
    );
    return rows as any[];
  } catch (error) {
    console.error(`Error en getUserMenusWithDetails ${login}:`, error);
    throw error;
  }
};