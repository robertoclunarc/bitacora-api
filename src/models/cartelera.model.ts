import pool from '../config/database';
import { Cartelera } from '../types/interfaces';

export const findAll = async (limit: number = 100, offset: number = 0): Promise<Cartelera[]> => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM carteleras ORDER BY fecha_registrado DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );
    return rows as Cartelera[];
  } catch (error) {
    console.error('Error en findAll carteleras:', error);
    throw error;
  }
};

export const findById = async (id: number): Promise<Cartelera | null> => {
  try {
    const [rows]: any = await pool.query('SELECT * FROM carteleras WHERE idcartelera = ?', [id]);
    
    if (rows.length === 0) {
      return null;
    }
    
    return rows[0] as Cartelera;
  } catch (error) {
    console.error(`Error en findById cartelera ${id}:`, error);
    throw error;
  }
};

export const findByArea = async (areaId: number, limit: number = 100, offset: number = 0): Promise<Cartelera[]> => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM carteleras WHERE fkarea = ? ORDER BY fecha_registrado DESC LIMIT ? OFFSET ?',
      [areaId, limit, offset]
    );
    return rows as Cartelera[];
  } catch (error) {
    console.error(`Error en findByArea carteleras ${areaId}:`, error);
    throw error;
  }
};

export const findActive = async (limit: number = 100, offset: number = 0): Promise<Cartelera[]> => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM carteleras 
       WHERE estatus = 'ACTIVO' 
       AND CURRENT_DATE() BETWEEN fecha_inicio_publicacion AND fecha_fin_publicacion 
       ORDER BY fecha_registrado DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    return rows as Cartelera[];
  } catch (error) {
    console.error('Error en findActive carteleras:', error);
    throw error;
  }
};

export const create = async (cartelera: Cartelera): Promise<number> => {
  try {
    const {
      fkarea,
      descripcion,
      login_registrado,
      fecha_inicio_publicacion,
      fecha_fin_publicacion,
      estatus
    } = cartelera;
    
    const [result]: any = await pool.query(
      `INSERT INTO carteleras (
        fkarea, descripcion, login_registrado, fecha_inicio_publicacion, 
        fecha_fin_publicacion, estatus
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        fkarea, 
        descripcion, 
        login_registrado, 
        fecha_inicio_publicacion, 
        fecha_fin_publicacion, 
        estatus || 'ACTIVO'
      ]
    );
    
    return result.insertId;
  } catch (error) {
    console.error('Error en create cartelera:', error);
    throw error;
  }
};

export const update = async (id: number, cartelera: Cartelera): Promise<boolean> => {
  try {
    const {
      fkarea,
      descripcion,
      fecha_inicio_publicacion,
      fecha_fin_publicacion,
      estatus
    } = cartelera;
    
    const [result]: any = await pool.query(
      `UPDATE carteleras SET 
        fkarea = ?, 
        descripcion = ?, 
        fecha_inicio_publicacion = ?, 
        fecha_fin_publicacion = ?, 
        estatus = ? 
      WHERE idcartelera = ?`,
      [
        fkarea, 
        descripcion, 
        fecha_inicio_publicacion, 
        fecha_fin_publicacion, 
        estatus, 
        id
      ]
    );
    
    return result.affectedRows > 0;
  } catch (error) {
    console.error(`Error en update cartelera ${id}:`, error);
    throw error;
  }
};

export const remove = async (id: number): Promise<boolean> => {
  try {
    const [result]: any = await pool.query('DELETE FROM carteleras WHERE idcartelera = ?', [id]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error(`Error en remove cartelera ${id}:`, error);
    throw error;
  }
};

export const search = async (
  criteria: {
    fkarea?: number,
    estatus?: string,
    fechaInicio?: string,
    fechaFin?: string,
    keyword?: string
  },
  limit: number = 100,
  offset: number = 0
): Promise<Cartelera[]> => {
  try {
    let query = 'SELECT * FROM carteleras WHERE 1=1';
    const params: any[] = [];

    if (criteria.fkarea) {
      query += ' AND fkarea = ?';
      params.push(criteria.fkarea);
    }

    if (criteria.estatus) {
      query += ' AND estatus = ?';
      params.push(criteria.estatus);
    }

    if (criteria.fechaInicio) {
      query += ' AND fecha_inicio_publicacion >= ?';
      params.push(criteria.fechaInicio);
    }

    if (criteria.fechaFin) {
      query += ' AND fecha_fin_publicacion <= ?';
      params.push(criteria.fechaFin);
    }

    if (criteria.keyword) {
      query += ' AND descripcion LIKE ?';
      params.push(`%${criteria.keyword}%`);
    }

    query += ' ORDER BY fecha_registrado DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await pool.query(query, params);
    return rows as Cartelera[];
  } catch (error) {
    console.error('Error en search carteleras:', error);
    throw error;
  }
};

export const countCarteleras = async (criteria: {
  fkarea?: number,
  estatus?: string,
  fechaInicio?: string,
  fechaFin?: string,
  keyword?: string
}): Promise<number> => {
  try {
    let query = 'SELECT COUNT(*) as total FROM carteleras WHERE 1=1';
    const params: any[] = [];

    if (criteria.fkarea) {
      query += ' AND fkarea = ?';
      params.push(criteria.fkarea);
    }

    if (criteria.estatus) {
      query += ' AND estatus = ?';
      params.push(criteria.estatus);
    }

    if (criteria.fechaInicio) {
      query += ' AND fecha_inicio_publicacion >= ?';
      params.push(criteria.fechaInicio);
    }

    if (criteria.fechaFin) {
      query += ' AND fecha_fin_publicacion <= ?';
      params.push(criteria.fechaFin);
    }

    if (criteria.keyword) {
      query += ' AND descripcion LIKE ?';
      params.push(`%${criteria.keyword}%`);
    }

    const [rows]: any = await pool.query(query, params);
    return rows[0].total;
  } catch (error) {
    console.error('Error en countCarteleras:', error);
    throw error;
  }
};