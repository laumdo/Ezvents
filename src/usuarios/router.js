import express from 'express';
import { viewLogin, doLogin, viewDatos, doLogout, viewRegister, doRegister, eliminarUsuario } from './controllers.js';

const usuariosRouter = express.Router();

// /usuarios/login
usuariosRouter.get('/login', viewLogin);
usuariosRouter.post('/login', doLogin);
// /usuarios/logout
usuariosRouter.get('/logout', doLogout);

usuariosRouter.get('/datos', viewDatos);
// Ruta para eliminar un evento
usuariosRouter.post('/eliminarUsuario', eliminarUsuario);
// /usuarios/register
usuariosRouter.get('/register', viewRegister);
usuariosRouter.post('/register', doRegister);

export default usuariosRouter;