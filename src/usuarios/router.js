import express from 'express';
import { viewLogin, doLogin, viewDatos, doLogout, viewRegister, doRegister, eliminarUsuario } from './controllers.js';

const usuariosRouter = express.Router();

usuariosRouter.get('/login', viewLogin);
usuariosRouter.post('/login', doLogin);
usuariosRouter.get('/logout', doLogout);

usuariosRouter.get('/datos', viewDatos);
usuariosRouter.post('/eliminarUsuario', eliminarUsuario);
usuariosRouter.get('/register', viewRegister);
usuariosRouter.post('/register', doRegister);

export default usuariosRouter;