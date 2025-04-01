import pool from '../config/database';
import { Equipo } from '../types/interfaces';

export const findAll = async (): Promise<Equipo[]> => {
  try {
    const [rows] = await pool.query('SELECT * FROM equipos ORDER BY descripcion_equipo');
    return rows as Equipo[];
  } catch (error) {
    console.error('Error en findAll equipos:', error);
    throw error;
  }
};

export const findById = async (id: number): Promise<Equipo | null> => {
  try {
    const [rows]: any = await pool.query('SELECT * FROM equipos WHERE idequipo = ?', [id]);
    
    if (rows.length === 0) {
      return null;
    }
    
    return rows[0] as Equipo;
  } catch (error) {
    console.error(`Error en findById equipo ${id}:`, error);
    throw error;
  }
};

export const findByArea = async (areaId: number): Promise<Equipo[]> => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM equipos WHERE fkarea = ? ORDER BY descripcion_equipo',
      [areaId]
    );
    return rows as Equipo[];
  } catch (error) {
    console.error(`Error en findByArea equipos ${areaId}:`, error);
    throw error;
  }
};

export const create = async (equipo: Equipo): Promise<number> => {
  try {
    const { fkarea, descripcion_equipo, codigo_sap } = equipo;
    const [result]: any = await pool.query(
      'INSERT INTO equipos (fkarea, descripcion_equipo, codigo_sap) VALUES (?, ?, ?)',
      [fkarea, descripcion_equipo, codigo_sap]
    );
    
    return result.insertId;
  } catch (error) {
    console.error('Error en create equipo:', error);
    throw error;
  }
};

export const update = async (id: number, equipo: Equipo): Promise<boolean> => {
  try {
    const { fkarea, descripcion_equipo, codigo_sap } = equipo;
    const [result]: any = await pool.query(
      'UPDATE equipos SET fkarea = ?, descripcion_equipo = ?, codigo_sap = ? WHERE idequipo = ?',
      [fkarea, descripcion_equipo, codigo_sap, id]
    );
    
    return result.affectedRows > 0;
  } catch (error) {
    console.error(`Error en update equipo ${id}:`, error);
    throw error;
  }
};

export const remove = async (id: number): Promise<boolean> => {
  try {
    const [result]: any = await pool.query('DELETE FROM equipos WHERE idequipo = ?', [id]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error(`Error en remove equipo ${id}:`, error);
    throw error;
  }
};