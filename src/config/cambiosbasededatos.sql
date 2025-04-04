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