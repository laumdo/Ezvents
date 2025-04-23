import express from 'express';
import { verCarrito, agregarAlCarrito, eliminarDelCarrito, actualizarCantidadCarrito } from './controllers.js';

const carritoRouter = express.Router();

carritoRouter.get('/carrito', verCarrito);
carritoRouter.post('/agregar', agregarAlCarrito);
carritoRouter.post('/eliminar', eliminarDelCarrito);
carritoRouter.post('/actualizar', actualizarCantidadCarrito);


export default carritoRouter;
