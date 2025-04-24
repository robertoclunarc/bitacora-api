import { Request, Response } from 'express';
import * as bitacoraModel from '../models/bitacora.model';
import * as carteleraModel from '../models/cartelera.model';
import { Bitacora, Cartelera } from '../types/interfaces';
import { RequestWithUser } from '../middlewares/authMiddleware';
import { handleDatabaseError } from '../utils/errorHandler';

export const getAllBitacoras = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    
    const bitacoras = await bitacoraModel.bitacorasAll(limit, offset);
    res.status(200).json({ bitacoras });
  } catch (error) {
    handleDatabaseError(error, res);
  }
};

export const getAllBitacorasWithAuthenticated = async (req: Request, res: Response): Promise<void> => {
  const user = (req as RequestWithUser).user;
  try { 
    let {
      page = 1,
      limit = 10,
      tema,
      fecha_inicio,
      fecha_fin,
      estatus,
      tipo,
      fkarea,
      turno,
      critico,
      fkequipo,
      login
    } = req.query;

    limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    page = req.query.page ? parseInt(req.query.page as string) : 1;
    const offset = (page - 1) * limit;

    const queryParams: any = {
      page,
      limit,
      tema,
      offset,
      fecha_inicio,
      fecha_fin,
      estatus,
      tipo,
      fkarea,
      turno,
      critico,
      fkequipo,
      login
    };

    if (!user) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }
    
    const bitacoras = await bitacoraModel.findAll(queryParams, user);
    res.status(200).json({ bitacoras });
  } catch (error) {
    handleDatabaseError(error, res);
  }
};

export const getBitacoraById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = (req as RequestWithUser).user;
    if (!user) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }
    const bitacora = await bitacoraModel.findById(Number(id), user);
    
    if (!bitacora) {
      res.status(404).json({ message: 'Bitácora no encontrada' });
      return;
    }
    
    res.status(200).json({ bitacora });
  } catch (error) {
    handleDatabaseError(error, res);
  }
};

export const createBitacora = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as RequestWithUser).user;
    
    if (!user) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }
    
    const {
      tema,
      descripcion,
      turno,
      fecha,
      hora,
      fkarea,
      fkequipo,
      estatus,
      critico,
      lugar,
      tipo,
      responsables,
      observacion,
      que_se_hizo,
      horas_duracion,
      publico
    } = req.body;
    
    if (!fecha || !turno || !descripcion ||  !tema || !hora ) {
      res.status(400).json({ message: 'Fecha, hora, turno, descripción y tema son campos requeridos' });
      return;
    }
    
    const newBitacora: Bitacora = {
      tema,
      descripcion,
      turno,
      fecha: new Date(fecha),
      hora,
      fkarea,
      fkequipo: fkequipo || null,
      estatus: estatus || 'ACTIVO',
      critico: critico || false, 
      lugar: lugar || null,
      tipo: tipo || null,
      responsables,
      login: user?.login || '',      
      observacion: observacion || null,
      que_se_hizo: que_se_hizo || null,
      horas_duracion: horas_duracion || null,
      publico: publico ? 1 : 0,           
    };
    
    const id = await bitacoraModel.create(newBitacora);
    
    res.status(201).json({
      message: 'Bitácora creada exitosamente',
      bitacora: { idbitacora: id, ...newBitacora }
    });
  } catch (error) {
    handleDatabaseError(error, res);
  }
};

export const updateBitacora = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as RequestWithUser).user;
    const { id } = req.params;
    const {
      tema,
      descripcion,
      turno,
      fecha,
      hora,
      fkarea,
      fkequipo,
      estatus,
      critico,
      lugar,
      tipo,
      responsables,
      observacion,
      que_se_hizo,
      horas_duracion,
      publico
    } = req.body;
    
    if (!user) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }
    
    if (!fecha || !turno || !descripcion) {
      res.status(400).json({ message: 'Fecha, turno y descripción son campos requeridos' });
      return;
    }
    
    // Obtener la bitácora actual
    const checkBitacora = await bitacoraModel.findById(Number(id), user);
    
    if (!checkBitacora) {
      res.status(404).json({ message: 'Bitácora no encontrada o no pertenece al area del usuario actual' });
      return;
    }
    
    // Solo el creador o un usuario con nivel superior puede modificar la bitácora
    if (checkBitacora.login !== user.login && user.nivel <= 3) {
      res.status(403).json({ message: 'No tienes permiso para modificar esta bitácora' });
      return;
    }

    const userLogin = user.login;
    //const userArea = user.fkarea;
    //const isAdmin = user.nivel === 1;

    const login_modificacion = userLogin;
    const fecha_modificacion = new Date();
    const idbitacora= Number(id);
    
    const params = [
      tema !== undefined ? tema : null,
      descripcion,
      turno,
      fecha,
      hora,
      fkarea,
      fkequipo !== undefined ? fkequipo : null,
      estatus || 'ACTIVO',
      critico ? 1 : 0,
      lugar !== undefined ? lugar : null,
      tipo !== undefined ? tipo : null,
      responsables || '',
      observacion !== undefined ? observacion : null,
      que_se_hizo !== undefined ? que_se_hizo : null,
      horas_duracion !== undefined ? horas_duracion : null,
      publico !== undefined ? (publico ? 1 : 0) : 1,
      login_modificacion,
      fecha_modificacion,
      idbitacora
    ];
    
    const success = await bitacoraModel.update(params);
    
    if (!success) {
      res.status(500).json({ message: 'Error al actualizar la bitácora' });
      return;
    }
    
    res.status(200).json(success);
  } catch (error) {
    handleDatabaseError(error, res);
  }
};

export const deleteBitacora = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as RequestWithUser).user;
    const { id } = req.params;
    
    if (!user) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }
    
    // Obtener la bitácora
    const bitacora = await bitacoraModel.findById(Number(id), user);
    
    if (!bitacora) {
      res.status(404).json({ message: 'Bitácora no encontrada' });
      return;
    }
    
    // Solo el creador o un usuario con nivel superior puede eliminar la bitácora
    if (bitacora.login !== user.login && user.nivel < 3) {
      res.status(403).json({ message: 'No tienes permiso para eliminar esta bitácora' });
      return;
    }
    
    const success = await bitacoraModel.remove(Number(id));
    
    if (!success) {
      res.status(500).json({ message: 'Error al eliminar la bitácora' });
      return;
    }
    
    res.status(200).json({ message: 'Bitácora eliminada exitosamente' });
  } catch (error) {
    console.error(`Error al eliminar bitácora ${req.params.id}:`, error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const searchBitacoras = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      fechaInicio,
      fechaFin,
      turno,
      login,
      fkequipo,
      critico,
      keyword,
      limit = '100',
      offset = '0'
    } = req.query;
    
    const criteria: any = {};
    
    if (fechaInicio) criteria.fechaInicio = fechaInicio as string;
    if (fechaFin) criteria.fechaFin = fechaFin as string;
    if (turno) criteria.turno = turno as string;
    if (login) criteria.login = login as string;
    if (fkequipo) criteria.fkequipo = parseInt(fkequipo as string);
    if (critico !== undefined) criteria.critico = critico === 'true';
    if (keyword) criteria.keyword = keyword as string;
    
    const bitacoras = await bitacoraModel.search(
      criteria,
      parseInt(limit as string),
      parseInt(offset as string)
    );
    
    const total = await bitacoraModel.countBitacoras(criteria);
    
    res.status(200).json({
      bitacoras,
      pagination: {
        total,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      }
    });
  } catch (error) {
    console.error('Error al buscar bitácoras:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const updateBitacoraStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { estatus } = req.body;
    const user = (req as RequestWithUser).user;

    if (!user) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }
    
    if (!['ACTIVO', 'INACTIVO', 'PENDIENTE', 'FINALIZADO'].includes(estatus)) {
      res.status(400).json({ message: 'Estatus inválido' });
    }
    
    // Verificar permisos    
    const currentBitacora = await bitacoraModel.findById(Number(id), user);
    
    if (currentBitacora) {
      res.status(404).json({ message: 'Bitácora no encontrada' });
      return;
    }
    
    const userLogin = user.login;
    const userArea = user.fkarea;
    const isAdmin = user.nivel >= 1;
    
    // Solo el creador, administradores o usuarios de la misma área pueden editar
    if (!isAdmin && currentBitacora.login !== userLogin && currentBitacora.fkarea !== userArea) {
      res.status(403).json({ message: 'No tiene permiso para editar esta bitácora' });
      return
    }
    
    const login_modificacion = userLogin;
    const fecha_modificacion = new Date();
    
    const update = await bitacoraModel.updateStatus([estatus, login_modificacion, fecha_modificacion, id]);
        
    res.json(update);
  } catch (error) {
    handleDatabaseError(error, res);
  }
};

export const toggleBitacoraEnCartelera = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = (req as RequestWithUser).user;
    // Verificar permisos
    if (!user) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }

    const checkBitacora = await bitacoraModel.findById(Number(id), user);
    
    if (checkBitacora.length === 0) {
      res.status(404).json({ message: 'Bitácora no encontrada' });
      return
    }
    
    const userLogin = user.login;
    const userArea = user.fkarea;
    const isAdmin = user.nivel <= 3;
    
    // Solo el creador, administradores o usuarios de la misma área pueden modificar
    if (!isAdmin && checkBitacora.login !== userLogin && checkBitacora.fkarea !== userArea) {
      res.status(403).json({ message: 'No tiene permiso para modificar esta bitácora' });
      return;
    }
    
    // Verificar si ya está en cartelera
    const enCartelera = checkBitacora.en_cartelera && checkBitacora.en_cartelera===1 ? true : false;
    console.log('enCartelera', enCartelera);
    // Si ya está en cartelera, quitar de cartelera
    if (enCartelera) {
      const param = [0, userLogin, new Date(), id];
      await bitacoraModel.updateEnCartelera(param);
      
      // Eliminar de carteleras si existe
      await carteleraModel.updateStatus(Number(id), 'INACTIVO');      
      
      res.json({ 
        message: 'Bitácora quitada de cartelera exitosamente',
        en_cartelera: false
      });
      return
    }
    
    // Si no está en cartelera, agregar a cartelera
    const fechaInicio = new Date();
    
    // Calcular fecha de fin (30 días después)
    const fechaFin = new Date();
    fechaFin.setDate(fechaFin.getDate() + 30);
    
    // Actualizar bitácora
    const param = [1, userLogin, new Date(), id];
    await bitacoraModel.updateEnCartelera(param);
    
    // Insertar en carteleras
    const cartelera = {
      
      descripcion: String(checkBitacora.descripcion),
      tipo_info: 'WARNING',
      login_registrado: userLogin,
      fecha_registrado: new Date(),
      fecha_inicio_publicacion: fechaInicio,
      fecha_fin_publicacion: fechaFin,
      fkarea: Number(checkBitacora.fkarea),
      publico: checkBitacora.publico && checkBitacora.publico===1 ? true : false,
      estatus: 'ACTIVO',
      
    };
    console.log('cartelera', cartelera);
    await carteleraModel.create(cartelera as Cartelera);
    
    res.json({ 
      message: 'Bitácora publicada en cartelera exitosamente',
      en_cartelera: true
    });
  } catch (error) {
    
    handleDatabaseError(error, res, 'Error al modificar bitácora en cartelera');
  }
};