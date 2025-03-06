import express from 'express';
import session from 'express-session';
import { config } from './config.js';
import usuariosRouter from './usuarios/router.js';
import contenidoRouter from './contenido/router.js';
import eventosRouter from './eventos/router.js';
import { getConnection } from './db.js'; // Asegúrate de la ruta correcta
import {Evento} from './eventos/Evento.js';
export const app = express();

getConnection(); 
Evento.initStatements(); 

app.set('view engine', 'ejs');
app.set('views', config.vistas);

app.use(express.urlencoded({ extended: true }));
app.use(session(config.session));
app.use(express.json());

app.use('/', express.static(config.recursos));

app.get('/', (req, res) => {
    // Parámetros que estarán disponibles en la plantilla
    const eventos=Evento.getAll();
    const params = {
        contenido: 'paginas/index', // fichero ejs que tiene el contenido específico para esta vista
        session: req.session, 
        eventos
    }
    res.render('pagina', params);
})



app.use('/usuarios', usuariosRouter);
app.use('/contenido', contenidoRouter);
app.use('/eventos', eventosRouter);

app.get('/contacto', (req, res) => {
    const params = {
        contenido: 'paginas/contacto', // Se asume que la vista está en views/paginas/contacto.ejs
        session: req.session
    };
    res.render('pagina', params);
});

app.get('/crearCuenta', (req, res) => {
    const params = {
        contenido: 'paginas/crearCuenta', // Se asume que la vista está en views/paginas/contacto.ejs
        session: req.session
    };
    res.render('pagina', params);
});

