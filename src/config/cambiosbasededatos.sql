ALTER TABLE `usuarios` ADD `password` VARCHAR(500) NOT NULL AFTER `email`;
INSERT INTO `areas` (`idarea`, `nombrearea`, `estatusarea`, `responsable`) VALUES (NULL, 'Tecnologia', 'ACTIVO', 'Roberto Lunar');
{ 
	"login":"matlux", 
 "trabajador":"16395343", 
 "estatus":"ACTIVO", 
 "nivel":"3", 
 "nombres":"Roberto Lunar", 
 "fkarea":"1", 
 "email":"matlux@briqven.com.ve", 
 "password":"matesi.6"
}

INSERT INTO `menus` (`idmenu`, `idpadre`, `name`, `url`, `href`, `icon`, `badge_text`, `badge_variant`, `badge_class`, `variant`, `attributes`, `attributes_element`, `divider`, `class`, `label_class`, `label_variant`, `wrapper_attributes`, `wrapper_element`, `linkprops`, `title`, `estatus`, `orden`) VALUES
(3, 0, 'Dashboard', '/dashboard', 'CNavItem', 'cilSpeedometer', 'NEW', 'info', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 1),
(4, 3, 'Registros', NULL, 'CNavTitle', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 2),
(5, 4, 'Bitácoras', '/bitacoras', 'CNavItem', 'cilNotes', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 3),
(6, 4, 'Reuniones', '/reuniones', 'CNavItem', 'cilCalendar', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 4),
(7, 4, 'Carteleras', '/carteleras', 'CNavItem', 'cilClipboard', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 5),
(8, 4, 'Registros Force', 'force/registros', 'CNavItem', 'cilStar', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 6),
(9, 3, 'Administración', NULL, 'CNavTitle', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 8),
(10, 9, 'Force', '/force', 'CNavGroup', 'cilPuzzle', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 10),
(11, 10, 'Sistemas', '/force/sistemas', 'CNavItem', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 11),
(12, 10, 'Señales', '/force/senales', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 12),
(13, 9, 'Configuración', NULL, 'CNavGroup', 'cilSettings', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 13),
(14, 13, 'Áreas', '/configuracion/areas', 'CNavItem', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 14),
(15, 13, 'Equipos', '/configuracion/equipos', 'CNavItem', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 15),
(16, 13, 'Usuarios', '/configuracion/usuarios', 'CNavItem', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 16);


INSERT INTO `menus_usuarios` (`idmenu`, `login`, `pupdate`, `pinsert`, `pdelete`, `pselect`, `export`, `estatus`) VALUES
(3, 'matlux', 1, 1, 1, 1, 1, 'ACTIVO'),
(4, 'matlux', 1, 1, 1, 1, 0, 'ACTIVO'),
(5, 'matlux', 1, 1, 1, 1, 1, 'ACTIVO'),
(6, 'matlux', 1, 1, 1, 1, 1, 'ACTIVO'),
(7, 'matlux', 1, 1, 1, 1, 1, 'ACTIVO'),
(8, 'matlux', 1, 1, 1, 1, 1, 'ACTIVO'),
(9, 'matlux', 1, 1, 1, 1, 1, 'ACTIVO'),
(10, 'matlux', 1, 1, 1, 1, 1, 'ACTIVO'),
(11, 'matlux', 1, 1, 1, 1, 1, 'ACTIVO'),
(12, 'matlux', 1, 1, 1, 1, 1, 'ACTIVO'),
(13, 'matlux', 1, 1, 1, 1, 1, 'ACTIVO'),
(14, 'matlux', 1, 1, 1, 1, 1, 'ACTIVO'),
(15, 'matlux', 1, 1, 1, 1, 1, 'ACTIVO'),
(16, 'matlux', 1, 1, 1, 1, 1, 'ACTIVO');

ALTER TABLE `carteleras` CHANGE `tipo_info` `tipo_info` ENUM('INFO','WARNING','DANGER') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'INFO';
ALTER TABLE `carteleras` ADD `publico` BOOLEAN NOT NULL DEFAULT TRUE AFTER `tipo_info`;

INSERT INTO `tipobitacoras` (`idtipo`, `descripciontipo`) VALUES (NULL, 'ELECTRICA'), (NULL, 'SUPERVISION MATENIMIENTO'), (NULL, 'MATENIMIENTO GENERAL'), (NULL, 'CONTROL'), (NULL, 'INSTRUMENTACION'), (NULL, 'MACANICA'), (NULL, 'OPERACION'), (NULL, 'PROCESO'), (NULL, 'LABORATORIO'), (NULL, 'LOGISTICA'), (NULL, 'BRIQUETEADORA'), (NULL, 'TECNICO DE CAMPO'), (NULL, 'TECNOLOGIA');

CREATE TABLE `archivos` (
  `idarchivo` int(11) NOT NULL AUTO_INCREMENT,
  `fkbitacora` int(11) NOT NULL,
  `nombre_archivo` varchar(255) NOT NULL,
  `ruta_archivo` varchar(255) NOT NULL,
  `tipo_archivo` varchar(100) DEFAULT NULL,
  `tamano` bigint(20) NOT NULL,
  `fecha_carga` timestamp NOT NULL DEFAULT current_timestamp(),
  `login_carga` varchar(6) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`idarchivo`),
  KEY `fk_archivos_bitacora` (`fkbitacora`),
  CONSTRAINT `fk_archivos_bitacora` FOREIGN KEY (`fkbitacora`) REFERENCES `bitacora` (`idbitacora`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `bitacora` (
  `idbitacora` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `turno` enum('1','2','3') NOT NULL,
  `login` varchar(6) NOT NULL,
  `fecha_hora_registrado` timestamp NOT NULL DEFAULT current_timestamp(),
  `fkequipo` int(11) DEFAULT NULL,
  `tema` varchar(255) DEFAULT NULL,
  `descripcion` text NOT NULL,
  `estatus` enum('ACTIVO','INACTIVO','PENDIENTE','FINALIZADO') NOT NULL DEFAULT 'ACTIVO',
  `critico` tinyint(1) NOT NULL DEFAULT 0,
  `lugar` TEXT NULL DEFAULT NULL,
  `hora` time NOT NULL,
  `fkarea` int(11) NOT NULL,
  `tipo` varchar(20) DEFAULT NULL,
  `responsables` text NOT NULL,
  `login_modificacion` varchar(6) DEFAULT NULL,
  `fecha_modificacion` datetime DEFAULT NULL,
  `observacion` text DEFAULT NULL,
  `que_se_hizo` text DEFAULT NULL,
  `horas_duracion` decimal(10,0) DEFAULT NULL,
  `publico` BOOLEAN NOT NULL DEFAULT TRUE,
  `en_cartelera` BOOLEAN NULL DEFAULT NULL
);

ALTER TABLE `bitacora`
  ADD PRIMARY KEY (`idbitacora`),
  ADD KEY `idx_bitacora_fecha` (`fecha`),
  ADD KEY `idx_bitacora_login` (`login`),
  ADD KEY `idx_bitacora_fkequipo` (`fkequipo`),
  ADD KEY `idx_bitacora_estatus` (`estatus`),
  ADD KEY `idx_bitacora_critico` (`critico`),
  ADD KEY `fkarea` (`fkarea`);

ALTER TABLE `bitacora`
  MODIFY `idbitacora` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `bitacora`
  ADD CONSTRAINT `fk_bitacora_equipo` FOREIGN KEY (`fkequipo`) REFERENCES `equipos` (`idequipo`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

INSERT INTO `menus` (`idmenu`, `idpadre`, `name`, `url`, `href`, `icon`, `badge_text`, `badge_variant`, `badge_class`, `variant`, `attributes`, `attributes_element`, `divider`, `class`, `label_class`, `label_variant`, `wrapper_attributes`, `wrapper_element`, `linkprops`, `title`, `estatus`, `orden`) VALUES
(17, 4, 'Incidencias', '/incidencias', 'CNavItem', 'cilBellExclamation', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 5),
(18, 4, 'Actividades', '/tareas', 'CNavItem', 'cilFeaturedPlaylist', 'Tareas', 'warning', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 5)

INSERT INTO `menus_usuarios` (`idmenu`, `login`, `pupdate`, `pinsert`, `pdelete`, `pselect`, `export`, `estatus`) VALUES
(17, 'matlux', 1, 1, 1, 1, 1, 'ACTIVO'),
(18, 'matlux', 1, 1, 1, 1, 1, 'ACTIVO')

CREATE TABLE `incidencias` (
  `idincidencia` int(11) NOT NULL,
  `descripcion` text NOT NULL,
  `fecha` date NOT NULL,
  `hora` time NOT NULL,
  `observacion` text DEFAULT NULL,
  `que_se_hizo` text DEFAULT NULL,
  `tipoincidencia` varchar(50) NOT NULL,
  `critico` tinyint(1) DEFAULT NULL,
  `login` varchar(6) DEFAULT NULL,
  `fecha_registro` datetime DEFAULT NULL,
  `login_modificacion` varchar(6) NOT NULL,
  `fecha_modificacion` datetime DEFAULT NULL,
  `fkarea` int(11) NOT NULL,
  `involucrados` text DEFAULT NULL,
  `en_cartelera` tinyint(1) NULL DEFAULT NULL,
  `estatus` varchar(10) NOT NULL,
  `incidencias` ADD `fkequipo` INT NULL;
)

ALTER TABLE `incidencias` ADD INDEX(`fkequipo`);

ALTER TABLE `tareas` ADD `fkarea` INT NOT NULL AFTER `login_modificacion`;
ALTER TABLE `tareas` ADD INDEX(`fkarea`);