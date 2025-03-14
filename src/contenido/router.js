import express from 'express';

const contenidoRouter = express.Router();

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

export default contenidoRouter;