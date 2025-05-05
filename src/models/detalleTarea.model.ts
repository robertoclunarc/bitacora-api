// models/detalleTarea.model.ts
import pool from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { DetalleTarea, DetalleTareaWithDetails } from '../types/interfaces';

export const findByTarea = async (tareaId: number): Promise<DetalleTareaWithDetails[]> => {
  try {
    const query = `
      SELECT dt.*, 
        u.nombres AS nombre_usuario,
        e.descripcion_equipo AS nombre_equipo
      FROM detallestareas dt
      LEFT JOIN usuarios u ON dt.login_registrado = u.login
      LEFT JOIN equipos e ON dt.fkequipo = e.idequipo
      WHERE dt.fktarea = ?
      ORDER BY dt.fecha_inicio
    `;

    const [rows] = await pool.query<RowDataPacket[]>(query, [tareaId]);
    
    return rows as DetalleTareaWithDetails[];
  } catch (error) {
    console.error(`Error al buscar detalles de tarea ${tareaId}:`, error);
    throw error;
  }
};

export const findById = async (id: number): Promise<DetalleTareaWithDetails | null> => {
  try {
    const query = `
      SELECT dt.*, 
        u.nombres AS nombre_usuario,
        e.descripcion_equipo AS nombre_equipo
      FROM detallestareas dt
      LEFT JOIN usuarios u ON dt.login_registrado = u.login
      LEFT JOIN equipos e ON dt.fkequipo = e.idequipo
      WHERE dt.iddetalletarea = ?
    `;
    
    const [rows] = await pool.query<RowDataPacket[]>(query, [id]);
    
    if (rows.length === 0) {
      return null;
    }
    
    return rows[0] as DetalleTareaWithDetails;
  } catch (error) {
    console.error(`Error al buscar detalle de tarea ${id}:`, error);
    throw error;
  }
};

export const create = async (detalle: DetalleTarea): Promise<DetalleTarea> => {
  try {
    const query = `
      INSERT INTO detallestareas (
        fktarea, fkequipo, descripcion, responsable, estatus,
        fecha_inicio, fecha_fin, login_registrado, login_modificacion
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      detalle.fktarea,
      detalle.fkequipo || null,
      detalle.descripcion,
      detalle.responsable,
      detalle.estatus || 'PENDIENTE',
      detalle.fecha_inicio,
      detalle.fecha_fin || null,
      detalle.login_registrado,
      detalle.login_registrado  // Al crear, es el mismo usuario
    ];

    const [result] = await pool.query<ResultSetHeader>(query, params);
    
    return {
      ...detalle,
      iddetalletarea: result.insertId,
      fecha_registro: new Date(),
      fecha_modificacion: new Date()
    };
  } catch (error) {
    console.error('Error al crear detalle de tarea:', error);
    throw error;
  }
};

export const update = async (id: number, detalle: Partial<DetalleTarea>): Promise<boolean> => {
  try {
    // Construimos los campos a actualizar dinámicamente
    const fieldsToUpdate = Object.keys(detalle)
      .filter(key => 
        // Excluimos campos que no deberían actualizarse directamente
        !['iddetalletarea', 'fktarea', 'fecha_registro', 'login_registrado'].includes(key) && 
        detalle[key as keyof DetalleTarea] !== undefined
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
      ...Object.keys(detalle)
        .filter(key => 
          !['iddetalletarea', 'fktarea', 'fecha_registro', 'login_registrado'].includes(key) && 
          detalle[key as keyof DetalleTarea] !== undefined
        )
        .map(key => {
          // Manejo especial para campos nulos
          if (key === 'fecha_fin' && detalle[key as keyof DetalleTarea] === '') {
            return null;
          }
          if (key === 'fkequipo' && !detalle[key as keyof DetalleTarea]) {
            return null;
          }
          return detalle[key as keyof DetalleTarea];
        }),
      detalle.login_modificacion
    ];

    // Añadimos el id del detalle al final
    values.push(id);

    const query = `
      UPDATE detallestareas
      SET ${fieldsToUpdate.join(', ')}
      WHERE iddetalletarea = ?
    `;

    const [result] = await pool.query<ResultSetHeader>(query, values);
    
    return result.affectedRows > 0;
  } catch (error) {
    console.error(`Error al actualizar detalle de tarea ${id}:`, error);
    throw error;
  }
};

export const updateStatus = async (id: number, estatus: string, login_modificacion: string, fecha_fin?: string | null): Promise<boolean> => {
  try {
    let query: string;
    let params: any[];

    if (estatus === 'FINALIZADA' && fecha_fin) {
      query = `
        UPDATE detallestareas
        SET estatus = ?, login_modificacion = ?, fecha_fin = ?
        WHERE iddetalletarea = ?
      `;
      params = [estatus, login_modificacion, fecha_fin, id];
    } else {
      query = `
        UPDATE detallestareas
        SET estatus = ?, login_modificacion = ?
        WHERE iddetalletarea = ?
      `;
      params = [estatus, login_modificacion, id];
    }
    
    const [result] = await pool.query<ResultSetHeader>(query, params);
    
    return result.affectedRows > 0;
  } catch (error) {
    console.error(`Error al actualizar estatus de detalle de tarea ${id}:`, error);
    throw error;
  }
};