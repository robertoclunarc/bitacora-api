import pool from '../config/database';
import { Reunion } from '../types/interfaces';

export const findAll = async (limit: number = 100, offset: number = 0): Promise<Reunion[]> => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM reuniones ORDER BY fecha_inicio DESC, hora_inicio DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );
    return rows as Reunion[];
  } catch (error) {
    console.error('Error en findAll reuniones:', error);
    throw error;
  }
};

export const findById = async (id: number): Promise<Reunion | null> => {
  try {
    const [rows]: any = await pool.query('SELECT * FROM reuniones WHERE idreunion = ?', [id]);
    
    if (rows.length === 0) {
      return null;
    }
    
    return rows[0] as Reunion;
  } catch (error) {
    console.error(`Error en findById reunion ${id}:`, error);
    throw error;
  }
};

export const findByArea = async (areaId: number, limit: number = 100, offset: number = 0): Promise<Reunion[]> => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM reuniones WHERE fkarea = ? ORDER BY fecha_inicio DESC, hora_inicio DESC LIMIT ? OFFSET ?',
      [areaId, limit, offset]
    );
    return rows as Reunion[];
  } catch (error) {
    console.error(`Error en findByArea reuniones ${areaId}:`, error);
    throw error;
  }
};

export const create = async (reunion: Reunion): Promise<number> => {
  try {
    const {
      tema,
      fkarea,
      fecha_inicio,
      hora_inicio,
      fecha_fin,
      horafin,
      login_registrado,
      estatus,
      lugar,
      responsable,
      tipo
    } = reunion;
    
    const [result]: any = await pool.query(
      `INSERT INTO reuniones (
        tema, fkarea, fecha_inicio, hora_inicio, fecha_fin, horafin, 
        login_registrado, estatus, lugar, responsable, tipo
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        tema, fkarea, fecha_inicio, hora_inicio, fecha_fin, horafin, 
        login_registrado, estatus, lugar, responsable, tipo
      ]
    );
    
    return result.insertId;
  } catch (error) {
    console.error('Error en create reunion:', error);
    throw error;
  }
};

export const update = async (id: number, reunion: Reunion, login_modificacion: string): Promise<boolean> => {
  try {
    const {
      tema,
      fkarea,
      fecha_inicio,
      hora_inicio,
      fecha_fin,
      horafin,
      estatus,
      lugar,
      responsable,
      tipo
    } = reunion;
    
    const [result]: any = await pool.query(
      `UPDATE reuniones SET 
        tema = ?, fkarea = ?, fecha_inicio = ?, hora_inicio = ?, 
        fecha_fin = ?, horafin = ?, fecha_modificacion = NOW(), 
        login_modificacion = ?, estatus = ?, lugar = ?, 
        responsable = ?, tipo = ? 
      WHERE idreunion = ?`,
      [
        tema, fkarea, fecha_inicio, hora_inicio, fecha_fin, horafin, 
        login_modificacion, estatus, lugar, responsable, tipo, id
      ]
    );
    
    return result.affectedRows > 0;
  } catch (error) {
    console.error(`Error en update reunion ${id}:`, error);
    throw error;
  }
};

export const remove = async (id: number): Promise<boolean> => {
  try {
    const [result]: any = await pool.query('DELETE FROM reuniones WHERE idreunion = ?', [id]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error(`Error en remove reunion ${id}:`, error);
    throw error;
  }
};

export const search = async (
  criteria: {
    tema?: string,
    fkarea?: number,
    fechaInicio?: string,
    fechaFin?: string,
    estatus?: string,
    tipo?: string,
    responsable?: string
  },
  limit: number = 100,
  offset: number = 0
): Promise<Reunion[]> => {
  try {
    let query = 'SELECT * FROM reuniones WHERE 1=1';
    const params: any[] = [];

    if (criteria.tema) {
      query += ' AND tema LIKE ?';
      params.push(`%${criteria.tema}%`);
    }

    if (criteria.fkarea) {
      query += ' AND fkarea = ?';
      params.push(criteria.fkarea);
    }

    if (criteria.fechaInicio) {
      query += ' AND fecha_inicio >= ?';
      params.push(criteria.fechaInicio);
    }

    if (criteria.fechaFin) {
      query += ' AND fecha_inicio <= ?';
      params.push(criteria.fechaFin);
    }

    if (criteria.estatus) {
      query += ' AND estatus = ?';
      params.push(criteria.estatus);
    }

    if (criteria.tipo) {
      query += ' AND tipo = ?';
      params.push(criteria.tipo);
    }

    if (criteria.responsable) {
      query += ' AND responsable LIKE ?';
      params.push(`%${criteria.responsable}%`);
    }

    query += ' ORDER BY fecha_inicio DESC, hora_inicio DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await pool.query(query, params);
    return rows as Reunion[];
  } catch (error) {
    console.error('Error en search reuniones:', error);
    throw error;
  }
};

export const countReuniones = async (criteria: {
  tema?: string,
  fkarea?: number,
  fechaInicio?: string,
  fechaFin?: string,
  estatus?: string,
  tipo?: string,
  responsable?: string
}): Promise<number> => {
  try {
    let query = 'SELECT COUNT(*) as total FROM reuniones WHERE 1=1';
    const params: any[] = [];

    if (criteria.tema) {
      query += ' AND tema LIKE ?';
      params.push(`%${criteria.tema}%`);
    }

    if (criteria.fkarea) {
      query += ' AND fkarea = ?';
      params.push(criteria.fkarea);
    }

    if (criteria.fechaInicio) {
      query += ' AND fecha_inicio >= ?';
      params.push(criteria.fechaInicio);
    }

    if (criteria.fechaFin) {
      query += ' AND fecha_inicio <= ?';
      params.push(criteria.fechaFin);
    }

    if (criteria.estatus) {
      query += ' AND estatus = ?';
      params.push(criteria.estatus);
    }

    if (criteria.tipo) {
      query += ' AND tipo = ?';
      params.push(criteria.tipo);
    }

    if (criteria.responsable) {
      query += ' AND responsable LIKE ?';
      params.push(`%${criteria.responsable}%`);
    }

    const [rows]: any = await pool.query(query, params);
    return rows[0].total;
  } catch (error) {
    console.error('Error en countReuniones:', error);
    throw error;
  }
};