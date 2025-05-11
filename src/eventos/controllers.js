import { param, validationResult } from 'express-validator';
import { Evento } from './Evento.js';
import { EntradasUsuario } from '../entradasUsuario/EntradasUsuario.js';
import { Valoraciones } from '../valoraciones/Valoracion.js';

export function viewEventos(req, res) {
    let eventos = Evento.getAll();
    const ahora = new Date();

    eventos = eventos.filter(evento => {
        if (!evento.fecha || !evento.hora) {
            console.warn(`Evento con ID ${evento.id} tiene fecha u hora nula.`);
            return false;
        }
    
        const [year, month, day] = evento.fecha.split('-').map(Number);
        const [hour, minute] = evento.hora.split(':').map(Number);
        const fechaEvento = new Date(year, month - 1, day, hour, minute);
        return fechaEvento >= ahora;
    });
    

    res.render('pagina', { contenido: 'paginas/index', session: req.session, eventos, esInicio: true });
}


export function viewEvento(req, res) {
    param('id').isInt().withMessage('ID de evento inválido');
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
        const { nombre, descripcion, fecha, lugar, precio, aforo_maximo, hora } = req.body;
        const imagen = req.file ? req.file.filename : 'default.png'; // Si no hay imagen, usa la predeterminada

        const nuevoEvento = new Evento(null, nombre, descripcion, fecha, lugar, precio, aforo_maximo, 0, imagen, hora);
        nuevoEvento.persist();

        res.redirect('/eventos'); // Redirigir a la lista de eventos
    } catch (error) {
        res.status(400).send("Error al agregar el evento.");
    }
}

export function modificarEvento(req, res) {
    try {
        const { id, nombre, descripcion, fecha, lugar, precio, aforo_maximo, hora } = req.body;
        const imagen = req.file ? req.file.filename : null;
        let evento = Evento.getEventoById(id);
        if (!evento) throw new EventoNoEncontrado(id);

        evento.nombre = nombre || evento.nombre;
        evento.descripcion = descripcion || evento.descripcion;
        evento.fecha = fecha || evento.fecha;
        evento.lugar = lugar || evento.lugar;
        evento.precio = precio || evento.precio;
        evento.aforo_maximo = aforo_maximo || evento.aforo_maximo;
        evento.imagen = imagen ? imagen : evento.imagen;
        evento.hora = hora || evento.hora;


        evento.persist();

        res.render('pagina', {
            contenido: 'paginas/admin',
            session: req.session,
            mensaje: 'Evento modificado con éxito'
        });
    } catch (error) {
        res.render('pagina', {
            contenido: 'paginas/admin',
            session: req.session,
            error: 'Error al modificar el evento'
        });
    }
}

export function eliminarEvento(req, res) {
    try {

        const { id } = req.body;
        Evento.getEventoById(id);

        Evento.delete(id);

        res.render('pagina', {
            contenido: 'paginas/admin',
            session: req.session,
            mensaje: 'Evento eliminado con éxito'
        });
    } catch (error) {
        res.render('pagina', { contenido: 'paginas/admin', error: 'Error al eliminar el evento. Verifique el ID.' });
    }
}

export function buscarEvento(req, res) {
    const nombreEvento = req.query.nombre;
    if (!nombreEvento || nombreEvento.trim() === '') {
        return res.status(400).render('pagina', { contenido: 'paginas/error', mensaje: 'Nombre de evento no puede estar vacío.' });
    }

    try {
        const eventos = Evento.getAll();


        const eventosFiltrados = eventos.filter(evento =>
            evento.nombre.toLowerCase().includes(nombreEvento.toLowerCase())
        );

        res.render('pagina', { contenido: 'paginas/resultadosBusqueda', eventos: eventosFiltrados, session: req.session });
    } catch (error) {
        console.error('Error al buscar eventos:', error);
        res.status(500).send('Error al buscar eventos');
    }
}


export function apiEventos(req, res) {
    try {
        const eventos = Evento.getAll();
        const usuario_id = req.session && req.session.usuario_id;
        let eventosConEntrada = [];
        if (usuario_id) {
            const entradas = EntradasUsuario.getEntradasByUsuario(usuario_id);
            eventosConEntrada = entradas.map(e => e.idEvento);
        }
        const eventosFormateados = eventos.map(e => {
            const entradasDisponibles = e.aforo_maximo - e.entradas_vendidas;
            return {
                id: e.id,
                title: e.nombre,
                start: `${e.fecha}T${e.hora}`,
                allDay: false,
                imagen: e.imagen,
                aforo: e.aforo_maximo,
                entradasDisponibles,
                tieneEntrada: eventosConEntrada.includes(e.id)
            };
        });
        res.json(eventosFormateados);
    } catch (err) {
        console.error('Error al obtener eventos:', err);
        res.status(500).json({ error: 'Error al obtener eventos' });
    }
}



export function viewCalendario(req, res) {
    const eventos = Evento.getAll();
    res.render('pagina', {
        contenido: 'paginas/calendario',
        session: req.session,
        eventos
    });
}

export function viewEventosPasados(req, res) {
    let eventos = Evento.getAll();
    const ahora = new Date();
    const idUsuario = req.session && req.session.usuario_id;

    eventos = eventos.filter(evento => {
        if (!evento.fecha || !evento.hora) return false;

        const [year, month, day] = evento.fecha.split('-').map(Number);
        const [hour, minute] = evento.hora.split(':').map(Number);
        const fechaEvento = new Date(year, month - 1, day, hour, minute);

        return fechaEvento < ahora;
    });

    let idsEventosAsistidos = [];
    if (idUsuario) {
        const entradas = EntradasUsuario.getEntradasByUsuario(idUsuario);
        idsEventosAsistidos = entradas.map(e => e.idEvento);
    }

    const valoraciones = Valoraciones.getAll();

    const eventosConInfo = eventos.map(evento => {
        const valoracionesEvento = valoraciones.filter(v => v.id_evento === evento.id);

        let media = 0;
        const totalValoraciones = valoracionesEvento.length;
        if(totalValoraciones > 0){
            let suma = 0;
            for (let v of valoracionesEvento) {
                suma += v.puntuacion;
            }
            media = (suma / valoracionesEvento.length).toFixed(1);
        }
        

        const haValorado = idUsuario ? valoracionesEvento.some(v => v.id_usuario === idUsuario) : false;

        const haAsistido = idsEventosAsistidos.includes(evento.id);

        return {
            ...evento,
            media,
            haValorado,
            haAsistido,
            totalValoraciones
        };
    });

    res.render('pagina', {
        contenido: 'paginas/eventosPasados',
        session: req.session,
        eventos: eventosConInfo
    });
}




