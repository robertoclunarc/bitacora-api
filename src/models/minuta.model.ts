import pool from '../config/database';
import { Minuta } from '../types/interfaces';

export const findAll = async (): Promise<Minuta[]> => {
  try {
    const [rows] = await pool.query('SELECT * FROM minutas ORDER BY idminuta');
    return rows as Minuta[];
  } catch (error) {
    console.error('Error en findAll minutas:', error);
    throw error;
  }
};

export const findById = async (id: number): Promise<Minuta | null> => {
  try {
    const [rows]: any = await pool.query('SELECT * FROM minutas WHERE idminuta = ?', [id]);
    
    if (rows.length === 0) {
      return null;
    }
    
    return rows[0] as Minuta;
  } catch (error) {
    console.error(`Error en findById minuta ${id}:`, error);
    throw error;
  }
};

export const findByReunion = async (reunionId: number): Promise<Minuta[]> => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM minutas WHERE fkreunion = ? ORDER BY idminuta',
      [reunionId]
    );
    return rows as Minuta[];
  } catch (error) {
    console.error(`Error en findByReunion minutas ${reunionId}:`, error);
    throw error;
  }
};

export const create = async (minuta: Minuta): Promise<number> => {
  try {
    const { fkreunion, descripcionminuta, responsable } = minuta;
    const [result]: any = await pool.query(
      'INSERT INTO minutas (fkreunion, descripcionminuta, responsable) VALUES (?, ?, ?)',
      [fkreunion, descripcionminuta, responsable]
    );
    
    return result.insertId;
  } catch (error) {
    console.error('Error en create minuta:', error);
    throw error;
  }
};

export const update = async (id: number, minuta: Minuta): Promise<boolean> => {
  try {
    const { fkreunion, descripcionminuta, responsable } = minuta;
    const [result]: any = await pool.query(
      'UPDATE minutas SET fkreunion = ?, descripcionminuta = ?, responsable = ? WHERE idminuta = ?',
      [fkreunion, descripcionminuta, responsable, id]
    );
    
    return result.affectedRows > 0;
  } catch (error) {
    console.error(`Error en update minuta ${id}:`, error);
    throw error;
  }
};

export const remove = async (id: number): Promise<boolean> => {
  try {
    const [result]: any = await pool.query('DELETE FROM minutas WHERE idminuta = ?', [id]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error(`Error en remove minuta ${id}:`, error);
    throw error;
  }
};