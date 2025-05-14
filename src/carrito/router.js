import express from 'express';
import { body } from 'express-validator';
import { verCarrito, agregarAlCarrito, eliminarDelCarrito, actualizarCantidadCarrito,aplicarDescuento, descartarDescuento } from './controllers.js';
import { autenticado, tieneRol } from '../middleware/auth.js';
import { RolesEnum } from '../usuarios/Usuario.js';

const carritoRouter = express.Router();

carritoRouter.get('/carrito', tieneRol(RolesEnum.USUARIO), autenticado(),  verCarrito);

carritoRouter.post('/agregar',
    autenticado(),
    tieneRol(RolesEnum.USUARIO),
    body('id_evento').isInt().withMessage('ID de evento inválido'),
    body('precio').isFloat({ gt: 0 }).withMessage('Precio inválido'),
    agregarAlCarrito
);

carritoRouter.post('/eliminar',
    autenticado(),
    tieneRol(RolesEnum.USUARIO),
    body('id_evento').isInt().withMessage('ID de evento inválido'),
    eliminarDelCarrito
);

carritoRouter.post('/actualizar',
    express.json(),
    autenticado(),
    tieneRol(RolesEnum.USUARIO),
    body('id_evento').isInt().withMessage('ID de evento inválido'),
    body('accion').isIn(['sumar', 'restar']).withMessage('Acción inválida'),
    actualizarCantidadCarrito
);


carritoRouter.post('/aplicarDescuento',
    express.json(),
    aplicarDescuento
);
carritoRouter.post('/descartarDescuento',descartarDescuento);

export default carritoRouter;
