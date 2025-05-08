import express from 'express';
import { body, param } from 'express-validator';
import { mostrarForo, agregarMensaje, eliminarMensaje } from './controller.js';
import { autenticado } from '../middleware/auth.js';
import asyncHandler from 'express-async-handler';

const router = express.Router();

// Ver foro de un evento
router.get('/:id',
    param('id').isInt().withMessage('El ID del evento debe ser un número entero'),
    asyncHandler(mostrarForo)
);

// Agregar mensaje o respuesta
router.post('/agregar',
autenticado('/usuarios/login'),
    body('idEvento').isInt().withMessage('El ID del evento debe ser un número entero'),
    body('contenido').isLength({ min: 1 }).withMessage('El contenido no puede estar vacío'),
    body('parent_id').optional({ checkFalsy: true }).isInt().withMessage('El parent_id debe ser numérico'),
    asyncHandler(agregarMensaje)
);

// Eliminar mensaje
router.post('/eliminar',
    autenticado('/usuarios/login'),
    body('idMensaje').isInt().withMessage('El ID del mensaje debe ser un número entero'),
    body('idEvento').isInt().withMessage('El ID del evento debe ser un número entero'),
    asyncHandler(eliminarMensaje)
);

export default router;
