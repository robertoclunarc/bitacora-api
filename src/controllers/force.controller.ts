import { Request, Response } from 'express';
import * as forceModel from '../models/force.model';
import * as sistemaForceModel from '../models/sistema-force.model';
import * as senalForceModel from '../models/senal-force.model';
import { Force } from '../types/interfaces';
import { RequestWithUser } from '../types/interfaces';

export const getAllForce = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    
    const forceItems = await forceModel.findAll(limit, offset);
    res.status(200).json({ force: forceItems });
  } catch (error) {
    console.error('Error al obtener registros force:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const getForceById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const forceItem = await forceModel.findById(Number(id));
    
    if (!forceItem) {
      res.status(404).json({ message: 'Registro force no encontrado' });
      return;
    }
    
    res.status(200).json({ force: forceItem });
  } catch (error) {
    console.error(`Error al obtener registro force ${req.params.id}:`, error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const getForceBySistema = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sistemaId } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    
    // Verificar si existe el sistema
    const sistema = await sistemaForceModel.findById(Number(sistemaId));
    
    if (!sistema) {
      res.status(404).json({ message: 'Sistema no encontrado' });
      return;
    }
    
    const forceItems = await forceModel.findBySistema(Number(sistemaId), limit, offset);
    res.status(200).json({ force: forceItems });
  } catch (error) {
    console.error(`Error al obtener registros force por sistema ${req.params.sistemaId}:`, error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const getForceBySenal = async (req: Request, res: Response): Promise<void> => {
  try {
    const { senalId } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    
    // Verificar si existe la señal
    const senal = await senalForceModel.findById(Number(senalId));
    
    if (!senal) {
      res.status(404).json({ message: 'Señal no encontrada' });
      return;
    }
    
    const forceItems = await forceModel.findBySenal(Number(senalId), limit, offset);
    res.status(200).json({ force: forceItems });
  } catch (error) {
    console.error(`Error al obtener registros force por señal ${req.params.senalId}:`, error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const createForce = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as unknown as RequestWithUser).user;
    
    if (!user) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }
    
    const {
      fksenal,
      fksistema,
      causas,
      valor,
      solicitado_por,
      autorizado_por,
      ejecutor_por,
      tipoforce,
      estatusforce
    } = req.body;
    
    // Validaciones de campos requeridos
    if (!causas || !valor || !solicitado_por || !autorizado_por || !ejecutor_por || !tipoforce) {
      res.status(400).json({ 
        message: 'Causas, valor, solicitado_por, autorizado_por, ejecutor_por y tipoforce son campos requeridos' 
      });
      return;
    }
    
    // Al menos uno de fksenal o fksistema debe estar presente
    if (!fksenal && !fksistema) {
      res.status(400).json({ message: 'Debe especificar al menos una señal o un sistema para el registro force' });
      return;
    }
    
    // Verificar señal si se proporciona
    if (fksenal) {
      const senal = await senalForceModel.findById(Number(fksenal));
      if (!senal) {
        res.status(404).json({ message: 'Señal no encontrada' });
        return;
      }
    }
    
    // Verificar sistema si se proporciona
    if (fksistema) {
      const sistema = await sistemaForceModel.findById(Number(fksistema));
      if (!sistema) {
        res.status(404).json({ message: 'Sistema no encontrado' });
        return;
      }
    }
    
    const newForce: Force = {
      fksenal: fksenal ? Number(fksenal) : null,
      fksistema: fksistema ? Number(fksistema) : null,
      causas,
      valor: Number(valor),
      solicitado_por,
      autorizado_por,
      ejecutor_por,
      tipoforce,
      estatusforce: estatusforce || 'ACTIVO',
      login_registrado: user.login
    };
    
    const id = await forceModel.create(newForce);
    
    res.status(201).json({
      message: 'Registro force creado exitosamente',
      force: { idforce: id, ...newForce }
    });
  } catch (error) {
    console.error('Error al crear registro force:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const updateForce = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as unknown as RequestWithUser).user;
    const { id } = req.params;
    
    if (!user) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }
    
    // Verificar si existe el registro force
    const forceItem = await forceModel.findById(Number(id));
    
    if (!forceItem) {
      res.status(404).json({ message: 'Registro force no encontrado' });
      return;
    }
    
    // Solo el creador o un usuario con nivel superior puede modificar el registro
    if (forceItem.login_registrado !== user.login && user.nivel < 3) {
      res.status(403).json({ message: 'No tienes permiso para modificar este registro force' });
      return;
    }
    
    // No permitir actualizar registros completados o cancelados
    if (forceItem.estatusforce === 'COMPLETADO' || forceItem.estatusforce === 'CANCELADO') {
      res.status(400).json({ message: 'No se puede modificar un registro force que está completado o cancelado' });
      return;
    }
    
    const {
      fksenal,
      fksistema,
      causas,
      valor,
      solicitado_por,
      autorizado_por,
      ejecutor_por,
      tipoforce,
      estatusforce
    } = req.body;
    
    // Validaciones de campos requeridos
    if (!causas || !valor || !solicitado_por || !autorizado_por || !ejecutor_por || !tipoforce) {
      res.status(400).json({ 
        message: 'Causas, valor, solicitado_por, autorizado_por, ejecutor_por y tipoforce son campos requeridos' 
      });
      return;
    }
    
    // Al menos uno de fksenal o fksistema debe estar presente
    if (!fksenal && !fksistema) {
      res.status(400).json({ message: 'Debe especificar al menos una señal o un sistema para el registro force' });
      return;
    }
    
    // Verificar señal si se proporciona
    if (fksenal) {
      const senal = await senalForceModel.findById(Number(fksenal));
      if (!senal) {
        res.status(404).json({ message: 'Señal no encontrada' });
        return;
      }
    }
    
    // Verificar sistema si se proporciona
    if (fksistema) {
      const sistema = await sistemaForceModel.findById(Number(fksistema));
      if (!sistema) {
        res.status(404).json({ message: 'Sistema no encontrado' });
        return;
      }
    }
    
    const updatedForce: Force = {
      fksenal: fksenal ? Number(fksenal) : null,
      fksistema: fksistema ? Number(fksistema) : null,
      causas,
      valor: Number(valor),
      solicitado_por,
      autorizado_por,
      ejecutor_por,
      tipoforce,
      estatusforce: estatusforce || forceItem.estatusforce,
      login_registrado: forceItem.login_registrado,
      login_modificacion: user.login
    };
    
    const success = await forceModel.update(Number(id), updatedForce);
    
    if (!success) {
      res.status(500).json({ message: 'Error al actualizar el registro force' });
      return;
    }
    
    res.status(200).json({
      message: 'Registro force actualizado exitosamente',
      force: { idforce: Number(id), ...updatedForce }
    });
  } catch (error) {
    console.error(`Error al actualizar registro force ${req.params.id}:`, error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const updateForceStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as unknown as RequestWithUser).user;
    const { id } = req.params;
    const { estatusforce } = req.body;
    
    if (!user) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }
    
    if (!estatusforce) {
      res.status(400).json({ message: 'El estatus es un campo requerido' });
      return;
    }
    
    // Verificar que el estatus sea válido
    if (!['ACTIVO', 'INACTIVO', 'COMPLETADO', 'CANCELADO'].includes(estatusforce)) {
      res.status(400).json({ message: 'Estatus inválido. Valores permitidos: ACTIVO, INACTIVO, COMPLETADO, CANCELADO' });
      return;
    }
    
    // Verificar si existe el registro
    const forceItem = await forceModel.findById(Number(id));
    
    if (!forceItem) {
      res.status(404).json({ message: 'Registro force no encontrado' });
      return;
    }
    
    // Solo el creador o un usuario con nivel superior puede modificar el estatus
    if (forceItem.login_registrado !== user.login && user.nivel < 3) {
      res.status(403).json({ message: 'No tienes permiso para modificar el estatus de este registro force' });
      return;
    }
    
    // No permitir actualizar registros ya completados o cancelados
    if ((forceItem.estatusforce === 'COMPLETADO' || forceItem.estatusforce === 'CANCELADO') &&
        (estatusforce === 'ACTIVO' || estatusforce === 'INACTIVO')) {
      res.status(400).json({ 
        message: 'No se puede cambiar el estatus de un registro force que está completado o cancelado' 
      });
      return;
    }
    
    const success = await forceModel.updateStatus(Number(id), estatusforce, user.login);
    
    if (!success) {
      res.status(500).json({ message: 'Error al actualizar el estatus del registro force' });
      return;
    }
    
    res.status(200).json({ 
      message: 'Estatus del registro force actualizado exitosamente',
      estatusforce
    });
  } catch (error) {
    console.error(`Error al actualizar estatus de registro force ${req.params.id}:`, error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const deleteForce = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as unknown as RequestWithUser).user;
    const { id } = req.params;
    
    if (!user) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }
    
    // Verificar si existe el registro
    const forceItem = await forceModel.findById(Number(id));
    
    if (!forceItem) {
      res.status(404).json({ message: 'Registro force no encontrado' });
      return;
    }
    
    // Solo el creador o un usuario con nivel superior puede eliminar el registro
    if (forceItem.login_registrado !== user.login && user.nivel < 3) {
      res.status(403).json({ message: 'No tienes permiso para eliminar este registro force' });
      return;
    }
    
    const success = await forceModel.remove(Number(id));
    
    if (!success) {
      res.status(500).json({ message: 'Error al eliminar el registro force' });
      return;
    }
    
    res.status(200).json({ message: 'Registro force eliminado exitosamente' });
  } catch (error) {
    console.error(`Error al eliminar registro force ${req.params.id}:`, error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const searchForce = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      fksenal,
      fksistema,
      tipoforce,
      estatusforce,
      solicitado_por,
      autorizado_por,
      ejecutor_por,
      fechaInicio,
      fechaFin,
      keyword,
      limit = '100',
      offset = '0'
    } = req.query;
    
    const criteria: any = {};
    
    if (fksenal) criteria.fksenal = parseInt(fksenal as string);
    if (fksistema) criteria.fksistema = parseInt(fksistema as string);
    if (tipoforce) criteria.tipoforce = tipoforce as string;
    if (estatusforce) criteria.estatusforce = estatusforce as string;
    if (solicitado_por) criteria.solicitado_por = solicitado_por as string;
    if (autorizado_por) criteria.autorizado_por = autorizado_por as string;
    if (ejecutor_por) criteria.ejecutor_por = ejecutor_por as string;
    if (fechaInicio) criteria.fechaInicio = fechaInicio as string;
    if (fechaFin) criteria.fechaFin = fechaFin as string;
    if (keyword) criteria.keyword = keyword as string;
    
    const forceItems = await forceModel.search(
      criteria,
      parseInt(limit as string),
      parseInt(offset as string)
    );
    
    const total = await forceModel.countForce(criteria);
    
    res.status(200).json({
      force: forceItems,
      pagination: {
        total,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      }
    });
  } catch (error) {
    console.error('Error al buscar registros force:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};