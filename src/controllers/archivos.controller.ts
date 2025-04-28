import { Request, Response } from 'express';
import db from '../config/database';
import fs from 'fs';
import path from 'path';
import multer, { FileFilterCallback } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { Archivo, MulterFile, Bitacora } from '../types/interfaces';
import * as archivoBitacoraModel from '../models/archivoBitacora.model';
import { RequestWithUser } from '../middlewares/authMiddleware';
import { handleDatabaseError } from '../utils/errorHandler';

// Configurar almacenamiento de archivos
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const uniqueFilename = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueFilename);
  }
});

// Configurar límites y filtros
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    cb(null, true);
  }
});

export const uploadMiddleware = upload.single('file');

export const getArchivosByBitacora = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bitacoraId } = req.params;
    const user = (req as RequestWithUser).user;
    if (!user) {
        res.status(401).json({ message: 'Usuario no autenticado' });
        return;
    }
    // Verificar permisos para acceder a la bitácora
    const [rows] = await db.query('SELECT login, fkarea, publico FROM bitacora WHERE idbitacora = ?', [bitacoraId]);
    const bitacora = rows as Bitacora[];
    if (bitacora.length === 0) {
      res.status(404).json({ message: 'Bitácora no encontrada' });
      return;
    }
    
    const userLogin = user.login;
    const userArea = user.fkarea;
    const isAdmin = user.nivel <= 3;
    
    // Verificar permisos de acceso a la bitácora
    if (!isAdmin && !bitacora[0].publico && bitacora[0].fkarea !== userArea && bitacora[0].login !== userLogin) {
      res.status(403).json({ message: 'No tiene permiso para ver los archivos de esta bitácora' });
      return
    }
    
    const [rowsArchivos] = await db.query(
      'SELECT * FROM archivos WHERE fkbitacora = ? AND activo = 1 ORDER BY fecha_carga DESC',
      [bitacoraId]
    );
    const archivos = rowsArchivos as Archivo[];
    res.json({ archivos });
  } catch (error) {    
    handleDatabaseError(error, res, 'Error al obtener los archivos de la bitácora');
  }
};

export const uploadArchivo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bitacoraId } = req.params;
    const { descripcion } = req.body;
    const file = req.file;
    const user = (req as RequestWithUser).user;
    if (!user) {
        res.status(401).json({ message: 'Usuario no autenticado' });
        return;
    }
    if (!file) {
       res.status(400).json({ message: 'No se ha proporcionado ningún archivo' });
       return
    }
    
    // Verificar permisos para modificar la bitácora
    const [rowsBitacora] = await db.query('SELECT login, fkarea FROM bitacora WHERE idbitacora = ?', [bitacoraId]);
    const bitacora = rowsBitacora as Bitacora[];
    if (bitacora.length === 0) {
      // Eliminar el archivo si la bitácora no existe
      fs.unlinkSync(file.path);
      res.status(404).json({ message: 'Bitácora no encontrada' });
    }
    
    const userLogin = user.login;
    const userArea = user.fkarea;
    const isAdmin = user.nivel >= 3;
    
    // Verificar permisos de modificación
    if (!isAdmin && bitacora[0].login !== userLogin && bitacora[0].fkarea !== userArea) {
      // Eliminar el archivo si no tiene permisos
      fs.unlinkSync(file.path);
      res.status(403).json({ message: 'No tiene permiso para adjuntar archivos a esta bitácora' });
    }
    
    // Guardar referencia en la base de datos
    const query = `
      INSERT INTO archivos (
        fkbitacora, nombre_archivo, ruta_archivo, 
        tipo_archivo, tamano, login_carga, descripcion
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await db.query<any>(
      query, 
      [
        bitacoraId,
        file.originalname,
        file.path,
        file.mimetype,
        file.size,
        userLogin,
        descripcion || null
      ]
    );
    
    res.status(201).json({
      message: 'Archivo subido exitosamente',
      archivo: {
        idarchivo: result.insertId,
        fkbitacora: bitacoraId,
        nombre_archivo: file.originalname,
        tipo_archivo: file.mimetype,
        tamano: file.size,
        fecha_carga: new Date(),
        login_carga: userLogin,
        descripcion: descripcion || null
      }
    });
  } catch (error) {
    // Eliminar el archivo en caso de error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    handleDatabaseError(error, res);
  }
};

export const downloadArchivo = async (req: Request, res: Response) : Promise<void> => {
  try {
    const { bitacoraId, archivoId } = req.params;
    const user = (req as RequestWithUser).user;
    if (!user) {
        res.status(401).json({ message: 'Usuario no autenticado' });
        return;
    }
    // Verificar permisos para acceder a la bitácora
    const [rowsBitacora] = await db.query('SELECT login, fkarea, publico FROM bitacora WHERE idbitacora = ?', [bitacoraId]);
    const bitacora = rowsBitacora as Bitacora[];
    if (bitacora.length === 0) {
      res.status(404).json({ message: 'Bitácora no encontrada' });
      return;
    }
    
    const userLogin = user.login;
    const userArea = user.fkarea;
    const isAdmin = user.nivel <= 3;
    
    // Verificar permisos de acceso a la bitácora
    if (!isAdmin && !bitacora[0].publico && bitacora[0].fkarea !== userArea && bitacora[0].login !== userLogin) {
      res.status(403).json({ message: 'No tiene permiso para descargar archivos de esta bitácora' });
      return;
    }
    
    // Obtener información del archivo
    const [rowsArchivos] = await db.query(
      'SELECT * FROM archivos WHERE idarchivo = ? AND fkbitacora = ? AND activo = 1',
      [archivoId, bitacoraId]
    );
    const archivos = rowsArchivos as Archivo[];
    
    if (archivos.length === 0) {
      res.status(404).json({ message: 'Archivo no encontrado' });
      return
    }
    
    const archivo = archivos[0];
    
    // Verificar si el archivo existe en el sistema de archivos
    if (!fs.existsSync(archivo.ruta_archivo)) {
      res.status(404).json({ message: 'El archivo físico no existe' });
      return
    }
    
    // Servir el archivo para descarga
    res.download(archivo.ruta_archivo, archivo.nombre_archivo);
  } catch (error) {
    handleDatabaseError(error, res);
  }
};

export const deleteArchivo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bitacoraId, archivoId } = req.params;
    const user = (req as RequestWithUser).user;
    if (!user) {
        res.status(401).json({ message: 'Usuario no autenticado' });
        return;
    }
    // Verificar permisos para modificar la bitácora
    const [rowsBitacora] = await db.query('SELECT login, fkarea FROM bitacora WHERE idbitacora = ?', [bitacoraId]);
    const bitacora = rowsBitacora as Bitacora[];
    if (bitacora.length === 0) {
      res.status(404).json({ message: 'Bitácora no encontrada' });
        return;
    }
    
    const userLogin = user.login;
    const userArea = user.fkarea;
    const isAdmin = user.nivel <= 3;
    
    // Verificar permisos de modificación
    if (!isAdmin && bitacora[0].login !== userLogin && bitacora[0].fkarea !== userArea) {
      res.status(403).json({ message: 'No tiene permiso para eliminar archivos de esta bitácora' });
        return;
    }
    
    // Obtener información del archivo
    const [rowsArchivos] = await db.query(
      'SELECT * FROM archivos WHERE idarchivo = ? AND fkbitacora = ? AND activo = 1',
      [archivoId, bitacoraId]
    );
    const archivos = rowsArchivos as Archivo[];
    if (archivos.length === 0) {
      res.status(404).json({ message: 'Archivo no encontrado' });
        return;
    }
    
    // Marcar como inactivo en lugar de eliminar físicamente
    await db.query(
      'UPDATE archivos SET activo = 0 WHERE idarchivo = ?',
      [archivoId]
    );
    
    res.json({ message: 'Archivo eliminado exitosamente' });
  } catch (error) {
    handleDatabaseError(error, res);
  }
};


export const getImagenesPublicas = async (req: Request, res: Response): Promise<void> => {
    try {
      //console.log('Request:', req);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      console.log('Limit:', limit); // Debugging line to check the limit value
      const imagenes = await archivoBitacoraModel.getImagenesPublicas(limit);
      
      // Transformar las rutas de las imágenes a URLs completas si es necesario
      const imagenesConUrl = imagenes.map(img => {
        // Asumiendo que la ruta del archivo se almacena como ruta relativa
        // Ajusta esto según la estructura de tus rutas de archivos
        const urlBase = process.env.API_URL || req.protocol + '://' + req.get('host');
        const rutaImagen = img.ruta_archivo.replace(/^public\//, '');
        
        return {
          ...img,
          url_imagen: `${urlBase}/uploads/${rutaImagen}`
        };
      });
      
      res.json({ 
        imagenes: imagenesConUrl,
        total: imagenesConUrl.length 
      });
    } catch (error) {
     
      handleDatabaseError(error, res, 'Error al obtener imágenes públicas');
    }
  };
  