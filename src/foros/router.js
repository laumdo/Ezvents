// foro/router.js
import express from 'express';
import { mostrarForo, agregarMensaje, eliminarMensaje } from './controller.js';

const router = express.Router();

// Ruta para mostrar el foro de un evento
router.get('/:id', mostrarForo);

// Ruta para agregar un mensaje al foro
router.post('/agregar', agregarMensaje);

// Ruta para eliminar un mensaje del foro
router.post('/eliminar', eliminarMensaje);

export default router;