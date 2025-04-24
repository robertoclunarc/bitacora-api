import { Response } from 'express';

// Definimos los tipos de errores para mysql2/promise
interface MySql2Error extends Error {
  code: string;
  errno: number;
  sqlState?: string;
  sqlMessage: string;
  sql?: string;
}

// Tipos extendidos para errores personalizados
interface CustomError extends Error {
  statusCode?: number;
  code?: string;
  errno?: number;
}

type DatabaseError = MySql2Error | CustomError;

/**
 * Maneja errores de base de datos y envía una respuesta apropiada al cliente
 * @param error El error recibido
 * @param res Objeto Response de Express
 * @param customMessage Mensaje personalizado opcional
 */
export const handleDatabaseError = (
  error: DatabaseError | any,
  res: Response,
  customMessage?: string
): void => {
  console.error('Database Error:', error);

  // Mensaje base para el cliente
  let clientMessage = customMessage || 'Error en la base de datos';
  let statusCode = 500;

  // Manejo específico de errores conocidos
  if (error.code) {
    switch (error.code) {
      case 'ER_DUP_ENTRY':
        clientMessage = 'El registro ya existe en la base de datos';
        statusCode = 409; // Conflict
        break;
      case 'ER_NO_REFERENCED_ROW':
      case 'ER_NO_REFERENCED_ROW_2':
        clientMessage = 'Referencia a dato inexistente';
        statusCode = 400; // Bad Request
        break;
      case 'ER_ACCESS_DENIED_ERROR':
        clientMessage = 'Acceso denegado a la base de datos';
        statusCode = 403; // Forbidden
        break;
      case 'ER_BAD_DB_ERROR':
        clientMessage = 'Base de datos no existe';
        statusCode = 500;
        break;
      case 'ER_PARSE_ERROR':
        clientMessage = 'Error en la consulta SQL';
        statusCode = 400;
        break;
      case 'ER_LOCK_WAIT_TIMEOUT':
      case 'ER_LOCK_DEADLOCK':
        clientMessage = 'Conflicto de concurrencia, por favor intente nuevamente';
        statusCode = 409;
        break;
      case 'ECONNREFUSED':
        clientMessage = 'No se puede conectar al servidor de base de datos';
        statusCode = 503; // Service Unavailable
        break;
    }
  }

  // Verificar si es un error de validación
  if (error.name === 'ValidationError') {
    clientMessage = 'Datos de entrada no válidos';
    statusCode = 400;
  }

  // En producción, no enviar detalles del error al cliente
  const response: { message: string; error?: any } = { message: clientMessage };

  // En desarrollo, incluir más detalles del error
  if (process.env.NODE_ENV === 'development') {
    response.error = {
      code: error.code,
      message: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    };
  }

  res.status(statusCode).json(response);
};