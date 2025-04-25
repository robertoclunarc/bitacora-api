// Interfaces para request con usuario autenticado
export interface AuthUser {
    login: string;
    nombres: string;
    nivel: number;
    fkarea?: number;
    trabajador?: string;
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
    hora: string,
    turno: '1' | '2' | '3';
    login: string;
    fecha_hora_registrado?: Date;
    fkequipo?: number | null;
    tema?: string;
    descripcion: string;
    estatus: 'ACTIVO' | 'INACTIVO' | 'PENDIENTE' | 'FINALIZADO';
    critico?: boolean;    
    fkarea?: number,
    lugar?: string;
    tipo?: string;
    responsables?: string;      
    observacion?: string;
    que_se_hizo?: string;
    horas_duracion?: number;
    publico?: number;
    login_modificacion?: string
    fecha_modificacion?: string
    en_cartelera?: number
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
    asistio?: boolean;
    emailintegrante?: string | null;
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
    publico: boolean;
  }

  export interface CarteleraConArea {
    idcartelera?: number;
    fkarea: number;
    nombrearea?: string;
    nombre_usuario?: string;
    descripcion: string;
    login_registrado: string;
    fecha_registrado?: Date;
    fecha_inicio_publicacion: Date;
    fecha_fin_publicacion: Date;
    estatus: 'ACTIVO' | 'INACTIVO' | 'VENCIDO';
    tipo_info: 'WARNING' | 'DANGER' | 'INFO';
    publico: boolean;
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

  export interface MulterFile {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    destination: string;
    filename: string;
    path: string;
    buffer?: Buffer;
  }
  
  export interface Archivo {
    idarchivo?: number;
    fkbitacora: number;
    nombre_archivo: string;
    ruta_archivo: string;
    tipo_archivo: string;
    tamano: number;
    login_carga: string;
    descripcion: string | null;
    fecha_carga?: Date;
    activo?: number;
  }

  export interface TipoBitacora {
    idtipo: number;
    descripciontipo: string;
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

  export interface Pagination {
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  }

  export interface Incidencia {
    idincidencia?: number;
    descripcion: string;
    fecha: string;
    hora: string;
    observacion?: string;
    que_se_hizo?: string;
    tipoincidencia: string;
    critico?: boolean;
    login?: string;
    fecha_registro?: string;
    login_modificacion?: string | null;
    fecha_modificacion?: string;
    fkarea: number;
    involucrados?: string;
    en_cartelera?: boolean;
    estatus: string;
    fkequipo?: number | null;
  }
  
  export interface IncidenciaWithDetails extends Incidencia {
    nombre_area?: string;
    nombre_usuario?: string;
    nombre_equipo?: string;
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
    fkarea: number;
  }
  
  export interface TareaWithDetails extends Tarea {
    nombre_usuario?: string;
    nombre_area?: string;
    detalles_count?: number;
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
  
  export interface DetalleTareaWithDetails extends DetalleTarea {
    nombre_usuario?: string;
    nombre_equipo?: string;
  }