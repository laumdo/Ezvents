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
import carritoRouter from './carrito/router.js';
//import { procesarFormulario, viewImagen } from './simple/controladores.js';
export const app = express();

//const upload = multer({ dest: config.uploads });

getConnection(); 
Evento.initStatements(); 
Carrito.initStatements();

app.set('view engine', 'ejs');
app.set('views', config.vistas);

app.use(pinoMiddleware);
app.use(express.urlencoded({ extended: false }));
app.use(express.urlencoded({ extended: true }));
app.use(session(config.session));
app.use(flashMessages);
app.use(express.static('public'));
app.use(express.json());

app.use('/', express.static(config.recursos));

app.get('/', (req, res) => {
    const eventos=Evento.getAll();
    const params = {
        contenido: 'paginas/index', 
        session: req.session, 
        eventos,
        esInicio: true 
    }
    res.render('pagina', params);
})



app.use('/usuarios', usuariosRouter);
app.use('/contenido', contenidoRouter);
app.use('/eventos', eventosRouter);
app.use('/carrito', carritoRouter);
app.use((req, res, next) => {
    res.locals.session = req.session || {};  // Si session es undefined, asigna un objeto vacío
    next();
});
app.get('/contacto', (req, res) => {
    const params = {
        contenido: 'paginas/contacto',
        session: req.session
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

// Middleware de manejo de errores
//app.use(errorHandler);

app.use(errorHandler);

