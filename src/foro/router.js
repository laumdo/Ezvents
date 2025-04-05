import express from 'express';
import { verForo, agregarMensaje } from './foroController.js';

const foroRouter = express.Router();

foroRouter.get('/:id', verForo);
foroRouter.post('/agregar', agregarMensaje);

export default foroRouter;