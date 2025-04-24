import { Request, Response } from 'express';
import db from '../config/database';
import { handleDatabaseError } from '../utils/errorHandler';
import { TipoBitacora } from '../types/interfaces';

export const getAllTiposBitacora = async (req: Request, res: Response): Promise<void> => {
  try {
    // Usamos el generic TypeScript para tipar el resultado de la consulta
    const [rowsTipos] = await db.query(
      'SELECT idtipo, descripciontipo FROM tipobitacoras ORDER BY descripciontipo'
    );
    const tipos: TipoBitacora[] = rowsTipos as TipoBitacora[];
    
    res.json({ tipos });
  } catch (error) {
    handleDatabaseError(error, res);
  }
};