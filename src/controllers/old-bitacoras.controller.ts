import { Request, Response } from 'express';
import * as oldBitacorasModel from '../models/old-bitacoras.model';

export const getOldBitacoras = async (req: Request, res: Response) => {
  try {
    const bitacoras = await oldBitacorasModel.findAll();
    res.status(200).json({ bitacoras });
  } catch (error) {
    console.error('Error al obtener bitácoras antiguas:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const getOldBitacoraById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fecha, folio } = req.params;
    
    if (!fecha || !folio) {
      res.status(400).json({ message: 'Se requieren fecha y folio' });
    }
    
    const bitacora = await oldBitacorasModel.findById(fecha, Number(folio));
    
    if (!bitacora) {
      res.status(404).json({ message: 'Bitácora no encontrada' });
    }
    
    res.status(200).json({ bitacora });
  } catch (error) {
    console.error('Error al obtener bitácora antigua:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const searchOldBitacoras = async (req: Request, res: Response) => {
  try {
    const criteria = req.query;
    const bitacoras = await oldBitacorasModel.search(criteria);
    res.status(200).json({ bitacoras });
  } catch (error) {
    console.error('Error al buscar bitácoras antiguas:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};