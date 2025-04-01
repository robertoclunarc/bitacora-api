import { Request, Response } from 'express';
import * as equipoModel from '../models/equipo.model';
import { Equipo } from '../types/interfaces';

export const getAllEquipos = async (_req: Request, res: Response): Promise<void> => {
  try {
    const equipos = await equipoModel.findAll();
    res.status(200).json({ equipos });
  } catch (error) {
    console.error('Error al obtener equipos:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const getEquipoById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const equipo = await equipoModel.findById(Number(id));
    
    if (!equipo) {
      res.status(404).json({ message: 'Equipo no encontrado' });
      return;
    }
    
    res.status(200).json({ equipo });
  } catch (error) {
    console.error(`Error al obtener equipo ${req.params.id}:`, error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const getEquiposByArea = async (req: Request, res: Response): Promise<void> => {
  try {
    const { areaId } = req.params;
    const equipos = await equipoModel.findByArea(Number(areaId));
    
    res.status(200).json({ equipos });
  } catch (error) {
    console.error(`Error al obtener equipos por área ${req.params.areaId}:`, error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const createEquipo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fkarea, descripcion_equipo, codigo_sap } = req.body;
    
    if (!fkarea || !descripcion_equipo) {
      res.status(400).json({ message: 'Área y descripción del equipo son campos requeridos' });
      return;
    }
    
    const newEquipo: Equipo = {
      fkarea: Number(fkarea),
      descripcion_equipo,
      codigo_sap
    };
    
    const id = await equipoModel.create(newEquipo);
    
    res.status(201).json({
      message: 'Equipo creado exitosamente',
      equipo: { idequipo: id, ...newEquipo }
    });
  } catch (error) {
    console.error('Error al crear equipo:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const updateEquipo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { fkarea, descripcion_equipo, codigo_sap } = req.body;
    
    if (!fkarea || !descripcion_equipo) {
      res.status(400).json({ message: 'Área y descripción del equipo son campos requeridos' });
      return;
    }
    
    const equipo = await equipoModel.findById(Number(id));
    
    if (!equipo) {
      res.status(404).json({ message: 'Equipo no encontrado' });
      return;
    }
    
    const updatedEquipo: Equipo = {
      fkarea: Number(fkarea),
      descripcion_equipo,
      codigo_sap
    };
    
    const success = await equipoModel.update(Number(id), updatedEquipo);
    
    if (!success) {
      res.status(500).json({ message: 'Error al actualizar el equipo' });
      return;
    }
    
    res.status(200).json({
      message: 'Equipo actualizado exitosamente',
      equipo: { idequipo: Number(id), ...updatedEquipo }
    });
  } catch (error) {
    console.error(`Error al actualizar equipo ${req.params.id}:`, error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const deleteEquipo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const equipo = await equipoModel.findById(Number(id));
    
    if (!equipo) {
      res.status(404).json({ message: 'Equipo no encontrado' });
      return;
    }
    
    const success = await equipoModel.remove(Number(id));
    
    if (!success) {
      res.status(500).json({ message: 'Error al eliminar el equipo' });
      return;
    }
    
    res.status(200).json({ message: 'Equipo eliminado exitosamente' });
  } catch (error) {
    console.error(`Error al eliminar equipo ${req.params.id}:`, error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};