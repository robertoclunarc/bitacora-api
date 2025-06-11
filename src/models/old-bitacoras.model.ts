import pool from '../config/database';
import { OldBitacora, OldBitacoraFilters } from '../types/interfaces';
import { RowDataPacket } from 'mysql2';

export const findAll = async (
  page: number = 1, 
  limit: number = 10,
  filters: OldBitacoraFilters = {}
): Promise<{ oldBitacoras: OldBitacora[], total: number }> => {
  try {
    const offset = (page - 1) * limit;
    let conditions: string[] = [];
    let params: any[] = [];

    // Aplicar filtros
    if (filters.folio) {
      conditions.push('folio = ?');
      params.push(filters.folio);
    }

    if (filters.fecha_inicio) {
      conditions.push('fecha >= ?');
      params.push(filters.fecha_inicio);
    }

    if (filters.fecha_fin) {
      conditions.push('fecha <= ?');
      params.push(filters.fecha_fin);
    }

    if (filters.tipo) {
      conditions.push('tipo = ?');
      params.push(filters.tipo);
    }

    if (filters.tema) {
      conditions.push('tema LIKE ?');
      params.push(`%${filters.tema}%`);
    }

    if (filters.descripcion) {
      conditions.push('descripcion LIKE ?');
      params.push(`%${filters.descripcion}%`);
    }

    if (filters.usuario) {
      conditions.push('usuario LIKE ?');
      params.push(`%${filters.usuario}%`);
    }

    if (filters.codigoEQ) {
      conditions.push('codigoEQ LIKE ?');
      params.push(`%${filters.codigoEQ}%`);
    }

    if (filters.critico !== undefined) {
      conditions.push('critico = ?');
      params.push(filters.critico ? 1 : 0);
    }

    if (filters.revisado !== undefined) {
      conditions.push('revisado = ?');
      params.push(filters.revisado ? 1 : 0);
    }

    if (filters.turno) {
      conditions.push('turno = ?');
      params.push(filters.turno);
    }

    // Construir la cláusula WHERE
    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    // Ordenamiento (con valores por defecto)
    const orderBy = filters.orderBy || 'fecha';
    const orderDir = filters.orderDir || 'DESC';
    const orderClause = `ORDER BY ${orderBy} ${orderDir}, folio DESC`;

    // Consulta principal con LIMIT para paginación
    // Seleccionamos sólo las columnas que realmente vamos a mostrar para optimizar
    const query = `
      SELECT 
        folio, fecha, hora, turno, tipo, usuario, critico, revisado, 
        tema, descripcion, codigoEQ, descequipo, quepaso, quesehizo, 
        respodesc, codigoR, observacion, porquepaso, duractividad
      FROM old_Bitacoras 
      ${whereClause} 
      ${orderClause} 
      LIMIT ? OFFSET ?
    `;
    
    // Consulta para contar el total de registros
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM old_Bitacoras 
      ${whereClause}
    `;

    // Ejecutar consulta principal
    params.push(limit, offset);
    const [rows] = await pool.query<RowDataPacket[]>(query, params);
    
    // Ejecutar consulta de conteo
    const countParams = params.slice(0, -2);
    const [countRows] = await pool.query<RowDataPacket[]>(countQuery, countParams);
    
    return {
      oldBitacoras: rows as OldBitacora[],
      total: countRows[0].total
    };
  } catch (error) {
    console.error('Error al obtener históricos de bitácoras:', error);
    throw error;
  }
};

export const findByFecha = async (fecha: string, hora: string): Promise<OldBitacora | null> => {
  try {
    const query = `SELECT * FROM old_Bitacoras WHERE fecha = ? AND hora = ?`;
    const [rows] = await pool.query<RowDataPacket[]>(query, [fecha, hora]);
    
    if (rows.length === 0) {
      return null;
    }
    
    return rows[0] as OldBitacora;
  } catch (error) {
    console.error(`Error al obtener bitácora histórica ${fecha}: ${hora}:`, error);
    throw error;
  }
};

export const getTipos = async (): Promise<string[]> => {
  try {
    const query = `SELECT DISTINCT tipo FROM old_Bitacoras ORDER BY tipo`;
    const [rows] = await pool.query<RowDataPacket[]>(query);
    
    return rows.map(row => row.tipo);
  } catch (error) {
    console.error('Error al obtener tipos de bitácoras históricas:', error);
    throw error;
  }
};

export const getTurnos = async (): Promise<string[]> => {
  try {
    const query = `SELECT DISTINCT turno FROM old_Bitacoras WHERE turno IS NOT NULL ORDER BY turno`;
    const [rows] = await pool.query<RowDataPacket[]>(query);
    
    return rows.map(row => row.turno);
  } catch (error) {
    console.error('Error al obtener turnos de bitácoras históricas:', error);
    throw error;
  }
};

export const getUsuarios = async (): Promise<string[]> => {
  try {
    const query = `SELECT DISTINCT usuario FROM old_Bitacoras WHERE usuario IS NOT NULL ORDER BY usuario LIMIT 100`;
    const [rows] = await pool.query<RowDataPacket[]>(query);
    
    return rows.map(row => row.usuario);
  } catch (error) {
    console.error('Error al obtener usuarios de bitácoras históricas:', error);
    throw error;
  }
};