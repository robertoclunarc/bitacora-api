import pool from '../config/database';
import { Cartelera, CarteleraConArea, AuthUser } from '../types/interfaces';

export const findAll = async (limit: number = 10, offset: number = 0, page: number = 1, param: any, user: AuthUser ): Promise<any> => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM carteleras ORDER BY fecha_registrado DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );
    // Construir condiciones
    let conditions: string[] = [];
    let params: (string | number)[] = [];
    
    // Filtrar por descripción
    if (param.descripcion && typeof param.descripcion === 'string') {
      conditions.push('c.descripcion LIKE ?');
      params.push(`%${param.descripcion}%`);
    }
    
    // Filtrar por fechas
    if (param.fecha_inicio && typeof param.fecha_inicio === 'string') {
      conditions.push('c.fecha_inicio_publicacion >= ?');
      params.push(param.fecha_inicio);
    }
    
    if (param.fecha_fin && typeof param.fecha_fin === 'string') {
      conditions.push('c.fecha_fin_publicacion <= ?');
      params.push(param.fecha_fin);
    }
    
    // Filtrar por estatus
    if (param.estatus && typeof param.estatus === 'string') {
      conditions.push('c.estatus = ?');
      params.push(param.estatus);
    }
    
    // Filtrar por tipo de información
    if (param.tipo_info && typeof param.tipo_info === 'string') {
      conditions.push('c.tipo_info = ?');
      params.push(param.tipo_info);
    }
    
    // Filtrar por área
    if (param.fkarea && !isNaN(Number(param.fkarea))) {
      conditions.push('c.fkarea = ?');
      params.push(Number(param.fkarea));
    }
    
    // Filtrado de acceso según área y campo público
    const userArea = user.fkarea 
    const userLogin = user.login;
    const isAdmin = user.nivel <= 3;
    
    if (!isAdmin) {
      if (userArea && userLogin) {
        conditions.push('(c.publico = 1 OR c.fkarea = ? OR c.login_registrado = ?)');      
        params.push(userArea, userLogin);
      }      
    }
    
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
      SELECT c.*, 
        a.nombrearea,
        u.nombres AS nombre_usuario
      FROM carteleras c
      LEFT JOIN areas a ON c.fkarea = a.idarea
      LEFT JOIN usuarios u ON c.login_registrado = u.login
      ${whereClause}
      ORDER BY c.fecha_registrado DESC
      LIMIT ? OFFSET ?
    `;
    
    const countQuery = `
      SELECT COUNT(*) AS total 
      FROM carteleras c
      LEFT JOIN areas a ON c.fkarea = a.idarea
      ${whereClause}
    `;
    
    // Ejecutar consultas
    const queryParams = [...params, limit, offset];
    const [rowsCarteleras] = await pool.query(query, queryParams);
    const carteleras = rowsCarteleras as CarteleraConArea[];
    
    // Actualizar estatus de carteleras vencidas
    const today = new Date().toISOString().split('T')[0];
    await pool.query(
      'UPDATE carteleras SET estatus = "VENCIDO" WHERE fecha_fin_publicacion < ? AND estatus = "ACTIVO"',
      [today]
    );
    
    // Obtener total de registros
    const [rowCountResult] = await pool.query(countQuery, params);
    const countResult = rowCountResult as any[];
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);
    
    return({
      carteleras,
      pagination: {
        total,
        totalPages,
        currentPage: page,
        limit: limit
      }
    });

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

    const cartelera = rows[0] as Cartelera;    
    
    return cartelera;
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
      `SELECT c.*, a.nombrearea FROM carteleras c inner join areas a on c.fkarea = a.idarea
       WHERE c.estatus = 'ACTIVO' 
       AND CURRENT_DATE() BETWEEN c.fecha_inicio_publicacion AND c.fecha_fin_publicacion AND c.publico = 1
       ORDER BY c.fecha_registrado DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    return rows as CarteleraConArea[];
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
      estatus,
      tipo_info,
      publico,
    } = cartelera;
    
    const [result]: any = await pool.query(
      `INSERT INTO carteleras (
        fkarea, descripcion, login_registrado, fecha_inicio_publicacion, 
        fecha_fin_publicacion, estatus, tipo_info, publico
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        fkarea, 
        descripcion, 
        login_registrado, 
        fecha_inicio_publicacion, 
        fecha_fin_publicacion, 
        estatus || 'ACTIVO',
        tipo_info || 'INFO',
        publico  || true
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
      estatus,
      tipo_info,
      publico
    } = cartelera;
    
    const [result]: any = await pool.query(
      `UPDATE carteleras SET 
        fkarea = ?, 
        descripcion = ?, 
        fecha_inicio_publicacion = ?, 
        fecha_fin_publicacion = ?, 
        estatus = ?,
        tipo_info = ?,
        publico = ?
      WHERE idcartelera = ?`,
      [
        fkarea, 
        descripcion, 
        fecha_inicio_publicacion, 
        fecha_fin_publicacion, 
        estatus,
        tipo_info,
        publico,
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

export const updateStatus = async (id: number, estatus: string): Promise<boolean> => {
  try {
    const [result]: any = await pool.query('UPDATE carteleras SET estatus=? WHERE idcartelera = ?', [estatus, id]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error(`Error cambiendo estatus cartelera ${id}:`, error);
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
