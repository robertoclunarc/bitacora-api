// models/archivoBitacora.model.ts
import pool from '../config/database';
import { Archivo } from '../types/interfaces';

export const getImagenesPublicas = async (limit: number = 10): Promise<Archivo[]> => {
  try {
    const query = `
      SELECT a.*
      FROM archivos a
      INNER JOIN bitacora b ON a.fkbitacora = b.idbitacora
      WHERE b.publico = 1 
      AND (a.tipo_archivo LIKE '%png%' OR a.tipo_archivo LIKE '%jpg%' OR a.tipo_archivo LIKE '%jpeg%')
      AND a.activo = 1 and b.estatus <> 'INACTIVO'
      ORDER BY a.fecha_carga DESC
      LIMIT ?
    `;

    const [rows] = await pool.query(query, [limit]);
    console.log('Filas obtenidas:', rows); // Debugging line to check the rows returned
    return rows as Archivo[];
  } catch (error) {
    console.error('Error al obtener imágenes de bitácoras públicas:', error);
    throw error;
  }
};