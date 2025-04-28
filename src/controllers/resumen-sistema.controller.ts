import { Request, Response } from 'express';
import { getTotalUsuarios, getActividadUsuarios } from '../models/usuario.model';
import { getReunionesPendientes } from '../models/reunion.model';

export const obtenerTotalUsuarios = async (req: Request, res: Response): Promise<void> => {
  try {
    const total = await getTotalUsuarios();
    
    res.json({ total });
  } catch (error) {
    console.error('Error al obtener total de usuarios:', error);
    res.status(500).json({ error: 'Error al obtener total de usuarios' });
  }
};

export const obtenerActividadUsuarios = async (req: Request, res: Response): Promise<void> => {
  try {
    const actividadUsuarios = await getActividadUsuarios();
    
    res.json(actividadUsuarios);
  } catch (error) {
    console.error('Error al obtener actividad de usuarios:', error);
    res.status(500).json({ error: 'Error al obtener actividad de usuarios' });
  }
};

export const obtenerReunionesPendientes = async (req: Request, res: Response): Promise<void> => {
  try {
    const reunionesPendientes = await getReunionesPendientes()
    
    res.json(reunionesPendientes);
  } catch (error) {
    console.error('Error al obtener reuniones pendientes:', error);
    res.status(500).json({ error: 'Error al obtener reuniones pendientes' });
  }
};