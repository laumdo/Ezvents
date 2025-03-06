import express from 'express';
import { viewLogin, doLogin, viewDatos, doLogout, viewRegister, doRegister } from './controllers.js';

const usuariosRouter = express.Router();

// /usuarios/login
usuariosRouter.get('/login', viewLogin);
usuariosRouter.post('/login', doLogin);
// /usuarios/logout
usuariosRouter.get('/logout', doLogout);

usuariosRouter.get('/datos', viewDatos);
// /usuarios/register
usuariosRouter.get('/register', viewRegister);
usuariosRouter.post('/register', doRegister);

export default usuariosRouter;