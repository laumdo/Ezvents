// foro/router.js
import express from 'express';
import { mostrarForo, agregarMensaje } from './controller.js';

const router = express.Router();

// Ruta para mostrar el foro de un evento
router.get('/:id', mostrarForo);

// Ruta para agregar un mensaje al foro
router.post('/agregar', agregarMensaje);

export default router;