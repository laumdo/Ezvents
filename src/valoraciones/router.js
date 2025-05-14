import express from 'express';
import { body, param } from 'express-validator';
import { anadirValoracion, viewValoraciones, viewValorar } from './controllers.js';
import { autenticado, tieneRol } from '../middleware/auth.js';
import { RolesEnum } from '../usuarios/Usuario.js';

const valoracionesRouter = express.Router();

valoracionesRouter.get('/valoraciones/:id_evento',
    param('id_evento').isInt().withMessage('ID de evento inválido'),
    viewValoraciones
);

valoracionesRouter.get('/valorar/:id_evento',
    autenticado(),
    tieneRol(RolesEnum.USUARIO),
    param('id_evento').isInt().withMessage('ID de evento inválido'),
    viewValorar
);

valoracionesRouter.post('/anadir',
    express.urlencoded({ extended: true }),
    autenticado(),
    tieneRol(RolesEnum.USUARIO),
    body('id_evento').isInt().withMessage('ID de evento inválido'),
    body('puntuacion').isInt({ min: 0, max: 5 }).withMessage('La puntuacion debe estar entre 0 y 5'),
    body('comentario').optional().isLength({ max: 500 }).withMessage('Comentario demasiado largo'),
    anadirValoracion
);

export default valoracionesRouter;
