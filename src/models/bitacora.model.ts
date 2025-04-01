import pool from '../config/database';
import { Bitacora } from '../types/interfaces';

export const findAll = async (limit: number = 100, offset: number = 0): Promise<Bitacora[]> => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM bitacora ORDER BY fecha DESC, fecha_hora_registrado DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );
    return rows as Bitacora[];
  } catch (error) {
    console.error('Error en findAll bitacoras:', error);
    throw error;
  }
};

export const findById = async (id: number): Promise<Bitacora | null> => {
  try {
    const [rows]: any = await pool.query('SELECT * FROM bitacora WHERE idbitacora = ?', [id]);
    
    if (rows.length === 0) {
      return null;
    }
    
    return rows[0] as Bitacora;
  } catch (error) {
    console.error(`Error en findById bitacora ${id}:`, error);
    throw error;
  }
};

export const create = async (bitacora: Bitacora): Promise<number> => {
  try {
    const { fecha, turno, login, fkequipo, tema, descripcion, estatus, critico } = bitacora;
    
    const [result]: any = await pool.query(
      'INSERT INTO bitacora (fecha, turno, login, fkequipo, tema, descripcion, estatus, critico) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [fecha, turno, login, fkequipo, tema, descripcion, estatus || 'ACTIVO', critico || false]
    );
    
    return result.insertId;
  } catch (error) {
    console.error('Error en create bitacora:', error);
    throw error;
  }
};

export const update = async (id: number, bitacora: Bitacora): Promise<boolean> => {
  try {
    const { fecha, turno, login, fkequipo, tema, descripcion, estatus, critico } = bitacora;
    
    const [result]: any = await pool.query(
      'UPDATE bitacora SET fecha = ?, turno = ?, login = ?, fkequipo = ?, tema = ?, descripcion = ?, estatus = ?, critico = ? WHERE idbitacora = ?',
      [fecha, turno, login, fkequipo, tema, descripcion, estatus, critico, id]
    );
    
    return result.affectedRows > 0;
  } catch (error) {
    console.error(`Error en update bitacora ${id}:`, error);
    throw error;
  }
};

export const remove = async (id: number): Promise<boolean> => {
  try {
    const [result]: any = await pool.query('DELETE FROM bitacora WHERE idbitacora = ?', [id]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error(`Error en remove bitacora ${id}:`, error);
    throw error;
  }
};

export const search = async (
  criteria: {
    fechaInicio?: string,
    fechaFin?: string,
    turno?: string,
    login?: string,
    fkequipo?: number,
    critico?: boolean,
    keyword?: string
  },
  limit: number = 100,
  offset: number = 0
): Promise<Bitacora[]> => {
  try {
    let query = 'SELECT * FROM bitacora WHERE 1=1';
    const params: any[] = [];

    if (criteria.fechaInicio) {
      query += ' AND fecha >= ?';
      params.push(criteria.fechaInicio);
    }

    if (criteria.fechaFin) {
      query += ' AND fecha <= ?';
      params.push(criteria.fechaFin);
    }

    if (criteria.turno) {
      query += ' AND turno = ?';
      params.push(criteria.turno);
    }

    if (criteria.login) {
      query += ' AND login = ?';
      params.push(criteria.login);
    }

    if (criteria.fkequipo) {
      query += ' AND fkequipo = ?';
      params.push(criteria.fkequipo);
    }

    if (criteria.critico !== undefined) {
      query += ' AND critico = ?';
      params.push(criteria.critico ? 1 : 0);
    }

    if (criteria.keyword) {
      query += ' AND (descripcion LIKE ? OR tema LIKE ?)';
      const keyword = `%${criteria.keyword}%`;
      params.push(keyword, keyword);
    }

    query += ' ORDER BY fecha DESC, fecha_hora_registrado DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await pool.query(query, params);
    return rows as Bitacora[];
  } catch (error) {
    console.error('Error en search bitacoras:', error);
    throw error;
  }
};

export const countBitacoras = async (criteria: {
  fechaInicio?: string,
  fechaFin?: string,
  turno?: string,
  login?: string,
  fkequipo?: number,
  critico?: boolean,
  keyword?: string
}): Promise<number> => {
  try {
    let query = 'SELECT COUNT(*) as total FROM bitacora WHERE 1=1';
    const params: any[] = [];

    if (criteria.fechaInicio) {
      query += ' AND fecha >= ?';
      params.push(criteria.fechaInicio);
    }

    if (criteria.fechaFin) {
      query += ' AND fecha <= ?';
      params.push(criteria.fechaFin);
    }

    if (criteria.turno) {
      query += ' AND turno = ?';
      params.push(criteria.turno);
    }

    if (criteria.login) {
      query += ' AND login = ?';
      params.push(criteria.login);
    }

    if (criteria.fkequipo) {
      query += ' AND fkequipo = ?';
      params.push(criteria.fkequipo);
    }

    if (criteria.critico !== undefined) {
      query += ' AND critico = ?';
      params.push(criteria.critico ? 1 : 0);
    }

    if (criteria.keyword) {
      query += ' AND (descripcion LIKE ? OR tema LIKE ?)';
      const keyword = `%${criteria.keyword}%`;
      params.push(keyword, keyword);
    }

    const [rows]: any = await pool.query(query, params);
    return rows[0].total;
  } catch (error) {
    console.error('Error en countBitacoras:', error);
    throw error;
  }
};