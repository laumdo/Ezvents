import express from 'express';

const contenidoRouter = express.Router();

contenidoRouter.get('/normal', (req, res) => {
    let contenido = 'paginas/noPermisos';
    if (req.session && req.session.login) {
        contenido = 'paginas/normal';
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

// Nueva ruta para gestionar eventos
contenidoRouter.get('/creaEventos', (req, res) => {
    let contenido ='paginas/creaEventos';
    res.render('pagina', { contenido, session: req.session });
});


export default contenidoRouter;