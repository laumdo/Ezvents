import express from 'express';
import multer from 'multer';
import { 
  viewEventos, 
  viewEvento, 
  agregarEvento, 
  eliminarEvento, 
  modificarEvento, 
  buscarEvento,
  apiEventos,
  viewCalendario,
  viewEventosPasados
} from './controllers.js';

// Configuración de multer para manejar la subida de archivos
const storage = multer.diskStorage({
  destination: 'static/img/',
  filename: (req, file, cb) => {
    // Se genera un nombre único para evitar colisiones
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

const eventosRouter = express.Router();

// Rutas de eventos
eventosRouter.get('/', viewEventos);
eventosRouter.get('/buscarEvento', buscarEvento);
eventosRouter.get('/api/eventos', apiEventos);
eventosRouter.get('/calendario', viewCalendario); 

// La ruta para agregar evento se define como POST, ya que el formulario usa method="POST"
eventosRouter.post('/agregarEvento', upload.single('imagen'), agregarEvento);

eventosRouter.get('/pasados', viewEventosPasados);

eventosRouter.get('/:id', viewEvento);
eventosRouter.post('/eliminarEvento', eliminarEvento);
eventosRouter.post('/modificarEvento', modificarEvento);
export default eventosRouter;
