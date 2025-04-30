import { param, validationResult } from 'express-validator';
import { Evento } from './Evento.js';
import { Usuario } from '../usuarios/Usuario.js';

function calcularEdad(fechaNacimiento) {
  const [y, m, d] = fechaNacimiento.split('-').map(Number);
  const dob = new Date(y, m - 1, d);
  const diff = Date.now() - dob.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

export function viewEventos(req, res) {
    const eventos = Evento.getAll();
    res.render('pagina', { contenido: 'paginas/index', session: req.session, eventos });
}

export function viewEvento(req, res) {
    param('id').isInt().withMessage('ID de evento inválido');
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).render('pagina', { contenido: 'paginas/error', mensaje: 'ID de evento inválido' });
    }

    try {
        const evento = Evento.getEventoById(req.params.id);
        let userAge = null;
    if (req.session.username) {
      const u = Usuario.getUsuarioByUsername(req.session.username);
      if (u.fecha_nacimiento) {
        userAge = calcularEdad(u.fecha_nacimiento);
      }
    }
        res.render('pagina', { contenido: 'paginas/evento', session: req.session, evento,userAge });
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

export function modificarEvento(req, res) {
    try {
        const { id, nombre, descripcion, fecha, lugar, precio, aforo_maximo } = req.body;
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


        evento.persist(); 

        res.render('pagina', { 
            contenido: 'paginas/admin', 
            session: req.session,
            mensaje: 'Evento modificado con éxito' });
    } catch (error) {
        res.render('pagina', { 
            contenido: 'paginas/admin', 
            session: req.session,
            error: 'Error al modificar el evento' });
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
            mensaje: 'Evento eliminado con éxito' });
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
