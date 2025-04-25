import pool from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { Incidencia, IncidenciaWithDetails } from '../types/interfaces';

export const findAll = async (
  page: number = 1,
  limit: number = 10,
  filters: any = {}
): Promise<{ incidencias: IncidenciaWithDetails[], total: number }> => {
  try {
    const offset = (page - 1) * limit;
    let conditions: string[] = [];
    let params: any[] = [];

    // Filtros
    if (filters.descripcion) {
      conditions.push('i.descripcion LIKE ?');
      params.push(`%${filters.descripcion}%`);
    }

    if (filters.fecha_inicio) {
      conditions.push('i.fecha >= ?');
      params.push(filters.fecha_inicio);
    }

    if (filters.fecha_fin) {
      conditions.push('i.fecha <= ?');
      params.push(filters.fecha_fin);
    }

    if (filters.tipoincidencia) {
      conditions.push('i.tipoincidencia = ?');
      params.push(filters.tipoincidencia);
    }

    if (filters.critico !== undefined) {
      conditions.push('i.critico = ?');
      params.push(filters.critico);
    }

    if (filters.estatus) {
      conditions.push('i.estatus = ?');
      params.push(filters.estatus);
    }

    if (filters.fkarea) {
      conditions.push('i.fkarea = ?');
      params.push(filters.fkarea);
    }

    if (filters.fkequipo) {
        conditions.push('i.fkequipo = ?');
        params.push(filters.fkequipo);
    }

    // Acceso basado en usuario y área
    if (filters.userArea && !filters.isAdmin) {
      conditions.push('(i.fkarea = ? OR i.login = ?)');
      params.push(filters.userArea, filters.userLogin);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Consulta principal con JOIN
    const query = `
      SELECT i.*, 
        a.nombrearea AS nombre_area,
        u.nombres AS nombre_usuario,
        e.descripcion_equipo AS nombre_equipo
      FROM incidencias i
      LEFT JOIN areas a ON i.fkarea = a.idarea
      LEFT JOIN usuarios u ON i.login = u.login
      LEFT JOIN equipos e ON i.fkequipo = e.idequipo
      ${whereClause}
      ORDER BY i.fecha DESC, i.hora DESC
      LIMIT ? OFFSET ?
    `;

    // Consulta de conteo
    const countQuery = `
      SELECT COUNT(*) AS total 
      FROM incidencias i
      LEFT JOIN areas a ON i.fkarea = a.idarea
      LEFT JOIN equipos e ON i.fkequipo = e.idequipo
      ${whereClause}
    `;

    params.push(limit, offset);
    
    const [rows] = await pool.query<RowDataPacket[]>(query, params);
    
    // Consulta de conteo
    const countParams = params.slice(0, -2);
    const [countResult] = await pool.query<RowDataPacket[]>(countQuery, countParams);
    
    return {
      incidencias: rows as IncidenciaWithDetails[],
      total: countResult[0].total
    };
  } catch (error) {
    console.error('Error al buscar incidencias:', error);
    throw error;
  }
};

export const findById = async (id: number): Promise<IncidenciaWithDetails | null> => {
  try {
    const query = `
      SELECT i.*, 
        a.nombrearea AS nombre_area,
        u.nombres AS nombre_usuario,
        e.descripcion_equipo AS nombre_equipo
      FROM incidencias i
      LEFT JOIN areas a ON i.fkarea = a.idarea
      LEFT JOIN usuarios u ON i.login = u.login
      LEFT JOIN equipos e ON i.fkequipo = e.idequipo
      WHERE i.idincidencia = ?
    `;

    const [rows] = await pool.query<RowDataPacket[]>(query, [id]);
    
    if (rows.length === 0) {
      return null;
    }
    
    return rows[0] as IncidenciaWithDetails;
  } catch (error) {
    console.error(`Error al buscar incidencia ${id}:`, error);
    throw error;
  }
};

export const create = async (incidencia: Incidencia): Promise<Incidencia> => {
  try {
    const query = `
      INSERT INTO incidencias (
        descripcion, fecha, hora, observacion, que_se_hizo,
        tipoincidencia, critico, login, fecha_registro,
        login_modificacion, fecha_modificacion, fkarea, 
        involucrados, estatus, fkequipo
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const now = new Date();
    
    const params = [
      incidencia.descripcion,
      incidencia.fecha,
      incidencia.hora,
      incidencia.observacion || null,
      incidencia.que_se_hizo || null,
      incidencia.tipoincidencia,
      incidencia.critico === true ? 1 : 0,
      incidencia.login,
      now,
      incidencia.login_modificacion || incidencia.login,
      now,
      incidencia.fkarea,
      incidencia.involucrados || null,
      incidencia.estatus || 'ACTIVO',
      incidencia.fkequipo || null
    ];

    const [result] = await pool.query<ResultSetHeader>(query, params);
    
    return {
      ...incidencia,
      idincidencia: result.insertId,
      fecha_registro: now.toISOString(),
      fecha_modificacion: now.toISOString()
    };
  } catch (error) {
    console.error('Error al crear incidencia:', error);
    throw error;
  }
};

export const update = async (id: number, incidencia: Partial<Incidencia>): Promise<boolean> => {
  try {
    // Construimos los campos a actualizar dinámicamente
    const fieldsToUpdate = Object.keys(incidencia)
      .filter(key => 
        // Excluimos idincidencia, fecha_registro, login que no deberían actualizarse
        !['idincidencia', 'fecha_registro', 'login'].includes(key) && 
        incidencia[key as keyof Incidencia] !== undefined
      )
      .map(key => `${key} = ?`);

    // Si no hay nada que actualizar, retornamos
    if (fieldsToUpdate.length === 0) {
      return false;
    }

    // Añadimos siempre fecha_modificacion
    fieldsToUpdate.push('fecha_modificacion = ?');
    
    const now = new Date();
    
    // Construimos los valores para los campos a actualizar
    const values = [
      ...Object.keys(incidencia)
        .filter(key => 
          !['idincidencia', 'fecha_registro', 'login'].includes(key) && 
          incidencia[key as keyof Incidencia] !== undefined
        )
        .map(key => {
          const value = incidencia[key as keyof Incidencia];
          // Manejar valores booleanos para campos que son tinyint en la BD
          if (key === 'critico' || key === 'en_cartelera') {
            return value === true ? 1 : 0;
          }
          return value;
        }),
      now
    ];

    // Añadimos el id de la incidencia al final
    values.push(id);

    const query = `
      UPDATE incidencias
      SET ${fieldsToUpdate.join(', ')}
      WHERE idincidencia = ?
    `;

    const [result] = await pool.query<ResultSetHeader>(query, values);
    
    return result.affectedRows > 0;
  } catch (error) {
    console.error(`Error al actualizar incidencia ${id}:`, error);
    throw error;
  }
};

export const updateStatus = async (id: number, estatus: string, login_modificacion: string): Promise<boolean> => {
  try {
    const query = `
      UPDATE incidencias
      SET estatus = ?, login_modificacion = ?, fecha_modificacion = ?
      WHERE idincidencia = ?
    `;

    const now = new Date();
    
    const [result] = await pool.query<ResultSetHeader>(query, [estatus, login_modificacion, now, id]);
    
    return result.affectedRows > 0;
  } catch (error) {
    console.error(`Error al actualizar estatus de incidencia ${id}:`, error);
    throw error;
  }
};

export const toggleCartelera = async (id: number, login_modificacion: string): Promise<{ en_cartelera: boolean }> => {
  try {
    // Primero obtenemos el estado actual de en_cartelera
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT en_cartelera FROM incidencias WHERE idincidencia = ?', 
      [id]
    );
    
    if (rows.length === 0) {
      throw new Error('Incidencia no encontrada');
    }
    
    const currentState = rows[0].en_cartelera === 1;
    const newState = !currentState;
    
    // Actualizamos el estado en la tabla de incidencias
    const query = `
      UPDATE incidencias
      SET en_cartelera = ?, login_modificacion = ?, fecha_modificacion = ?
      WHERE idincidencia = ?
    `;

    const now = new Date();
    
    await pool.query<ResultSetHeader>(query, [newState ? 1 : 0, login_modificacion, now, id]);
    
    if (newState) {
      // Si ahora está en la cartelera, debemos crearla
      // Primero obtenemos los datos completos de la incidencia
      const incidencia = await findById(id);
      
      if (!incidencia) {
        throw new Error('Incidencia no encontrada');
      }
      
      // Calculamos fecha de fin (30 días después)
      const fechaInicio = new Date();
      const fechaFin = new Date();
      fechaFin.setDate(fechaFin.getDate() + 30);
      
      // Insertamos en la tabla carteleras
      const carteleraQuery = `
        INSERT INTO carteleras (
          titulo, descripcion, fkarea, login_registrado, fecha_registrado,
          fecha_inicio_publicacion, fecha_fin_publicacion, estatus, publico, 
          tipo_info, fkincidencia
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const tipoInfo = incidencia.critico ? 'DANGER' : 'WARNING';
      const titulo = `Incidencia: ${incidencia.tipoincidencia}`;
      
      await pool.query(carteleraQuery, [
        titulo,
        incidencia.descripcion,
        incidencia.fkarea,
        login_modificacion,
        now,
        fechaInicio,
        fechaFin,
        'ACTIVO',
        1, // Público por defecto
        tipoInfo,
        id
      ]);
    } else {
      // Si se quita de la cartelera, eliminamos la entrada en la tabla carteleras
      await pool.query('DELETE FROM carteleras WHERE fkincidencia = ?', [id]);
    }
    
    return { en_cartelera: newState };
  } catch (error) {
    console.error(`Error al cambiar estado de cartelera para incidencia ${id}:`, error);
    throw error;
  }
};