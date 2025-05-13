import express from 'express';
import { body } from 'express-validator';
import { verCarrito, agregarAlCarrito, eliminarDelCarrito, actualizarCantidadCarrito,aplicarDescuento, descartarDescuento } from './controllers.js';
import { autenticado, tieneRol } from '../middleware/auth.js';

const carritoRouter = express.Router();

carritoRouter.get('/carrito', autenticado(), tieneRol(['U']), verCarrito);

// Añadir evento al carrito
carritoRouter.post('/agregar',
    autenticado(),
    tieneRol(['U']),
    body('id_evento').isInt().withMessage('ID de evento inválido'),
    body('precio').isFloat({ gt: 0 }).withMessage('Precio inválido'),
    agregarAlCarrito
);

// Eliminar evento del carrito
carritoRouter.post('/eliminar',
    autenticado(),
    tieneRol(['U']),
    body('id_evento').isInt().withMessage('ID de evento inválido'),
    eliminarDelCarrito
);

// Actualizar cantidad de un evento en el carrito
carritoRouter.post('/actualizar',
    autenticado(),
    tieneRol(['U']),
    body('id_evento').isInt().withMessage('ID de evento inválido'),
    body('accion').isIn(['sumar', 'restar']).withMessage('Acción inválida'),
    actualizarCantidadCarrito
);


carritoRouter.post('/aplicarDescuento',aplicarDescuento);
carritoRouter.post('/descartarDescuento',descartarDescuento);

export default carritoRouter;
