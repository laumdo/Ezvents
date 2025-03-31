import express from 'express';

/*const contenidoRouter = express.Router();

contenidoRouter.get('/normal', (req, res) => {
    let contenido = 'paginas/noPermisos';
    if (req.session && req.session.login) {
        contenido = 'paginas/index';
    }
    res.render('pagina', {
        contenido,
        session: req.session
    });
});

contenidoRouter.get('/admin', (req, res) => {
    let contenido = 'paginas/noPermisos';
    if(req.session && req.session.login && req.session.esAdmin){
        contenido = 'paginas/admin';
    }
    res.render('pagina', {
        contenido,
        session: req.session
    });
});

contenidoRouter.get('/empresa', (req, res) => {
    let contenido = 'paginas/noPermisos';
    if(req.session && req.session.login && req.session.esEmpresa){
        contenido = 'paginas/empresa';
    }
    res.render('pagina', {
        contenido,
        session: req.session
    });
});

export default contenidoRouter;*/
import { viewContenidoAdmin, viewContenidoNormal,viewContenidoEmpresa } from './controllers.js';
import { autenticado, tieneRol } from '../middleware/auth.js';
import { RolesEnum } from '../usuarios/Usuario.js';
import asyncHandler from 'express-async-handler';

const contenidoRouter = express.Router();

contenidoRouter.use(autenticado('/usuarios/login'));

contenidoRouter.get('/normal', asyncHandler(viewContenidoNormal));

contenidoRouter.get('/admin', tieneRol(RolesEnum.ADMIN), asyncHandler(viewContenidoAdmin));

contenidoRouter.get('/empresa',tieneRol(RolesEnum.EMPRESA),asyncHandler(viewContenidoEmpresa) )
export default contenidoRouter;