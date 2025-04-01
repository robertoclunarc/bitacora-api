import pool from '../config/database';
import { Area } from '../types/interfaces';

export const findAll = async (): Promise<Area[]> => {
  try {
    const [rows] = await pool.query('SELECT * FROM areas ORDER BY nombrearea');
    return rows as Area[];
  } catch (error) {
    console.error('Error en findAll areas:', error);
    throw error;
  }
};

export const findById = async (id: number): Promise<Area | null> => {
  try {
    const [rows]: any = await pool.query('SELECT * FROM areas WHERE idarea = ?', [id]);
    
    if (rows.length === 0) {
      return null;
    }
    
    return rows[0] as Area;
  } catch (error) {
    console.error(`Error en findById area ${id}:`, error);
    throw error;
  }
};

export const create = async (area: Area): Promise<number> => {
  try {
    const { nombrearea, estatusarea, responsable } = area;
    const [result]: any = await pool.query(
      'INSERT INTO areas (nombrearea, estatusarea, responsable) VALUES (?, ?, ?)',
      [nombrearea, estatusarea, responsable]
    );
    
    return result.insertId;
  } catch (error) {
    console.error('Error en create area:', error);
    throw error;
  }
};

export const update = async (id: number, area: Area): Promise<boolean> => {
  try {
    const { nombrearea, estatusarea, responsable } = area;
    const [result]: any = await pool.query(
      'UPDATE areas SET nombrearea = ?, estatusarea = ?, responsable = ? WHERE idarea = ?',
      [nombrearea, estatusarea, responsable, id]
    );
    
    return result.affectedRows > 0;
  } catch (error) {
    console.error(`Error en update area ${id}:`, error);
    throw error;
  }
};

export const remove = async (id: number): Promise<boolean> => {
  try {
    const [result]: any = await pool.query('DELETE FROM areas WHERE idarea = ?', [id]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error(`Error en remove area ${id}:`, error);
    throw error;
  }
};