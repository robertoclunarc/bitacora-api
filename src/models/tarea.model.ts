import pool from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { Tarea, TareaWithDetails } from '../types/interfaces';

export const findAll = async (
  page: number = 1,
  limit: number = 10,
  filters: any = {}
): Promise<{ tareas: TareaWithDetails[], total: number }> => {
  try {
    const offset = (page - 1) * limit;
    let conditions: string[] = [];
    let params: any[] = [];

    // Filtros
    if (filters.descripcion) {
      conditions.push('t.descripcion LIKE ?');
      params.push(`%${filters.descripcion}%`);
    }

    if (filters.tipo_tarea) {
      conditions.push('t.tipo_tarea = ?');
      params.push(filters.tipo_tarea);
    }

    if (filters.estatus) {
      conditions.push('t.estatus = ?');
      params.push(filters.estatus);
    }

    if (filters.fecha_inicio) {
      conditions.push('DATE(t.fecha_registrado) >= ?');
      params.push(filters.fecha_inicio);
    }

    if (filters.fecha_fin) {
      conditions.push('DATE(t.fecha_registrado) <= ?');
      params.push(filters.fecha_fin);
    }

    if (filters.login_registrado) {
      conditions.push('t.login_registrado = ?');
      params.push(filters.login_registrado);
    }

    // Acceso basado en usuario
    if (filters.userLogin && !filters.isAdmin) {
      conditions.push('t.login_registrado = ?');
      params.push(filters.userLogin);
    }

    if (filters.fkarea && !filters.isAdmin) {
        conditions.push('t.fkarea = ?');
        params.push(filters.fkarea);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Consulta principal con JOIN
    const query = `
      SELECT t.*, 
        u.nombres AS nombre_usuario,
        a.nombrearea AS nombre_area,
        (SELECT COUNT(*) FROM detallestareas WHERE fktarea = t.idtarea) AS detalles_count
      FROM tareas t
      inner JOIN areas a ON t.fkarea = a.idarea 
      LEFT JOIN usuarios u ON t.login_registrado = u.login
      ${whereClause}
      ORDER BY t.fecha_registrado DESC
      LIMIT ? OFFSET ?
    `;

    // Consulta de conteo
    const countQuery = `
      SELECT COUNT(*) AS total 
      FROM tareas t
        inner JOIN areas a ON t.fkarea = a.idarea 
      LEFT JOIN usuarios u ON t.login_registrado = u.login
      ${whereClause}
    `;

    params.push(limit, offset);
    
    const [rows] = await pool.query<RowDataPacket[]>(query, params);
    
    // Consulta de conteo
    const countParams = params.slice(0, -2);
    const [countResult] = await pool.query<RowDataPacket[]>(countQuery, countParams);
    
    return {
      tareas: rows as TareaWithDetails[],
      total: countResult[0].total
    };
  } catch (error) {
    console.error('Error al buscar tareas:', error);
    throw error;
  }
};

export const findById = async (id: number): Promise<TareaWithDetails | null> => {
  try {
    const query = `
      SELECT t.*, 
        u.nombres AS nombre_usuario,
        a.nombrearea AS nombre_area
      FROM tareas t
        INNER JOIN areas a ON t.fkarea = a.idarea
      LEFT JOIN usuarios u ON t.login_registrado = u.login
      WHERE t.idtarea = ?
    `;

    const [rows] = await pool.query<RowDataPacket[]>(query, [id]);
    
    if (rows.length === 0) {
      return null;
    }
    
    return rows[0] as TareaWithDetails;
  } catch (error) {
    console.error(`Error al buscar tarea ${id}:`, error);
    throw error;
  }
};

export const create = async (tarea: Tarea): Promise<Tarea> => {
  try {
    const query = `
      INSERT INTO tareas (
        login_registrado, tipo_tarea, descripcion, estatus, 
        login_modificacion, fkarea
      ) VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      tarea.login_registrado,
      tarea.tipo_tarea,
      tarea.descripcion,
      tarea.estatus || 'PENDIENTE',
      tarea.login_registrado,  // Al crear, es el mismo usuario
      tarea.fkarea
    ];

    const [result] = await pool.query<ResultSetHeader>(query, params);
    
    return {
      ...tarea,
      idtarea: result.insertId,
      fecha_registrado: new Date(),
      fecha_modificacion: new Date()
    };
  } catch (error) {
    console.error('Error al crear tarea:', error);
    throw error;
  }
};

export const update = async (id: number, tarea: Partial<Tarea>): Promise<boolean> => {
  try {
    // Construimos los campos a actualizar dinámicamente
    const fieldsToUpdate = Object.keys(tarea)
      .filter(key => 
        // Excluimos campos que no deberían actualizarse directamente
        !['idtarea', 'fecha_registrado', 'login_registrado'].includes(key) && 
        tarea[key as keyof Tarea] !== undefined
      )
      .map(key => `${key} = ?`);

    // Si no hay nada que actualizar, retornamos
    if (fieldsToUpdate.length === 0) {
      return false;
    }

    // Añadimos login_modificacion
    fieldsToUpdate.push('login_modificacion = ?');
    
    // Construimos los valores para los campos a actualizar
    const values = [
      ...Object.keys(tarea)
        .filter(key => 
          !['idtarea', 'fecha_registrado', 'login_registrado'].includes(key) && 
          tarea[key as keyof Tarea] !== undefined
        )
        .map(key => tarea[key as keyof Tarea]),
      tarea.login_modificacion
    ];

    // Añadimos el id de la tarea al final
    values.push(id);

    const query = `
      UPDATE tareas
      SET ${fieldsToUpdate.join(', ')}
      WHERE idtarea = ?
    `;

    const [result] = await pool.query<ResultSetHeader>(query, values);
    
    return result.affectedRows > 0;
  } catch (error) {
    console.error(`Error al actualizar tarea ${id}:`, error);
    throw error;
  }
};

export const updateStatus = async (id: number, estatus: string, login_modificacion: string): Promise<boolean> => {
  try {
    const query = `
      UPDATE tareas
      SET estatus = ?, login_modificacion = ?
      WHERE idtarea = ?
    `;
    
    const [result] = await pool.query<ResultSetHeader>(query, [estatus, login_modificacion, id]);
    
    return result.affectedRows > 0;
  } catch (error) {
    console.error(`Error al actualizar estatus de tarea ${id}:`, error);
    throw error;
  }
};