import express from 'express';
import { body, param } from 'express-validator';
import { mostrarForo, agregarMensaje, eliminarMensaje } from './controller.js';
import { autenticado } from '../middleware/auth.js';
import asyncHandler from 'express-async-handler';

const router = express.Router();

router.get('/:id',
    param('id').isInt().withMessage('El ID del evento debe ser un número entero'),
    asyncHandler(mostrarForo)
);

router.post('/agregar',
    autenticado(),
    body('idEvento').isInt().withMessage('El ID del evento debe ser un número entero'),
    body('contenido').isLength({ min: 1 }).withMessage('El contenido no puede estar vacío'),
    asyncHandler(agregarMensaje)
);

router.post('/eliminar',
    autenticado(),
    body('idMensaje').isInt().withMessage('El ID del mensaje debe ser un número entero'),
    asyncHandler(eliminarMensaje)
);

export default router;
