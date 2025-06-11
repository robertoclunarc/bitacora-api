import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Definir la interfaz para el usuario autenticado
export interface AuthUser {
  login: string;
  nombres: string;
  nivel: number;
  fkarea?: number;
}

// Extender la interfaz Request para incluir el usuario autenticado
export interface RequestWithUser extends Request {
  user?: AuthUser;
}

export const authenticateJWT = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;  
  if (!authHeader) {
    console.log('Token no proporcionado');
    res.status(401).json({ message: 'Token no proporcionado' });
    return;
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2) {
    res.status(401).json({ message: 'Formato de token inválido' });
    return;
  }

  const [scheme, token] = parts;

  if (!/^Bearer$/i.test(scheme)) {
    res.status(401).json({ message: 'Formato de token inválido' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as AuthUser;
    (req as RequestWithUser).user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token inválido' });
    return;
  }
};

export const checkRole = (requiredLevel: number) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as RequestWithUser).user;
    if (!user) {
      console.log('Usuario no autenticado');
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }

    if (user.nivel < requiredLevel) {
      res.status(403).json({ message: 'Acceso denegado. Nivel insuficiente.' });
      return;
    }

    next();
  };
};