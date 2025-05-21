// controllers/oldBitacora.controller.ts
import { Request, Response } from 'express';
import * as oldBitacoraModel from '../models/old-bitacoras.model';

export const getAllOldBitacoras = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    // Extraer y validar los filtros del query
    const filters: any = {
      folio: req.query.folio ? parseInt(req.query.folio as string) : undefined,
      fecha_inicio: req.query.fecha_inicio as string,
      fecha_fin: req.query.fecha_fin as string,
      tipo: req.query.tipo as string,
      tema: req.query.tema as string,
      descripcion: req.query.descripcion as string,
      usuario: req.query.usuario as string,
      codigoEQ: req.query.codigoEQ as string,
      turno: req.query.turno as string,
      critico: req.query.critico !== undefined ? req.query.critico === 'true' || req.query.critico === '1' : undefined,
      revisado: req.query.revisado !== undefined ? req.query.revisado === 'true' || req.query.revisado === '1' : undefined,
      orderBy: req.query.orderBy as string,
      orderDir: (req.query.orderDir as 'ASC' | 'DESC') || 'DESC'
    };
    
    const result = await oldBitacoraModel.findAll(page, limit, filters);
    
    res.json({
      oldBitacoras: result.oldBitacoras,
      pagination: {
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
        currentPage: page,
        limit
      }
    });
  } catch (error) {
    console.error('Error al obtener históricos de bitácoras:', error);
    res.status(500).json({ 
      error: 'Error al obtener históricos de bitácoras',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getOldBitacoraByFecha = async (req: Request, res: Response): Promise<void> => {
  try {
    const fecha = req.params.fecha;
    const hora = req.params.hora;
    if (!fecha || !hora) {
      res.status(400).json({ error: 'La fecha/Hora debe ser válido' });
      return;
    }
    
    const oldBitacora = await oldBitacoraModel.findByFecha(fecha, hora);
    
    if (!oldBitacora) {
      res.status(404).json({ error: 'Bitácora histórica no encontrada' });
      return;
    }
    
    res.json({ oldBitacora });
  } catch (error) {
    console.error(`Error al obtener bitácora histórica:`, error);
    res.status(500).json({ error: 'Error al obtener bitácora histórica' });
  }
};

export const getCatalogos = async (req: Request, res: Response): Promise<void> => {
  try {
    const [tipos, turnos, usuarios] = await Promise.all([
      oldBitacoraModel.getTipos(),
      oldBitacoraModel.getTurnos(),
      oldBitacoraModel.getUsuarios()
    ]);
    
    res.json({
      tipos,
      turnos,
      usuarios
    });
  } catch (error) {
    console.error('Error al obtener catálogos de bitácoras históricas:', error);
    res.status(500).json({ error: 'Error al obtener catálogos de bitácoras históricas' });
  }
};