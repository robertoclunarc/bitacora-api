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
  
  export interface IntegranteReunion {
    idintegrantereunion?: number;
    fkreunion: number;
    nombres_apellidos_integrante: string;
    asistio: boolean;
  }
  
  export interface Cartelera {
    idcartelera?: number;
    fkarea: number;
    descripcion: string;
    login_registrado: string;
    fecha_registrado?: Date;
    fecha_inicio_publicacion: Date;
    fecha_fin_publicacion: Date;
    estatus: 'ACTIVO' | 'INACTIVO' | 'VENCIDO';
    tipo_info: 'WARNING' | 'DANGER' | 'INFO';
  }
  
  export interface SistemaForce {
    idsistema?: number;
    descripcion: string;
  }
  
  export interface SenalForce {
    idsenal?: number;
    descripcion: string;
  }
  
  export interface Force {
    idforce?: number;
    fksenal?: number | null;
    fksistema?: number | null;
    causas: string;
    valor: number;
    solicitado_por: string;
    autorizado_por: string;
    ejecutor_por: string;
    tipoforce: string;
    estatusforce: 'ACTIVO' | 'INACTIVO' | 'COMPLETADO' | 'CANCELADO';
    fecha_registrado?: Date;
    login_registrado: string;
    fecha_modificacion?: Date | null;
    login_modificacion?: string | null;
  }
  
  export interface Menu {
    idmenu?: number;
    idpadre?: number | null;
    name?: string | null;
    url?: string | null;
    href?: string | null;
    icon?: string | null;
    badge_text?: string | null;
    badge_variant?: string | null;
    badge_class?: string | null;
    variant?: string | null;
    attributes?: string | null;
    attributes_element?: string | null;
    divider?: boolean | null;
    class?: string | null;
    label_class?: string | null;
    label_variant?: string | null;
    wrapper_attributes?: string | null;
    wrapper_element?: string | null;
    linkprops?: string | null;
    title?: boolean | null;
    estatus: boolean;
    orden?: number | null;
    children?: Menu[]; // Para representar submenús en estructura jerárquica
  }
  
  export interface MenuUsuario {
    idmenu: number;
    login: string;
    pupdate: boolean;
    pinsert: boolean;
    pdelete?: boolean;
    pselect?: boolean;
    export?: boolean;
    estatus: 'ACTIVO' | 'INACTIVO';
  }
  
  export interface Tarea {
    idtarea?: number;
    fecha_registrado?: Date;
    login_registrado: string;
    tipo_tarea: 'NORMAL' | 'URGENTE' | 'PREVENTIVA' | 'CORRECTIVA';
    descripcion: string;
    estatus: 'PENDIENTE' | 'EN_PROCESO' | 'FINALIZADA' | 'CANCELADA';
    fecha_modificacion?: Date | null;
    login_modificacion?: string | null;
  }
  
  export interface DetalleTarea {
    iddetalletarea?: number;
    fktarea: number;
    fkequipo?: number | null;
    descripcion: string;
    responsable: string;
    estatus: 'PENDIENTE' | 'EN_PROCESO' | 'FINALIZADA' | 'CANCELADA';
    fecha_inicio: Date;
    fecha_fin?: Date | null;
    fecha_registro?: Date;
    login_registrado: string;
    fecha_modificacion?: Date | null;
    login_modificacion?: string | null;
  }
  
  // Interfaces para tablas legacy (puedes agregarlas si las necesitas)
  export interface OldBitacora {
    fecha: Date;
    hora?: string;
    folio: number;
    turno?: string;
    tipo: string;
    // ... otros campos según sea necesario
  }