import express from 'express';
import session from 'express-session';
import { config } from './config.js';
import usuariosRouter from './usuarios/router.js';
import contenidoRouter from './contenido/router.js';
import eventosRouter from './eventos/router.js';
import { logger } from './logger.js';
import pinoHttp  from 'pino-http';
const pinoMiddleware = pinoHttp(config.logger.http(logger));
import { flashMessages } from './middleware/flash.js';
import { errorHandler } from './middleware/error.js';
import { getConnection } from './db.js';
import {Evento} from './eventos/Evento.js';
import {Carrito} from './carrito/Carrito.js';
import foroRouter from './foros/router.js';
import { Descuento } from './descuentos/Descuento.js';
import { Usuario } from './usuarios/Usuario.js';
import { Foro } from './foros/Foro.js';
import carritoRouter from './carrito/router.js';
import {EntradasUsuario} from './entradasUsuario/EntradasUsuario.js';
import entradasRouter from './entradasUsuario/router.js';
import descuentosRouter from './descuentos/router.js';
import { DescuentosUsuario } from './descuentosUsuario/DescuentosUsuario.js';
import descuentosUsuarioRouter from "./descuentosUsuario/router.js";
import { EventoArtista } from './eventosArtistas/EventoArtista.js';
import eventosArtistasRouter from "./eventosArtistas/router.js";
import { Artista } from './artista/Artista.js';
import artistaRouter from './artista/router.js';
import { viewEventos } from './eventos/controllers.js';
import { Valoraciones } from './valoraciones/Valoracion.js';
import valoracionesRouter from './valoraciones/router.js';
import apiRouter from './apiRouter.js';

export const app = express();


//getConnection(); 
const db = getConnection();
Usuario.initStatements(db);
Evento.initStatements(db); 
Carrito.initStatements(db);
EntradasUsuario.initStatements(db);
Foro.initStatements();
Descuento.initStatements();
DescuentosUsuario.initStatements();
EventoArtista.initStatements();
Artista.initStatements();
Valoraciones.initStatements();

app.set('view engine', 'ejs');
app.set('views', config.vistas);
app.use('/api', apiRouter);
app.use(pinoMiddleware);
app.use(pinoHttp(config.logger.http(logger)));
app.use(express.urlencoded({ extended: false }));
app.use(express.urlencoded({ extended: true }));
app.use(session(config.session));
app.use((req, res, next) => {
    res.locals.session = req.session || {};  // Si session es undefined, asigna un objeto vacío
    next();
});
app.use(flashMessages);
// Sirve todo lo que haya en /static como archivos estáticos
app.use(express.static('static'));
app.use(express.json());

app.use('/', express.static(config.recursos));

app.get('/', viewEventos);



app.use('/usuarios', usuariosRouter);
app.use('/contenido', contenidoRouter);
app.use('/eventos', eventosRouter);
app.use('/carrito', carritoRouter);
app.use('/entradasUsuario', entradasRouter);
app.use('/foro', foroRouter);
app.use('/descuentos', descuentosRouter);
app.use('/eventosArtistas', eventosArtistasRouter);
app.use('/artista', artistaRouter);
app.use('/valoraciones', valoracionesRouter);


app.get('/contacto', (req, res) => {
    const params = {
        contenido: 'paginas/contacto',
        session: req.session
    };
    res.render('pagina', params);
});

app.get('/puntos', (req, res) => {
    if (!req.session.usuario) {
        return res.redirect('/usuarios/login'); // Solo accesible para usuarios logueados.
    }

    const usuarioId = req.session.usuario.id;
    const puntos = Usuario.getPuntosByUsuario(usuarioId); 
    const descuentos = Descuento.getAll(); 

    const params = {
        contenido: 'paginas/puntos',
        session: req.session,
        puntos,
        descuentos
    };

    res.render('pagina', params);
});



app.get('/evento', (req, res) => {
    const evento=Evento.getEventoById(req.params.id);
    const params = {
        contenido: 'paginas/evento', 
        session: req.session,
        evento
    };
    res.render('pagina', params);
});

app.get('/carrito', (req, res) => {
    const evento=Carrito.getCarrito();
    const params = {
        contenido: 'paginas/carrito', 
        session: req.session,
        evento
    };
    res.render('pagina', params);
});


// Middleware para manejar rutas no encontradas (404)
app.use((req, res, next) => {
    res.status(404).render('pagina', {
        contenido: 'paginas/error',
        mensaje: 'Oops, la página que buscas no existe',
        session: req.session
    });
});

app.use(async (req, res, next) => {
    res.locals.usuario = req.session?.usuario || null;

    if (res.locals.usuario) {
       
        res.locals.descuentos = await Descuento.getAll();
    } else {
        res.locals.descuentos = [];
    }

    next();
});

app.use("/descuentosUsuario", descuentosUsuarioRouter);

app.use(errorHandler);

