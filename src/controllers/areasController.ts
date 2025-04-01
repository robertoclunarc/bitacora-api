import { Request, Response } from 'express';
import * as areaModel from '../models/areasModel';
import { Area } from '../types/interfaces';

export const getAllAreas = async (_req: Request, res: Response) => {
  try {
    const areas = await areaModel.findAll();
    res.status(200).json({ areas });
  } catch (error) {
    console.error('Error al obtener áreas:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const getAreaById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const area = await areaModel.findById(Number(id));
    
    if (!area) {
      res.status(404).json({ message: 'Área no encontrada' });
    }
    
    res.status(200).json({ area });
  } catch (error) {
    console.error(`Error al obtener área ${req.params.id}:`, error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const createArea = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombrearea, estatusarea, responsable } = req.body;
    
    if (!nombrearea || !estatusarea) {
      res.status(400).json({ message: 'El nombre y estatus del área son requeridos' });
    }
    
    const newArea: Area = {
      nombrearea,
      estatusarea,
      responsable
    };
    
    const id = await areaModel.create(newArea);
    
    res.status(201).json({
      message: 'Área creada exitosamente',
      area: { idarea: id, ...newArea }
    });
  } catch (error) {
    console.error('Error al crear área:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const updateArea = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nombrearea, estatusarea, responsable } = req.body;
    
    if (!nombrearea || !estatusarea) {
      res.status(400).json({ message: 'El nombre y estatus del área son requeridos' });
    }
    
    const area = await areaModel.findById(Number(id));
    
    if (!area) {
      res.status(404).json({ message: 'Área no encontrada' });
    }
    
    const updatedArea: Area = {
      nombrearea,
      estatusarea,
      responsable
    };
    
    const success = await areaModel.update(Number(id), updatedArea);
    
    if (!success) {
      res.status(500).json({ message: 'Error al actualizar el área' });
    }
    
    res.status(200).json({
      message: 'Área actualizada exitosamente',
      area: { idarea: Number(id), ...updatedArea }
    });
  } catch (error) {
    console.error(`Error al actualizar área ${req.params.id}:`, error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const deleteArea = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const area = await areaModel.findById(Number(id));
    
    if (!area) {
      res.status(404).json({ message: 'Área no encontrada' });
    }
    
    const success = await areaModel.remove(Number(id));
    
    if (!success) {
      res.status(500).json({ message: 'Error al eliminar el área' });
    }
    
    res.status(200).json({ message: 'Área eliminada exitosamente' });
  } catch (error) {
    console.error(`Error al eliminar área ${req.params.id}:`, error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};