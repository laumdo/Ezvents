import express from 'express';
import { verCarrito, agregarAlCarrito, eliminarDelCarrito, actualizarCantidadCarrito,aplicarDescuento, descartarDescuento } from './controllers.js';

const carritoRouter = express.Router();

carritoRouter.get('/carrito', verCarrito);
carritoRouter.post('/agregar', agregarAlCarrito);
carritoRouter.post('/eliminar', eliminarDelCarrito);
carritoRouter.post('/actualizar', actualizarCantidadCarrito);
carritoRouter.post('/aplicarDescuento',aplicarDescuento);
carritoRouter.post('/descartarDescuento',descartarDescuento);

export default carritoRouter;
