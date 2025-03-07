import express from 'express';
import { verCarrito, agregarAlCarrito, eliminarDelCarrito } from './controllers.js';

const carritoRouter = express.Router();

carritoRouter.get('/carrito', verCarrito);
carritoRouter.post('/agregar', agregarAlCarrito);
carritoRouter.post('/eliminar', eliminarDelCarrito);


export default carritoRouter;
