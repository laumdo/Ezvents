import express from 'express';
import multer from 'multer';
import { viewEventos, viewEvento, agregarEvento, eliminarEvento, modificarEvento,buscarEvento/*, comprarEntrada */} from './controllers.js';


const eventosRouter = express.Router();

// Configuración de multer para guardar imágenes en /static/uploads
const storage = multer.diskStorage({
    destination: 'static/img/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // Guarda la imagen con un nombre único
    }
});

const upload = multer({ storage });

// Ruta para agregar un evento con imagen
eventosRouter.post('/agregarEvento', upload.single('imagen'), agregarEvento);

// Mostrar la lista de eventos
eventosRouter.get('/', viewEventos);

// 1. Primero la ruta de búsqueda
eventosRouter.get('/buscarEvento', buscarEvento);


// 2. Luego la ruta para ID
eventosRouter.get('/:id', viewEvento);


// Ver detalles de un evento específico
//eventosRouter.get('/:id', viewEvento);


// Comprar una entrada para un evento
//eventosRouter.post('/:id/comprar', comprarEntrada);
// Ruta para crear un evento
//eventosRouter.post('/crear', crearEvento);

// Ruta para eliminar un evento
eventosRouter.post('/eliminarEvento', eliminarEvento);

// Ruta para modificar un evento
eventosRouter.post('/modificarEvento', modificarEvento);




export default eventosRouter;
