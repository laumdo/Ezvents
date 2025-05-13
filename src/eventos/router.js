import express from 'express';
import multer from 'multer';
import { body, param, query } from 'express-validator';
import {
  viewEventos,
  viewEvento,
  agregarEvento,
  modificarEvento,
  eliminarEvento,
  buscarEvento,
  apiEventos,
  viewCalendario,
  viewEventosPasados
} from './controllers.js';

const upload = multer({
  storage: multer.diskStorage({
    destination: 'static/img/',
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
  })
});

const router = express.Router();

// Ver eventos y calendario
router.get('/', viewEventos);
router.get('/calendario', viewCalendario);

// Buscar evento por nombre
router.get('/buscarEvento',
  query('nombre').trim().notEmpty().withMessage('El nombre no puede estar vacío'),
  buscarEvento
);

eventosRouter.get('/pasados', viewEventosPasados);
// Ver detalle de evento
router.get('/:id',
  param('id').isInt().withMessage('ID inválido'),
  viewEvento
);

// Agregar evento (con imagen)
router.post('/agregarEvento',
  upload.single('imagen'), 
  body('nombre', 'El nombre no puede ser vacio').trim().notEmpty(),
  body('descripcion', 'La descripcion no puede ser vacia').trim().notEmpty(),
  body('fecha', 'Fecha necesaria').isISO8601(),
  body('lugar', 'Lugar necesario').trim().notEmpty(),
  body('precio', 'Precio no puede ser nulo').isFloat({ min: 0 }),
  body('aforo_maximo', 'Aforo mayor que 0').isInt({ min: 1 }),
  body('edad_minima', 'Edad mínima debe ser número').isInt({ min: 0 }),
  agregarEvento
);

// Modificar evento (imagen opcional)
router.post('/modificarEvento',
  upload.single('imagen'), 
  body('id').isInt(),
  body('nombre').optional().trim(),
  body('descripcion').optional().trim(),
  body('fecha').optional().isISO8601(),
  body('lugar').optional().trim(),
  body('precio', 'Precio tiene que ser mayor que 0').optional().isFloat({ min: 0 }),
  body('aforo_maximo', 'Aforo tiene que ser mayor que 0').optional().isInt({ min: 1 }),
  body('edad_minima', 'Edad mínima debe ser número').optional().isInt({ min: 0 }),
  modificarEvento
);

// Eliminar evento
router.post('/eliminarEvento',
  body('id', 'ID inválido').isInt(),
  eliminarEvento
);

export default router;
