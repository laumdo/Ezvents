import express from 'express';
import { viewLogin, doLogin, doLogout, eliminarUsuario } from './controllers.js';

const usuariosRouter = express.Router();

// /usuarios/login
usuariosRouter.get('/login', viewLogin);
usuariosRouter.post('/login', doLogin);
// /usuarios/logout
usuariosRouter.get('/logout', doLogout);
// Ruta para eliminar un evento
usuariosRouter.post('/eliminar', eliminarUsuario);

export default usuariosRouter;