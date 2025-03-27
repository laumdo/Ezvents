import express from 'express';
import { viewLogin, doLogin, viewDatos, doLogout, viewRegister, doRegister, eliminarUsuario } from './controllers.js';
import { autenticado } from '../middleware/auth.js';
import { body } from 'express-validator';
import asyncHandler from 'express-async-handler';

const usuariosRouter = express.Router();

/*usuariosRouter.get('/login', viewLogin);
usuariosRouter.post('/login', doLogin);
usuariosRouter.get('/logout', doLogout);*/
usuariosRouter.get('/login', autenticado(null), asyncHandler(viewLogin));
usuariosRouter.post('/login', autenticado(null, '/usuarios/home')
    , body('username', 'No puede ser vacío').trim().notEmpty()
    , body('password', 'No puede ser vacío').trim().notEmpty()
    , asyncHandler(doLogin));
usuariosRouter.get('/logout', doLogout);


usuariosRouter.get('/datos', viewDatos);
usuariosRouter.post('/eliminarUsuario', eliminarUsuario);
/*usuariosRouter.get('/register', viewRegister);
usuariosRouter.post('/register', doRegister);*/

usuariosRouter.get('/register', autenticado(null, '/usuarios/home'), asyncHandler(viewRegister));
usuariosRouter.post('/register'
    , body('username', 'Sólo puede contener números y letras').trim().matches(/^[A-Z0-9]*$/i)
    , body('username', 'No puede ser vacío').trim().notEmpty()
    , body('nombre', 'No puede ser vacío').trim().notEmpty()
    , body('password', 'La contraseña no tiene entre 6 y 10 caracteres').trim().isLength({ min: 6, max: 10 })
    , body('passwordConfirmacion', 'La contraseña no coincide').custom((value, { req }) => {
        return value === req.body.password;
    })
    , asyncHandler(doRegister));

export default usuariosRouter;