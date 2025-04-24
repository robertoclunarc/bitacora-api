import { Request, Response } from 'express';
import * as carteleraModel from '../models/cartelera.model';
import { Cartelera, Pagination } from '../types/interfaces';
import { RequestWithUser } from '../middlewares/authMiddleware';
import { handleDatabaseError } from '../utils/errorHandler';

interface CarteleraResponse {
  carteleras?: Cartelera[];
  cartelera?: Cartelera;
  pagination?: Pagination;
  message?: string;
}

export const getAllCarteleras = async (req: Request, res: Response): Promise<void> => {
  try {
    let {
      page = 1,
      limit = 10,
      descripcion,
      fecha_inicio,
      fecha_fin,
      estatus,
      tipo_info,
      fkarea
    } = req.query;

    const user = (req as RequestWithUser).user;

    if (!user) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }

    let pageNum = page ? parseInt(page as string) : 1;
    let limitNum = limit ? parseInt(limit as string) : 10;

    const param = {
      descripcion: descripcion ? (descripcion as string) : undefined,      
      fecha_inicio: fecha_inicio ? (fecha_inicio as string) : undefined,
      fecha_fin: fecha_fin ? (fecha_fin as string) : undefined,
      estatus: estatus ? (estatus as string) : undefined,
      tipo_info: tipo_info ? (tipo_info as string) : undefined,
      fkarea: fkarea ? (fkarea as string) : undefined
    }

    // Validar límites
    if (isNaN(pageNum)) pageNum = 1;
    if (isNaN(limitNum)) limitNum = 10;
    if (pageNum < 1) pageNum = 1;
    if (limitNum < 1 || limitNum > 100) limitNum = 10;
    
    const offset = (pageNum - 1) * limitNum;
    
    const carteleras = await carteleraModel.findAll(limitNum, offset, pageNum, param, user);
    res.status(200).json({ carteleras });
  } catch (error) {
    handleDatabaseError(error, res);
  }
};

export const getCarteleraById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = (req as RequestWithUser).user;

    if (!user) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }
    const cartelera = await carteleraModel.findById(Number(id));

    if (!cartelera) {
      res.status(404).json({ message: 'Cartelera no encontrada' });
      return;
    }

    // Verificar permisos    
    const userArea = user.fkarea;
    const userLogin = user.login;
    const isAdmin = user.nivel <= 3;
    
    if (!isAdmin &&  !cartelera.publico && cartelera.fkarea !== userArea && cartelera.login_registrado !== userLogin) {
      res.status(403).json({ message: 'No tiene permiso para ver esta cartelera' });
      return;
    }    
    
    res.status(200).json({ cartelera });
  } catch (error) {
    handleDatabaseError(error, res);
  }
};

export const getCartelerasByArea = async (req: Request, res: Response): Promise<void> => {
  try {
    const { areaId } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    
    const carteleras = await carteleraModel.findByArea(Number(areaId), limit, offset);
    res.status(200).json({ carteleras });
  } catch (error) {
    console.error(`Error al obtener carteleras por área ${req.params.areaId}:`, error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const getActiveCarteleras = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = req.params.limit ? parseInt(req.params.limit) : 100;
    const offset = req.params.offset ? parseInt(req.params.offset) : 0;
    
    const carteleras = await carteleraModel.findActive(limit, offset);
    res.status(200).json({ carteleras });
  } catch (error) {
    console.error('Error al obtener carteleras activas:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const createCartelera = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as unknown as RequestWithUser).user;
    
    if (!user) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }
    
    const {
      fkarea,
      descripcion,
      fecha_inicio_publicacion,
      fecha_fin_publicacion,
      estatus,
      publico,
      tipo_info
    } = req.body;
    
    if (!fkarea || !descripcion || !fecha_inicio_publicacion || !fecha_fin_publicacion) {
      res.status(400).json({ message: 'Área, descripción, fecha de inicio y fecha de fin son campos requeridos' });
      return;
    }
    
    // Verificar que la fecha de fin sea posterior a la fecha de inicio
    if (new Date(fecha_inicio_publicacion) > new Date(fecha_fin_publicacion)) {
      res.status(400).json({ message: 'La fecha de fin debe ser posterior a la fecha de inicio' });
      return;
    }
    
    const newCartelera: Cartelera = {
      fkarea: Number(fkarea),
      descripcion,
      login_registrado: user.login,
      fecha_inicio_publicacion: new Date(fecha_inicio_publicacion),
      fecha_fin_publicacion: new Date(fecha_fin_publicacion),
      estatus: estatus || 'ACTIVO',
      tipo_info: tipo_info, // Valor por defecto
      publico: publico || publico ==1 ? true : false // Valor por defecto
    };

     // Validar fechas
     const fechaInicio = new Date(fecha_inicio_publicacion);
     const fechaFin = new Date(fecha_fin_publicacion);
     
     if (fechaInicio > fechaFin) {
       res.status(400).json({ message: 'La fecha de inicio no puede ser posterior a la fecha de fin' });
       return;
     }
    
    const id = await carteleraModel.create(newCartelera);
    
    res.status(201).json({
      message: 'Cartelera creada exitosamente',
      cartelera: { idcartelera: id, ...newCartelera }
    });
  } catch (error) {
    handleDatabaseError(error, res);
  }
};

export const updateCartelera = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as unknown as RequestWithUser).user;
    const { id } = req.params;
    
    if (!user) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }
    
    const {
      fkarea,
      descripcion,
      fecha_inicio_publicacion,
      fecha_fin_publicacion,
      estatus,
      tipo_info,
      publico,
    } = req.body;
    
    if (!fkarea || !descripcion || !fecha_inicio_publicacion || !fecha_fin_publicacion) {
      res.status(400).json({ message: 'Área, descripción, fecha de inicio y fecha de fin son campos requeridos' });
      return;
    }
    
    // Verificar que la fecha de fin sea posterior a la fecha de inicio
    if (new Date(fecha_inicio_publicacion) > new Date(fecha_fin_publicacion)) {
      res.status(400).json({ message: 'La fecha de fin debe ser posterior a la fecha de inicio' });
      return;
    }
    
    // Obtener la cartelera actual
    const cartelera = await carteleraModel.findById(Number(id));
    
    if (!cartelera) {
      res.status(404).json({ message: 'Cartelera no encontrada' });
      return;
    }
    
    // Solo el creador o un usuario con nivel superior puede modificar la cartelera
    if (cartelera.login_registrado !== user.login) {
      res.status(403).json({ message: 'No tienes permiso para modificar esta cartelera' });
      return;
    }
    
    const updatedCartelera: Cartelera = {
      fkarea: Number(fkarea),
      descripcion,
      login_registrado: cartelera.login_registrado, // Mantener el usuario original que creó la cartelera
      fecha_inicio_publicacion: new Date(fecha_inicio_publicacion),
      fecha_fin_publicacion: new Date(fecha_fin_publicacion),
      estatus,
      tipo_info: tipo_info,
      publico: publico
    };

    // Validar fechas si se proporcionan
    if (fecha_inicio_publicacion && fecha_fin_publicacion) {
      const fechaInicio = new Date(fecha_inicio_publicacion);
      const fechaFin = new Date(fecha_fin_publicacion);
      
      if (fechaInicio > fechaFin) {
         res.status(400).json({ message: 'La fecha de inicio no puede ser posterior a la fecha de fin' });
          return;
      }
    }
    
    const success = await carteleraModel.update(Number(id), updatedCartelera);
    
    if (!success) {
      res.status(500).json({ message: 'Error al actualizar la cartelera' });
      return;
    }
    
    res.status(200).json({
      message: 'Cartelera actualizada exitosamente',
      cartelera: { idcartelera: Number(id), ...updatedCartelera }
    });
  } catch (error) {
    handleDatabaseError(error, res);
  }
};

export const deleteCartelera = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as unknown as RequestWithUser).user;
    const { id } = req.params;
    
    if (!user) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }
    
    // Obtener la cartelera
    const cartelera = await carteleraModel.findById(Number(id));
    
    if (!cartelera) {
      res.status(404).json({ message: 'Cartelera no encontrada' });
      return;
    }
    
    // Solo el creador o un usuario con nivel superior puede eliminar la cartelera
    if (cartelera.login_registrado !== user.login && user.nivel < 3) {
      res.status(403).json({ message: 'No tienes permiso para eliminar esta cartelera' });
      return;
    }
    
    const success = await carteleraModel.remove(Number(id));
    
    if (!success) {
      res.status(500).json({ message: 'Error al eliminar la cartelera' });
      return;
    }
    
    res.status(200).json({ message: 'Cartelera eliminada exitosamente' });
  } catch (error) {
    console.error(`Error al eliminar cartelera ${req.params.id}:`, error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const searchCarteleras = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      fkarea,
      estatus,
      fechaInicio,
      fechaFin,
      keyword,
      limit = '100',
      offset = '0'
    } = req.query;
    
    const criteria: any = {};
    
    if (fkarea) criteria.fkarea = parseInt(fkarea as string);
    if (estatus) criteria.estatus = estatus as string;
    if (fechaInicio) criteria.fechaInicio = fechaInicio as string;
    if (fechaFin) criteria.fechaFin = fechaFin as string;
    if (keyword) criteria.keyword = keyword as string;
    
    const carteleras = await carteleraModel.search(
      criteria,
      parseInt(limit as string),
      parseInt(offset as string)
    );
    
    const total = await carteleraModel.countCarteleras(criteria);
    
    res.status(200).json({
      carteleras,
      pagination: {
        total,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      }
    });
  } catch (error) {
    console.error('Error al buscar carteleras:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const updateCarteleraStatus = async (req: Request, res: Response<CarteleraResponse>): Promise<void> => {
  try {
    const { id } = req.params;
    const { estatus } = req.body;

    const user = (req as unknown as RequestWithUser).user;
    
    if (!user) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }
    
    if (!['ACTIVO', 'INACTIVO', 'VENCIDO'].includes(estatus)) {
      res.status(400).json({ message: 'Estatus inválido' });
      return;
    }
    
    const currentCartelera = await carteleraModel.findById(Number(id));
    if (!currentCartelera) {
      res.status(404).json({ message: 'Cartelera no encontrada' });
      return
    }
    
    const userLogin = user.login;
    const userArea = user.fkarea;
    const isAdmin = user.nivel >= 1;
    
    // Validar permisos
    if (!isAdmin && currentCartelera.login_registrado !== userLogin && currentCartelera.fkarea !== userArea) {
      res.status(403).json({ message: 'No tiene permiso para editar esta cartelera' });
      return;
    }

    await carteleraModel.updateStatus(Number(id), estatus);
    
    res.json({ message: 'Estatus de cartelera actualizado exitosamente' });
  } catch (error) {
    handleDatabaseError(error, res);
  }
};