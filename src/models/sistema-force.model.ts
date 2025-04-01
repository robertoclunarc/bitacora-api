import pool from '../config/database';
import { SistemaForce } from '../types/interfaces';

export const findAll = async (): Promise<SistemaForce[]> => {
  try {
    const [rows] = await pool.query('SELECT * FROM sistemas_force ORDER BY descripcion');
    return rows as SistemaForce[];
  } catch (error) {
    console.error('Error en findAll sistemas_force:', error);
    throw error;
  }
};

export const findById = async (id: number): Promise<SistemaForce | null> => {
  try {
    const [rows]: any = await pool.query('SELECT * FROM sistemas_force WHERE idsistema = ?', [id]);
    
    if (rows.length === 0) {
      return null;
    }
    
    return rows[0] as SistemaForce;
  } catch (error) {
    console.error(`Error en findById sistema_force ${id}:`, error);
    throw error;
  }
};

export const create = async (sistemaForce: SistemaForce): Promise<number> => {
  try {
    const { descripcion } = sistemaForce;
    const [result]: any = await pool.query(
      'INSERT INTO sistemas_force (descripcion) VALUES (?)',
      [descripcion]
    );
    
    return result.insertId;
  } catch (error) {
    console.error('Error en create sistema_force:', error);
    throw error;
  }
};

export const update = async (id: number, sistemaForce: SistemaForce): Promise<boolean> => {
  try {
    const { descripcion } = sistemaForce;
    const [result]: any = await pool.query(
      'UPDATE sistemas_force SET descripcion = ? WHERE idsistema = ?',
      [descripcion, id]
    );
    
    return result.affectedRows > 0;
  } catch (error) {
    console.error(`Error en update sistema_force ${id}:`, error);
    throw error;
  }
};

export const remove = async (id: number): Promise<boolean> => {
  try {
    // Verificar si el sistema está siendo utilizado en algún force
    const [forces]: any = await pool.query('SELECT COUNT(*) as count FROM force WHERE fksistema = ?', [id]);
    
    if (forces[0].count > 0) {
      throw new Error('No se puede eliminar este sistema porque está siendo utilizado en registros de force');
    }
    
    const [result]: any = await pool.query('DELETE FROM sistemas_force WHERE idsistema = ?', [id]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error(`Error en remove sistema_force ${id}:`, error);
    throw error;
  }
};

export const search = async (descripcion: string): Promise<SistemaForce[]> => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM sistemas_force WHERE descripcion LIKE ? ORDER BY descripcion',
      [`%${descripcion}%`]
    );
    return rows as SistemaForce[];
  } catch (error) {
    console.error(`Error en search sistemas_force ${descripcion}:`, error);
    throw error;
  }
};