import express from 'express';
import multer from 'multer';
import { body, param, query } from 'express-validator';
import { viewEventos, viewEvento, agregarEvento, modificarEvento, eliminarEvento, buscarEvento } from './controllers.js';

const upload = multer({
  storage: multer.diskStorage({
    destination: 'static/img/',
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
  })
});

const router = express.Router();

router.get('/', viewEventos);

router.get('/buscarEvento',
  query('nombre').trim().notEmpty().withMessage('El nombre no puede estar vacío'),
  buscarEvento
);

router.get('/:id',
  param('id').isInt().withMessage('ID inválido'),
  viewEvento
);

router.post('/agregarEvento',
  body('nombre').trim().notEmpty(),
  body('descripcion').trim().notEmpty(),
  body('fecha').isISO8601(),
  body('lugar').trim().notEmpty(),
  body('precio').isFloat({ min: 0 }),
  body('aforo_maximo').isInt({ min: 1 }),
  agregarEvento
);

router.post('/modificarEvento',
  body('id').isInt(),
  body('nombre').optional().trim(),
  body('descripcion').optional().trim(),
  body('fecha').optional().isISO8601(),
  body('lugar').optional().trim(),
  body('precio').optional().isFloat({ min: 0 }),
  body('aforo_maximo').optional().isInt({ min: 1 }),
  modificarEvento
);

router.post('/eliminarEvento',
  //body('id').isInt(),
  body('id', 'ID inválido').isInt(),
  eliminarEvento
);

export default router;

