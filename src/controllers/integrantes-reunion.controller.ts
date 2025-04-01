import { Request, Response } from 'express';
import * as integranteReunionModel from '../models/integrante-reunion.model';
import * as reunionModel from '../models/reunion.model';
import { IntegranteReunion } from '../types/interfaces';
import { RequestWithUser } from '../types/interfaces';

export const getAllIntegrantesReunion = async (_req: Request, res: Response): Promise<void> => {
  try {
    const integrantes = await integranteReunionModel.findAll();
    res.status(200).json({ integrantes });
  } catch (error) {
    console.error('Error al obtener integrantes de reuniones:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const getIntegranteReunionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const integrante = await integranteReunionModel.findById(Number(id));
    
    if (!integrante) {
      res.status(404).json({ message: 'Integrante de reunión no encontrado' });
      return;
    }
    
    res.status(200).json({ integrante });
  } catch (error) {
    console.error(`Error al obtener integrante de reunión ${req.params.id}:`, error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const getIntegrantesByReunion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { reunionId } = req.params;
    const integrantes = await integranteReunionModel.findByReunion(Number(reunionId));
    
    res.status(200).json({ integrantes });
  } catch (error) {
    console.error(`Error al obtener integrantes por reunión ${req.params.reunionId}:`, error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const createIntegranteReunion = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = ((req as unknown) as RequestWithUser).user;
    const { fkreunion, nombres_apellidos_integrante, asistio } = req.body;
    
    if (!user) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }
    
    if (!fkreunion || !nombres_apellidos_integrante) {
      res.status(400).json({ message: 'Reunión y nombre del integrante son campos requeridos' });
      return;
    }
    
    // Verificar si existe la reunión
    const reunion = await reunionModel.findById(Number(fkreunion));
    
    if (!reunion) {
      res.status(404).json({ message: 'Reunión no encontrada' });
      return;
    }
    
    // Solo el creador de la reunión o un usuario con nivel superior puede agregar integrantes
    if (reunion.login_registrado !== user.login && user.nivel < 3) {
      res.status(403).json({ message: 'No tienes permiso para agregar integrantes a esta reunión' });
      return;
    }
    
    const newIntegrante: IntegranteReunion = {
      fkreunion: Number(fkreunion),
      nombres_apellidos_integrante,
      asistio: asistio || false
    };
    
    const id = await integranteReunionModel.create(newIntegrante);
    
    res.status(201).json({
      message: 'Integrante agregado exitosamente',
      integrante: { idintegrantereunion: id, ...newIntegrante }
    });
  } catch (error) {
    console.error('Error al crear integrante de reunión:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const updateIntegranteReunion = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as unknown as RequestWithUser).user;
    const { id } = req.params;
    const { fkreunion, nombres_apellidos_integrante, asistio } = req.body;
    
    if (!user) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }
    
    if (!fkreunion || !nombres_apellidos_integrante) {
      res.status(400).json({ message: 'Reunión y nombre del integrante son campos requeridos' });
      return;
    }
    
    // Obtener el integrante actual
    const integrante = await integranteReunionModel.findById(Number(id));
    
    if (!integrante) {
      res.status(404).json({ message: 'Integrante no encontrado' });
      return;
    }
    
    // Verificar si existe la reunión
    const reunion = await reunionModel.findById(Number(fkreunion));
    
    if (!reunion) {
      res.status(404).json({ message: 'Reunión no encontrada' });
      return;
    }
    
    // Solo el creador de la reunión o un usuario con nivel superior puede modificar integrantes
    if (reunion.login_registrado !== user.login && user.nivel < 3) {
      res.status(403).json({ message: 'No tienes permiso para modificar integrantes de esta reunión' });
      return;
    }
    
    const updatedIntegrante: IntegranteReunion = {
      fkreunion: Number(fkreunion),
      nombres_apellidos_integrante,
      asistio: asistio !== undefined ? asistio : integrante.asistio
    };
    
    const success = await integranteReunionModel.update(Number(id), updatedIntegrante);
    
    if (!success) {
      res.status(500).json({ message: 'Error al actualizar el integrante' });
      return;
    }
    
    res.status(200).json({
      message: 'Integrante actualizado exitosamente',
      integrante: { idintegrantereunion: Number(id), ...updatedIntegrante }
    });
  } catch (error) {
    console.error(`Error al actualizar integrante ${req.params.id}:`, error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const deleteIntegranteReunion = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as unknown as RequestWithUser).user;
    const { id } = req.params;
    
    if (!user) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }
    
    // Obtener el integrante
    const integrante = await integranteReunionModel.findById(Number(id));
    
    if (!integrante) {
      res.status(404).json({ message: 'Integrante no encontrado' });
      return;
    }
    
    // Obtener la reunión asociada
    const reunion = await reunionModel.findById(integrante.fkreunion);
    
    if (!reunion) {
      res.status(404).json({ message: 'Reunión no encontrada' });
      return;
    }
    
    // Solo el creador de la reunión o un usuario con nivel superior puede eliminar integrantes
    if (reunion.login_registrado !== user.login && user.nivel < 3) {
      res.status(403).json({ message: 'No tienes permiso para eliminar integrantes de esta reunión' });
      return;
    }
    
    const success = await integranteReunionModel.remove(Number(id));
    
    if (!success) {
      res.status(500).json({ message: 'Error al eliminar el integrante' });
      return;
    }
    
    res.status(200).json({ message: 'Integrante eliminado exitosamente' });
  } catch (error) {
    console.error(`Error al eliminar integrante ${req.params.id}:`, error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const markAttendance = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as unknown as RequestWithUser).user;
    const { id } = req.params;
    const { asistio } = req.body;
    
    if (!user) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }
    
    if (asistio === undefined) {
      res.status(400).json({ message: 'El campo asistio es requerido' });
      return;
    }
    
    // Obtener el integrante
    const integrante = await integranteReunionModel.findById(Number(id));
    
    if (!integrante) {
      res.status(404).json({ message: 'Integrante no encontrado' });
      return;
    }
    
    // Obtener la reunión asociada
    const reunion = await reunionModel.findById(integrante.fkreunion);
    
    if (!reunion) {
      res.status(404).json({ message: 'Reunión no encontrada' });
      return;
    }
    
    // Solo el creador de la reunión o un usuario con nivel superior puede marcar asistencia
    if (reunion.login_registrado !== user.login && user.nivel < 3) {
      res.status(403).json({ message: 'No tienes permiso para marcar asistencia en esta reunión' });
      return;
    }
    
    const success = await integranteReunionModel.markAttendance(Number(id), asistio);
    
    if (!success) {
      res.status(500).json({ message: 'Error al marcar asistencia' });
      return;
    }
    
    res.status(200).json({ 
      message: 'Asistencia marcada exitosamente',
      asistio
    });
  } catch (error) {
    console.error(`Error al marcar asistencia del integrante ${req.params.id}:`, error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const bulkCreateIntegrantes = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as unknown as RequestWithUser).user;
    const { reunionId, integrantes } = req.body;
    
    if (!user) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }
    
    if (!reunionId || !integrantes || !Array.isArray(integrantes) || integrantes.length === 0) {
      res.status(400).json({ message: 'Reunión e integrantes son campos requeridos' });
      return;
    }
    
    // Verificar si existe la reunión
    const reunion = await reunionModel.findById(Number(reunionId));
    
    if (!reunion) {
      res.status(404).json({ message: 'Reunión no encontrada' });
      return;
    }
    
    // Solo el creador de la reunión o un usuario con nivel superior puede agregar integrantes
    if (reunion.login_registrado !== user.login && user.nivel < 3) {
      res.status(403).json({ message: 'No tienes permiso para agregar integrantes a esta reunión' });
      return;
    }
    
    const integrantesData: IntegranteReunion[] = integrantes.map((nombre: string) => ({
      fkreunion: Number(reunionId),
      nombres_apellidos_integrante: nombre,
      asistio: false
    }));
    
    const success = await integranteReunionModel.bulkCreate(integrantesData);
    
    if (!success) {
      res.status(500).json({ message: 'Error al agregar integrantes' });
      return;
    }
    
    // Obtener los integrantes actualizados
    const integrantesActualizados = await integranteReunionModel.findByReunion(Number(reunionId));
    
    res.status(201).json({
      message: 'Integrantes agregados exitosamente',
      integrantes: integrantesActualizados
    });
  } catch (error) {
    console.error('Error al agregar integrantes en masa:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};