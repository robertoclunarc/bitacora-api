import pool from '../config/database';
import { Force } from '../types/interfaces';

export const findAll = async (limit: number = 100, offset: number = 0): Promise<Force[]> => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM force ORDER BY fecha_registrado DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );
    return rows as Force[];
  } catch (error) {
    console.error('Error en findAll force:', error);
    throw error;
  }
};

export const findById = async (id: number): Promise<Force | null> => {
  try {
    const [rows]: any = await pool.query('SELECT * FROM force WHERE idforce = ?', [id]);
    
    if (rows.length === 0) {
      return null;
    }
    
    return rows[0] as Force;
  } catch (error) {
    console.error(`Error en findById force ${id}:`, error);
    throw error;
  }
};

export const findBySistema = async (sistemaId: number, limit: number = 100, offset: number = 0): Promise<Force[]> => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM force WHERE fksistema = ? ORDER BY fecha_registrado DESC LIMIT ? OFFSET ?',
      [sistemaId, limit, offset]
    );
    return rows as Force[];
  } catch (error) {
    console.error(`Error en findBySistema force ${sistemaId}:`, error);
    throw error;
  }
};

export const findBySenal = async (senalId: number, limit: number = 100, offset: number = 0): Promise<Force[]> => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM force WHERE fksenal = ? ORDER BY fecha_registrado DESC LIMIT ? OFFSET ?',
      [senalId, limit, offset]
    );
    return rows as Force[];
  } catch (error) {
    console.error(`Error en findBySenal force ${senalId}:`, error);
    throw error;
  }
};

export const create = async (force: Force): Promise<number> => {
  try {
    const {
      fksenal,
      fksistema,
      causas,
      valor,
      solicitado_por,
      autorizado_por,
      ejecutor_por,
      tipoforce,
      estatusforce,
      login_registrado
    } = force;
    
    const [result]: any = await pool.query(
      `INSERT INTO force (
        fksenal, fksistema, causas, valor, solicitado_por, 
        autorizado_por, ejecutor_por, tipoforce, estatusforce, 
        login_registrado
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        fksenal, 
        fksistema, 
        causas, 
        valor, 
        solicitado_por, 
        autorizado_por, 
        ejecutor_por, 
        tipoforce, 
        estatusforce || 'ACTIVO', 
        login_registrado
      ]
    );
    
    return result.insertId;
  } catch (error) {
    console.error('Error en create force:', error);
    throw error;
  }
};

export const update = async (id: number, force: Force): Promise<boolean> => {
  try {
    const {
      fksenal,
      fksistema,
      causas,
      valor,
      solicitado_por,
      autorizado_por,
      ejecutor_por,
      tipoforce,
      estatusforce,
      login_modificacion
    } = force;
    
    const [result]: any = await pool.query(
      `UPDATE force SET 
        fksenal = ?, 
        fksistema = ?, 
        causas = ?, 
        valor = ?, 
        solicitado_por = ?, 
        autorizado_por = ?, 
        ejecutor_por = ?, 
        tipoforce = ?, 
        estatusforce = ?,
        fecha_modificacion = NOW(),
        login_modificacion = ?
      WHERE idforce = ?`,
      [
        fksenal, 
        fksistema, 
        causas, 
        valor, 
        solicitado_por, 
        autorizado_por, 
        ejecutor_por, 
        tipoforce, 
        estatusforce,
        login_modificacion,
        id
      ]
    );
    
    return result.affectedRows > 0;
  } catch (error) {
    console.error(`Error en update force ${id}:`, error);
    throw error;
  }
};

export const updateStatus = async (id: number, estatusforce: string, login_modificacion: string): Promise<boolean> => {
  try {
    const [result]: any = await pool.query(
      `UPDATE force SET 
        estatusforce = ?,
        fecha_modificacion = NOW(),
        login_modificacion = ?
      WHERE idforce = ?`,
      [estatusforce, login_modificacion, id]
    );
    
    return result.affectedRows > 0;
  } catch (error) {
    console.error(`Error en updateStatus force ${id}:`, error);
    throw error;
  }
};

export const remove = async (id: number): Promise<boolean> => {
  try {
    const [result]: any = await pool.query('DELETE FROM force WHERE idforce = ?', [id]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error(`Error en remove force ${id}:`, error);
    throw error;
  }
};

export const search = async (
  criteria: {
    fksenal?: number,
    fksistema?: number,
    tipoforce?: string,
    estatusforce?: string,
    solicitado_por?: string,
    autorizado_por?: string,
    ejecutor_por?: string,
    fechaInicio?: string,
    fechaFin?: string,
    keyword?: string
  },
  limit: number = 100,
  offset: number = 0
): Promise<Force[]> => {
  try {
    let query = 'SELECT * FROM force WHERE 1=1';
    const params: any[] = [];

    if (criteria.fksenal) {
      query += ' AND fksenal = ?';
      params.push(criteria.fksenal);
    }

    if (criteria.fksistema) {
      query += ' AND fksistema = ?';
      params.push(criteria.fksistema);
    }

    if (criteria.tipoforce) {
      query += ' AND tipoforce = ?';
      params.push(criteria.tipoforce);
    }

    if (criteria.estatusforce) {
      query += ' AND estatusforce = ?';
      params.push(criteria.estatusforce);
    }

    if (criteria.solicitado_por) {
      query += ' AND solicitado_por LIKE ?';
      params.push(`%${criteria.solicitado_por}%`);
    }

    if (criteria.autorizado_por) {
      query += ' AND autorizado_por LIKE ?';
      params.push(`%${criteria.autorizado_por}%`);
    }

    if (criteria.ejecutor_por) {
      query += ' AND ejecutor_por LIKE ?';
      params.push(`%${criteria.ejecutor_por}%`);
    }

    if (criteria.fechaInicio) {
      query += ' AND fecha_registrado >= ?';
      params.push(criteria.fechaInicio);
    }

    if (criteria.fechaFin) {
      query += ' AND fecha_registrado <= ?';
      params.push(criteria.fechaFin);
    }

    if (criteria.keyword) {
      query += ' AND (causas LIKE ? OR solicitado_por LIKE ? OR autorizado_por LIKE ? OR ejecutor_por LIKE ?)';
      const keyword = `%${criteria.keyword}%`;
      params.push(keyword, keyword, keyword, keyword);
    }

    query += ' ORDER BY fecha_registrado DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await pool.query(query, params);
    return rows as Force[];
  } catch (error) {
    console.error('Error en search force:', error);
    throw error;
  }
};

export const countForce = async (criteria: {
  fksenal?: number,
  fksistema?: number,
  tipoforce?: string,
  estatusforce?: string,
  solicitado_por?: string,
  autorizado_por?: string,
  ejecutor_por?: string,
  fechaInicio?: string,
  fechaFin?: string,
  keyword?: string
}): Promise<number> => {
  try {
    let query = 'SELECT COUNT(*) as total FROM force WHERE 1=1';
    const params: any[] = [];

    if (criteria.fksenal) {
      query += ' AND fksenal = ?';
      params.push(criteria.fksenal);
    }

    if (criteria.fksistema) {
      query += ' AND fksistema = ?';
      params.push(criteria.fksistema);
    }

    if (criteria.tipoforce) {
      query += ' AND tipoforce = ?';
      params.push(criteria.tipoforce);
    }

    if (criteria.estatusforce) {
      query += ' AND estatusforce = ?';
      params.push(criteria.estatusforce);
    }

    if (criteria.solicitado_por) {
      query += ' AND solicitado_por LIKE ?';
      params.push(`%${criteria.solicitado_por}%`);
    }

    if (criteria.autorizado_por) {
      query += ' AND autorizado_por LIKE ?';
      params.push(`%${criteria.autorizado_por}%`);
    }

    if (criteria.ejecutor_por) {
      query += ' AND ejecutor_por LIKE ?';
      params.push(`%${criteria.ejecutor_por}%`);
    }

    if (criteria.fechaInicio) {
      query += ' AND fecha_registrado >= ?';
      params.push(criteria.fechaInicio);
    }

    if (criteria.fechaFin) {
      query += ' AND fecha_registrado <= ?';
      params.push(criteria.fechaFin);
    }

    if (criteria.keyword) {
      query += ' AND (causas LIKE ? OR solicitado_por LIKE ? OR autorizado_por LIKE ? OR ejecutor_por LIKE ?)';
      const keyword = `%${criteria.keyword}%`;
      params.push(keyword, keyword, keyword, keyword);
    }

    const [rows]: any = await pool.query(query, params);
    return rows[0].total;
  } catch (error) {
    console.error('Error en countForce:', error);
    throw error;
  }
};