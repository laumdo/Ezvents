import { param, validationResult } from 'express-validator';
import { Evento } from './Evento.js';

export function viewEventos(req, res) {
    const eventos = Evento.getAll();
        res.render('pagina', { contenido: 'paginas/eventos', session: req.session, eventos });
    /*try {
        const eventos = Evento.getAll();
        res.render('pagina', { contenido: 'paginas/eventos', session: req.session, eventos });
    } catch (error) {
        res.status(500).render('pagina', { contenido: 'paginas/error', mensaje: 'Error al obtener eventos' });
    }*/
}

export function viewEvento(req, res) {
    param('id').isInt().withMessage('ID de evento inválido'); // Validar que el ID es un número entero

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).render('pagina', { contenido: 'paginas/error', mensaje: 'ID de evento inválido' });
    }

    try {
        const evento = Evento.getEventoById(req.params.id);
        res.render('pagina', { contenido: 'paginas/evento', session: req.session, evento });
    } catch (error) {
        res.status(404).render('pagina', { contenido: 'paginas/error', mensaje: 'Evento no encontrado' });
    }
}

export function agregarEvento(req, res) {
    try {
        const { nombre, descripcion, fecha, lugar, precio, aforo_maximo } = req.body;
        const imagen = req.file ? req.file.filename : 'default.png'; // Si no hay imagen, usa la predeterminada

        const nuevoEvento = new Evento(null, nombre, descripcion, fecha, lugar, precio, aforo_maximo, 0, imagen);
        nuevoEvento.persist();

        res.redirect('/eventos'); // Redirigir a la lista de eventos
    } catch (error) {
        res.status(400).send("Error al agregar el evento.");
    }
}