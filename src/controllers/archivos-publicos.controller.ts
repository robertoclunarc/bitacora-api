import { Request, Response } from 'express';
//import { Archivo, MulterFile, Bitacora } from '../types/interfaces';
import * as archivoBitacoraModel from '../models/archivoBitacora.model';
import { handleDatabaseError } from '../utils/errorHandler';
import path from 'path';

export const getImagenesPublicas = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    
    const imagenes = await archivoBitacoraModel.getImagenesPublicas(limit);
    
    // Transformar las rutas absolutas del filesystem a URLs accesibles
    const imagenesConUrl = imagenes.map(img => {
      // Obtener solo el nombre del archivo de la ruta completa
      const nombreArchivo = path.basename(img.ruta_archivo);
      
      // Construir la URL del servidor
      const urlBase = process.env.API_URL || `${req.protocol}://${req.get('host')}`;
      
      return {
        ...img,
        // El endpoint /uploads debe estar configurado para servir archivos estáticos
        url_imagen: `${urlBase}/uploads/${nombreArchivo}`
      };
    });
    
    res.json({ 
      imagenes: imagenesConUrl,
      total: imagenesConUrl.length 
    });
  } catch (error) {
    handleDatabaseError(error, res, 'Error al obtener imágenes de bitácoras públicas');
  }
};
  