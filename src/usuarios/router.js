import express from 'express';
import { viewLogin, doLogin, doLogout } from './controllers.js';

const usuariosRouter = express.Router();

// /usuarios/login
usuariosRouter.get('/login', viewLogin);
usuariosRouter.post('/login', doLogin);
// /usuarios/logout
usuariosRouter.get('/logout', doLogout);

export default usuariosRouter;