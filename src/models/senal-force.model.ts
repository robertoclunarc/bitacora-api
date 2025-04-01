import pool from '../config/database';
import { SenalForce } from '../types/interfaces';

export const findAll = async (): Promise<SenalForce[]> => {
  try {
    const [rows] = await pool.query('SELECT * FROM senales_force ORDER BY descripcion');
    return rows as SenalForce[];
  } catch (error) {
    console.error('Error en findAll senales_force:', error);
    throw error;
  }
};

export const findById = async (id: number): Promise<SenalForce | null> => {
  try {
    const [rows]: any = await pool.query('SELECT * FROM senales_force WHERE idsenal = ?', [id]);
    
    if (rows.length === 0) {
      return null;
    }
    
    return rows[0] as SenalForce;
  } catch (error) {
    console.error(`Error en findById senal_force ${id}:`, error);
    throw error;
  }
};

export const create = async (senalForce: SenalForce): Promise<number> => {
  try {
    const { descripcion } = senalForce;
    const [result]: any = await pool.query(
      'INSERT INTO senales_force (descripcion) VALUES (?)',
      [descripcion]
    );
    
    return result.insertId;
  } catch (error) {
    console.error('Error en create senal_force:', error);
    throw error;
  }
};

export const update = async (id: number, senalForce: SenalForce): Promise<boolean> => {
  try {
    const { descripcion } = senalForce;
    const [result]: any = await pool.query(
      'UPDATE senales_force SET descripcion = ? WHERE idsenal = ?',
      [descripcion, id]
    );
    
    return result.affectedRows > 0;
  } catch (error) {
    console.error(`Error en update senal_force ${id}:`, error);
    throw error;
  }
};

export const remove = async (id: number): Promise<boolean> => {
  try {
    // Verificar si la señal está siendo utilizada en algún force
    const [forces]: any = await pool.query('SELECT COUNT(*) as count FROM force WHERE fksenal = ?', [id]);
    
    if (forces[0].count > 0) {
      throw new Error('No se puede eliminar esta señal porque está siendo utilizada en registros de force');
    }
    
    const [result]: any = await pool.query('DELETE FROM senales_force WHERE idsenal = ?', [id]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error(`Error en remove senal_force ${id}:`, error);
    throw error;
  }
};

export const search = async (descripcion: string): Promise<SenalForce[]> => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM senales_force WHERE descripcion LIKE ? ORDER BY descripcion',
      [`%${descripcion}%`]
    );
    return rows as SenalForce[];
  } catch (error) {
    console.error(`Error en search senales_force ${descripcion}:`, error);
    throw error;
  }
};