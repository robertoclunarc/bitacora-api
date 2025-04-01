import pool from '../config/database';

export const findAll = async () => {
  try {
    const [rows] = await pool.query('SELECT * FROM old_Bitacoras ORDER BY fecha DESC LIMIT 1000');
    return rows;
  } catch (error) {
    console.error('Error en findAll old_Bitacoras:', error);
    throw error;
  }
};

export const findById = async (fecha: string, folio: number) => {
  try {
    const [rows]: any = await pool.query(
      'SELECT * FROM old_Bitacoras WHERE fecha = ? AND folio = ?',
      [fecha, folio]
    );
    
    if (rows.length === 0) {
      return null;
    }
    
    return rows[0];
  } catch (error) {
    console.error(`Error en findById old_Bitacoras:`, error);
    throw error;
  }
};

export const search = async (criteria: any) => {
  try {
    let query = 'SELECT * FROM old_Bitacoras WHERE 1=1';
    const params = [];

    if (criteria.fecha) {
      query += ' AND fecha = ?';
      params.push(criteria.fecha);
    }

    if (criteria.tipo) {
      query += ' AND tipo = ?';
      params.push(criteria.tipo);
    }

    if (criteria.critico) {
      query += ' AND critico = 1';
    }

    if (criteria.keyword) {
      query += ' AND (descripcion LIKE ? OR quepaso LIKE ? OR porquepaso LIKE ? OR quesehizo LIKE ?)';
      const keyword = `%${criteria.keyword}%`;
      params.push(keyword, keyword, keyword, keyword);
    }

    query += ' ORDER BY fecha DESC, folio DESC LIMIT 500';

    const [rows] = await pool.query(query, params);
    return rows;
  } catch (error) {
    console.error('Error en search old_Bitacoras:', error);
    throw error;
  }
};