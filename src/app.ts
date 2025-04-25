import express, { Application} from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import areasRoutes from './routes/areasRoutes';
import bitacorasRoutes from './routes/bitacoras.routes';
import equiposRoutes from './routes/equipos.routes';
import reunionesRoutes from './routes/reuniones.routes';
import minutasRoutes from './routes/minutas.routes';
import usuariosRoutes from './routes/usuarios.routes';
import integrantesReunionRoutes from './routes/integrantes-reunion.routes';
import cartelerasRoutes from './routes/carteleras.routes';
import sistemasForceRoutes from './routes/sistemas-force.routes';
import senalesForceRoutes from './routes/senales-force.routes';
import forceRoutes from './routes/force.routes';
import menusRoutes from './routes/menus.routes';
import menusUsuariosRoutes from './routes/menus-usuarios.routes';
import oldBitacorasRoutes from './routes/old-bitacoras.routes';
import archivosRoutes from './routes/archivosRoutes';
import tipoBitacorasRoutes from './routes/tipoBitacoras.routes';
import incidenciasRoutes  from './routes/incidencia.routes';
import tareasRoutes from './routes/tarea.routes';
import { testConnection } from './config/database';
import config from './config/config';
import morgan from 'morgan';
// Importar las demás rutas aquí

// Cargar variables de entorno
dotenv.config();

// Crear la aplicación Express
const app: Application = express();
const PORT = config.port;

// Middlewares
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api-bitacora/auth', authRoutes);
app.use('/api-bitacora/areas', areasRoutes);
app.use('/api-bitacora/old-bitacoras', oldBitacorasRoutes);
app.use('/api-bitacora/usuarios', usuariosRoutes);
app.use('/api-bitacora/bitacoras', bitacorasRoutes);
app.use('/api-bitacora/equipos', equiposRoutes);
app.use('/api-bitacora/reuniones', reunionesRoutes);
app.use('/api-bitacora/integrantes-reunion', integrantesReunionRoutes);
app.use('/api-bitacora/carteleras', cartelerasRoutes);
app.use('/api-bitacora/sistemas-force', sistemasForceRoutes);
app.use('/api-bitacora/force', forceRoutes);
app.use('/api-bitacora/menus', menusRoutes);
app.use('/api-bitacora/menus-usuarios', menusUsuariosRoutes);
app.use('/api-bitacora/senales-force', senalesForceRoutes);
app.use('/api-bitacora/archivos', archivosRoutes);
app.use('/api-bitacora/minutas', minutasRoutes);
app.use('/api-bitacora/tiposbitacoras', tipoBitacorasRoutes);
app.use('/api-bitacora/incidencias', incidenciasRoutes);
app.use('/api-bitacora/tareas', tareasRoutes);

// Ruta de verificación básica
app.get('/', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'API de Bitácora funcionando correctamente' });
});

// Manejo de errores global
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Iniciar el servidor
const startServer = async () => {
  try {    
    // Probar la conexión a la base de datos
    await testConnection()
    
    // Iniciar el servidor
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();