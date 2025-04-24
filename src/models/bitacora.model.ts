import pool from '../config/database';
import { Bitacora, AuthUser } from '../types/interfaces';

export const bitacorasAll = async (limit: number = 100, offset: number = 0): Promise<Bitacora[]> => {
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

export const findAll = async (queryParams: any, user: AuthUser): Promise<{ bitacoras: Bitacora[], pagination: { total: number, totalPages: number, currentPage: number, limit: number } }> => {
  const {
    page,
    limit,
    tema,
    offset,
    fecha_inicio,
    fecha_fin,
    estatus,
    tipo,
    fkarea,
    turno,
    critico,
    fkequipo,
    login
  } = queryParams;
  try {
    let conditions = [];
    let params = [];
    
    // Filtrar por tema
    if (tema) {
      conditions.push('b.tema LIKE ?');
      params.push(`%${tema}%`);
    }
    
    // Filtrar por fecha
    if (fecha_inicio) {
      conditions.push('b.fecha >= ?');
      params.push(fecha_inicio);
    }
    if (fecha_fin) {
      conditions.push('b.fecha <= ?');
      params.push(fecha_fin);
    }
    
    // Filtrar por estatus
    if (estatus) {
      conditions.push('b.estatus = ?');
      params.push(estatus);
    }
    
    // Filtrar por tipo
    if (tipo) {
      conditions.push('b.tipo = ?');
      params.push(tipo);
    }
    
    // Filtrar por área
    if (fkarea) {
      conditions.push('b.fkarea = ?');
      params.push(fkarea);
    }
    
    // Filtrar por turno
    if (turno) {
      conditions.push('b.turno = ?');
      params.push(turno);
    }
    
    // Filtrar por crítico
    if (critico !== undefined) {
      conditions.push('b.critico = ?');
      params.push(critico);
    }
    
    // Filtrar por equipo
    if (fkequipo) {
      conditions.push('b.fkequipo = ?');
      params.push(fkequipo);
    }
    
    // Filtrar por login
    if (login) {
      conditions.push('b.login = ?');
      params.push(login);
    }
    
    // Filtrado de acceso según área y campo público
    const userArea = user.fkarea; // Obtener área del usuario autenticado
    const userLogin = user.login; // Obtener login del usuario autenticado
    const isAdmin = user.nivel === 1; // Verificar si es administrador
    
    if (!isAdmin) {
      // Si no es administrador, solo ve bitácoras públicas o de su área
      conditions.push('(b.publico = 1 OR b.fkarea = ? OR b.login = ?)');
      params.push(userArea, userLogin);
    }
    
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
      SELECT b.*, 
        a.nombrearea AS nombre_area,
        e.descripcion_equipo AS nombre_equipo,
        u.nombres AS nombre_usuario,
        (SELECT COUNT(*) FROM archivos WHERE fkbitacora = b.idbitacora AND activo = 1) AS archivos_count
      FROM bitacora b
      LEFT JOIN areas a ON b.fkarea = a.idarea
      LEFT JOIN equipos e ON b.fkequipo = e.idequipo
      LEFT JOIN usuarios u ON b.login = u.login
      ${whereClause}
      ORDER BY b.fecha_hora_registrado DESC
      LIMIT ? OFFSET ?
    `;
    
    // Consulta de conteo
    const countQuery = `
      SELECT COUNT(*) AS total 
      FROM bitacora b
      LEFT JOIN areas a ON b.fkarea = a.idarea
      LEFT JOIN equipos e ON b.fkequipo = e.idequipo
      ${whereClause}
    `;
    
    // Ejecutar consultas
    params.push(limit, offset);
    const [row] = await pool.query(query, params);
    const bitacoras = row as Bitacora[];
    // Ejecutar consulta de conteo (sin los parámetros de paginación)
    const countParams = params.slice(0, -2);
    const [countResult] = await pool.query(countQuery, countParams);
    const total = (countResult as { total: number }[])[0].total;
    
    // Calcular paginación
    const totalPages = Math.ceil(total / limit);

    let results: { bitacoras: Bitacora[], pagination: { total: number, totalPages: number, currentPage: number, limit: number } };
    if (bitacoras.length === 0) {
      results = {
        bitacoras: [],
        pagination: {
          total: 0,
          totalPages: 0,
          currentPage: page,
          limit
        }
      };
    } else {
      results = {
        bitacoras,
        pagination: {
          total,
          totalPages,
          currentPage: page,
          limit
        }
      };
    }
    
    return results;
    
  } catch (error) {
    console.error('Error en findAll bitacoras:', error);
    throw error;
  }
};

export const findById = async (id: number, user: AuthUser): Promise<any | null> => {
  try {
    const [rows]: any = await pool.query('SELECT b.*, \
        a.nombrearea AS nombre_area,\
        e.descripcion_equipo AS nombre_equipo,\
        u.nombres AS nombre_usuario\
      FROM bitacora b\
      LEFT JOIN areas a ON b.fkarea = a.idarea\
      LEFT JOIN equipos e ON b.fkequipo = e.idequipo\
      LEFT JOIN usuarios u ON b.login = u.login\
      WHERE b.idbitacora = ?', [id]);
    
    if (rows.length === 0) {
      return { message: 'Bitácora no encontrada' };
    }

    const bitacora = rows[0];
    const userArea = user.fkarea;
    const userLogin = user.login;
    const isAdmin = user.nivel === 1;
    
    if (!isAdmin && !bitacora.publico && bitacora.fkarea !== userArea && bitacora.login !== userLogin) {
      return { message: 'No tiene permiso para ver esta bitácora' };
    }
    
    return rows[0] as Bitacora;
  } catch (error) {
    console.error(`Error en findById bitacora ${id}:`, error);
    throw error;
  }
};

export const create = async (bitacora: Bitacora): Promise<any> => {
  try {
    const { tema,  descripcion, turno, fecha, hora, fkarea, fkequipo, estatus, critico, lugar, tipo, responsables, login, observacion, que_se_hizo, horas_duracion, publico } = bitacora;
    
    const [result]: any = await pool.query(
      'INSERT INTO bitacora (tema, descripcion, turno, fecha, hora, fkarea, fkequipo, estatus, critico, lugar, tipo, responsables, login, observacion, que_se_hizo, horas_duracion, publico) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [tema,  descripcion, turno, fecha, hora, fkarea, fkequipo, estatus, critico, lugar, tipo, responsables, login, observacion, que_se_hizo, horas_duracion, publico]
    );
    
    return {
      message: 'Bitácora creada exitosamente',
      bitacora: {
        idbitacora: result.insertId,
        ...bitacora,
        login
      }
    }
  } catch (error) {
    console.error('Error en create bitacora:', error);
    throw error;
  }
};

export const update = async (bitacora: any[]): Promise<any> => {
  
  try {
    await pool.query(
      'UPDATE bitacora SET tema = ?,\
        descripcion = ?,\
        turno = ?,\
        fecha = ?,\
        hora = ?,\
        fkarea = ?,\
        fkequipo = ?,\
        estatus = ?,\
        critico = ?,\
        lugar = ?,\
        tipo = ?,\
        responsables = ?,\
        observacion = ?,\
        que_se_hizo = ?,\
        horas_duracion = ?,\
        publico = ?,\
        login_modificacion = ?,\
        fecha_modificacion = ? WHERE idbitacora = ?',
      bitacora
    );
    
    return {
      message: 'Bitácora actualizada exitosamente',
      bitacora: bitacora[0]
    };
  } catch (error) {
    console.error(`Error en update bitacora ${bitacora[0].idbitacora}:`, error);
    throw error;
  }
};

export const updateStatus = async (bitacora: any[]): Promise<any> => {
  try {    
    await pool.query(
      'UPDATE bitacora SET estatus = ?,\
        login_modificacion = ?,\
        fecha_modificacion = ? WHERE idbitacora = ?',
      bitacora
    );
    
    return {
      message: 'Estatus Bitácora actualizada exitosamente',
      bitacora: bitacora[0]
    };
  } catch (error) {
    console.error(`Error en update estatus bitacora ${bitacora[0].idbitacora}:`, error);
    throw error;
  }
};

export const updateEnCartelera = async (bitacora: any[]): Promise<any> => {
  try {    
    await pool.query(
      'UPDATE bitacora SET en_cartelera = ?,\
        login_modificacion = ?,\
        fecha_modificacion = ? WHERE idbitacora = ?',
      bitacora
    );
    
    return {
      message: 'en cartelera Bitácora actualizada exitosamente',
      bitacora: bitacora[0]
    };
  } catch (error) {
    console.error(`Error en update en cartelera bitacora ${bitacora[0].idbitacora}:`, error);
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