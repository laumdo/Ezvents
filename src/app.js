import express from 'express';
import session from 'express-session';
import { config } from './config.js';
import usuariosRouter from './usuarios/router.js';
import contenidoRouter from './contenido/router.js';
import eventosRouter from './eventos/router.js';
import { getConnection } from './db.js';
import {Evento} from './eventos/Evento.js';
import {Carrito} from './carrito/Carrito.js';
import carritoRouter from './carrito/router.js';
export const app = express();

getConnection(); 
Evento.initStatements(); 
Carrito.initStatements();

app.set('view engine', 'ejs');
app.set('views', config.vistas);

app.use(express.urlencoded({ extended: true }));
app.use(session(config.session));
app.use(express.static('public'));
app.use(express.json());

app.use('/', express.static(config.recursos));

app.get('/', (req, res) => {
    // Parámetros que estarán disponibles en la plantilla
    const eventos=Evento.getAll();
    const params = {
        contenido: 'paginas/index', // fichero ejs que tiene el contenido específico para esta vista
        session: req.session, 
        eventos,
        esInicio: true // Indica que estás en la pantalla de inicio
    }
    res.render('pagina', params);
})



app.use('/usuarios', usuariosRouter);
app.use('/contenido', contenidoRouter);
app.use('/eventos', eventosRouter);
app.use('/carrito', carritoRouter);

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
        contenido: 'paginas/carrito', // Se asume que la vista está en views/paginas/contacto.ejs
        session: req.session,
        evento
    };
    res.render('pagina', params);
});

