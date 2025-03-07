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
    param('id').isInt().withMessage('ID de evento inválido'); // Esto no está validando correctamente el ID
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).render('pagina', { contenido: 'paginas/error', mensaje: 'ID de evento inválido' });
    }

    try {
        const evento = Evento.getEventoById(req.params.id);
        res.render('pagina', { contenido: 'paginas/eventos', session: req.session, evento });
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

        res.render('pagina', { 
            contenido: 'paginas/index', 
            session: req.session,
            mensaje: 'Evento modificado con éxito' });
    } catch (error) {
        res.status(400).send("Error al agregar el evento.");
    }
}

export function modificarEvento(req, res) {
    try {
        const { id, nombre, descripcion, fecha, lugar, precio, aforo_maximo, imagen } = req.body;

        let evento = Evento.getEventoById(id);
        if (!evento) throw new EventoNoEncontrado(id);

        // Actualizar solo los campos que han cambiado
        evento.nombre = nombre || evento.nombre;
        evento.descripcion = descripcion || evento.descripcion;
        evento.fecha = fecha || evento.fecha;
        evento.lugar = lugar || evento.lugar;
        evento.precio = precio || evento.precio;
        evento.aforo_maximo = aforo_maximo || evento.aforo_maximo;
        evento.imagen = imagen || evento.imagen;

        // Guardar cambios en la base de datos
        evento.persist(); // Esto llamará a Evento.#update(evento)

        res.render('pagina', { 
            contenido: 'paginas/admin', 
            session: req.session,
            mensaje: 'Evento modificado con éxito' });
    } catch (error) {
        res.render('pagina', { contenido: 'paginas/admin', error: 'Error al modificar el evento' });
    }
}

export function eliminarEvento(req, res) {
    try {

        const { id } = req.body;
        Evento.getEventoById(id);
        //if (!evento) throw new EventoNoEncontrado(id);

        // Eliminar evento
        Evento.delete(id);

        res.render('pagina', { 
            contenido: 'paginas/admin',
            session: req.session, 
            mensaje: 'Evento eliminado con éxito' });
    } catch (error) {
        res.render('pagina', { contenido: 'paginas/admin', error: 'Error al eliminar el evento. Verifique el ID.' });
    }
}
export function buscarEvento(req, res) {
    const nombreEvento = req.query.nombre;  
    // Validación simple
    if (!nombreEvento || nombreEvento.trim() === '') {
        return res.status(400).render('pagina', { contenido: 'paginas/error', mensaje: 'Nombre de evento no puede estar vacío.' });
    }

    try {
        const eventos = Evento.getAll();


        // Filtra los eventos que coinciden con el nombre proporcionado
        const eventosFiltrados = eventos.filter(evento =>
            evento.nombre.toLowerCase().includes(nombreEvento.toLowerCase())
        );

        // Renderiza la vista con los eventos filtrados
        res.render('pagina', { contenido: 'paginas/resultadosBusqueda', eventos: eventosFiltrados, session: req.session });
    } catch (error) {
        console.error('Error al buscar eventos:', error);
        res.status(500).send('Error al buscar eventos');
    }
}
