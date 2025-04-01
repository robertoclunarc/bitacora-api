import pool from '../config/database';
import { IntegranteReunion } from '../types/interfaces';

export const findAll = async (): Promise<IntegranteReunion[]> => {
  try {
    const [rows] = await pool.query('SELECT * FROM integrantes_reuniones ORDER BY idintegrantereunion');
    return rows as IntegranteReunion[];
  } catch (error) {
    console.error('Error en findAll integrantes_reuniones:', error);
    throw error;
  }
};

export const findById = async (id: number): Promise<IntegranteReunion | null> => {
  try {
    const [rows]: any = await pool.query('SELECT * FROM integrantes_reuniones WHERE idintegrantereunion = ?', [id]);
    
    if (rows.length === 0) {
      return null;
    }
    
    return rows[0] as IntegranteReunion;
  } catch (error) {
    console.error(`Error en findById integrante_reunion ${id}:`, error);
    throw error;
  }
};

export const findByReunion = async (reunionId: number): Promise<IntegranteReunion[]> => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM integrantes_reuniones WHERE fkreunion = ? ORDER BY nombres_apellidos_integrante',
      [reunionId]
    );
    return rows as IntegranteReunion[];
  } catch (error) {
    console.error(`Error en findByReunion integrantes_reuniones ${reunionId}:`, error);
    throw error;
  }
};

export const create = async (integranteReunion: IntegranteReunion): Promise<number> => {
  try {
    const { fkreunion, nombres_apellidos_integrante, asistio } = integranteReunion;
    const [result]: any = await pool.query(
      'INSERT INTO integrantes_reuniones (fkreunion, nombres_apellidos_integrante, asistio) VALUES (?, ?, ?)',
      [fkreunion, nombres_apellidos_integrante, asistio || false]
    );
    
    return result.insertId;
  } catch (error) {
    console.error('Error en create integrante_reunion:', error);
    throw error;
  }
};

export const update = async (id: number, integranteReunion: IntegranteReunion): Promise<boolean> => {
  try {
    const { fkreunion, nombres_apellidos_integrante, asistio } = integranteReunion;
    const [result]: any = await pool.query(
      'UPDATE integrantes_reuniones SET fkreunion = ?, nombres_apellidos_integrante = ?, asistio = ? WHERE idintegrantereunion = ?',
      [fkreunion, nombres_apellidos_integrante, asistio, id]
    );
    
    return result.affectedRows > 0;
  } catch (error) {
    console.error(`Error en update integrante_reunion ${id}:`, error);
    throw error;
  }
};

export const remove = async (id: number): Promise<boolean> => {
  try {
    const [result]: any = await pool.query('DELETE FROM integrantes_reuniones WHERE idintegrantereunion = ?', [id]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error(`Error en remove integrante_reunion ${id}:`, error);
    throw error;
  }
};

export const markAttendance = async (id: number, asistio: boolean): Promise<boolean> => {
  try {
    const [result]: any = await pool.query(
      'UPDATE integrantes_reuniones SET asistio = ? WHERE idintegrantereunion = ?',
      [asistio, id]
    );
    
    return result.affectedRows > 0;
  } catch (error) {
    console.error(`Error en markAttendance integrante_reunion ${id}:`, error);
    throw error;
  }
};

export const bulkCreate = async (integrantesReunion: IntegranteReunion[]): Promise<boolean> => {
  try {
    const values = integrantesReunion.map(integrante => [
      integrante.fkreunion,
      integrante.nombres_apellidos_integrante,
      integrante.asistio || false
    ]);
    
    if (values.length === 0) {
      return false;
    }
    
    const placeholders = values.map(() => '(?, ?, ?)').join(', ');
    const flatValues = values.flat();
    
    await pool.query(
      `INSERT INTO integrantes_reuniones (fkreunion, nombres_apellidos_integrante, asistio) VALUES ${placeholders}`,
      flatValues
    );
    
    return true;
  } catch (error) {
    console.error('Error en bulkCreate integrantes_reunion:', error);
    throw error;
  }
};