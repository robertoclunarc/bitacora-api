// Interfaces para request con usuario autenticado
export interface AuthUser {
    login: string;
    nombres: string;
    nivel: number;
    fkarea?: number;
  }
  
  export interface RequestWithUser extends Request {
    user?: AuthUser;
  }
  
  // Interfaces para las tablas
  export interface Area {
    idarea?: number;
    nombrearea: string;
    estatusarea: 'ACTIVO' | 'INACTIVO';
    responsable?: string;
  }
  
  export interface Usuario {
    login: string;
    trabajador: string;
    estatus: 'ACTIVO' | 'INACTIVO';
    nivel: number;
    fecha_ultima_sesion?: Date;
    nombres: string;
    fkarea?: number;
    email: string;
    password?: string; // Para autenticación, no se almacena en la base de datos
  }
  
  export interface Bitacora {
    idbitacora?: number;
    fecha: Date;
    turno: '1' | '2' | '3';
    login: string;
    fecha_hora_registrado?: Date;
    fkequipo?: number;
    tema?: string;
    descripcion: string;
    estatus: 'ACTIVO' | 'INACTIVO' | 'PENDIENTE' | 'FINALIZADO';
    critico: boolean;
  }

  export interface Equipo {
    idequipo?: number;
    fkarea: number;
    descripcion_equipo: string;
    codigo_sap?: string;
  }
  
  export interface Reunion {
    idreunion?: number;
    tema: string;
    fkarea?: number | null;
    fecha_inicio: Date;
    hora_inicio: string;
    fecha_fin?: Date | null;
    horafin?: string | null;
    login_registrado: string;
    fecha_registrado?: Date;
    fecha_modificacion?: Date | null;
    login_modificacion?: string | null;
    estatus: 'PROGRAMADA' | 'EN_PROCESO' | 'FINALIZADA' | 'CANCELADA';
    lugar?: string | null;
    responsable?: string | null;
    tipo: 'URGENTE' | 'CRITICA' | 'DIARIA' | 'SEMANAL' | 'MENSUAL' | 'ANUAL' | 'EXTRAORDINARIA' | 'NORMAL' | 'FESTEJO' | 'RECONOCIMIENTO' | 'ADISTRAMIENTO' | 'PRESENTACION';
  }

  export interface Minuta {
    idminuta?: number;
    fkreunion: number;
    descripcionminuta: string;
    responsable?: string | null;
  }
  