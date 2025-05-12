//import { param, validationResult } from 'express-validator';
import { validationResult, matchedData } from 'express-validator';
import { Evento } from './Evento.js';
import { Usuario } from '../usuarios/Usuario.js';
import { Artista } from '../artista/Artista.js';
import { EntradasUsuario } from '../entradasUsuario/EntradasUsuario.js';
import { EventoArtista } from '../eventosArtistas/EventoArtista.js';
//import { Evento, EventoNoEncontrado } from './Evento.js';

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
  
  export function viewEvento(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render('pagina', { contenido: 'paginas/error', mensaje: 'ID de evento inválido' });
    }
    const { id } = matchedData(req);
    try {
      const evento = Evento.getEventoById(id);
      let userAge = null;
    if (req.session.username) {
      const u = Usuario.getUsuarioByUsername(req.session.username);
      if (u.fecha_nacimiento) userAge = calcularEdad(u.fecha_nacimiento);
    }
      res.render('pagina', { contenido: 'paginas/evento', session: req.session, evento,userAge });
    } catch (err) {
      if (err instanceof EventoNoEncontrado) {
        return res.status(404).render('pagina', { contenido: 'paginas/error', mensaje: err.message });
      }
      next(err);
    }
  }
  
    export async function agregarEvento(req, res, next) {
      // permisos…
      if (!req.session.esEmpresa && !req.session.esAdmin) return res.status(403).render('pagina', { contenido: 'paginas/error', mensaje: 'Sin permiso' });
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        req.log.warn(
          { campos: errors.array().map(e => e.param) },
          'Intento de añadir evento con datos inválidos'
        );
        const datos = matchedData(req);
        return res.status(400).render('pagina', {
          contenido: 'paginas/admin',
          session: req.session,
          errores: errors.mapped(),
          datos
        });
      }
    
      const {
        nombre,
        descripcion,
        fecha,
        lugar,
        precio,
        aforo_maximo,
        edad_minima
      } = matchedData(req);
    
      //const idEmpresa = req.session.usuario_id;
      const evt = new Evento({
        id: null,
        nombre,
        descripcion,
        fecha,
        lugar,
        precio,
        aforo_maximo,
        entradas_vendidas: 0,
        imagen: req.file?.filename ?? 'default.png',
        edad_minima: parseInt(edad_minima ?? 0, 10)
      });
    
      try {
        await evt.persist();
        // ahora evt.id existe
        const artistas = Artista.getAll();
        const contratados = artistas.filter(a =>
          EventoArtista.contratado(a.id, evt.id)
        );
        const noContratados = artistas.filter(a =>
          !EventoArtista.contratado(a.id, evt.id)
        );
    
        return res.render('pagina', {
          contenido: 'paginas/contratar',
          session: req.session,
          idEvento: evt.id,
          fecha: evt.fecha,
          artistas: noContratados,
          artistasContratados: contratados
        });
      } catch (err) {
        next(err);
      }
    }
    
    export async function modificarEvento(req, res, next) {
      // permisos…
      const errors = validationResult(req);
      if (!errors.isEmpty()) {

        req.log.warn(
          { campos: errors.array().map(e => e.param) },
          'Intento de modificar evento con datos inválidos'
        );
        const datos = matchedData(req);
        return res.status(400).render('pagina', {
          contenido: 'paginas/admin',
          session: req.session,
          errores: errors.mapped(),
          datos
        });
      }
    
      const {
        id,
        nombre,
        descripcion,
        fecha,
        lugar,
        precio,
        aforo_maximo,
        edad_minima
      } = matchedData(req);
    
      try {
        const evt = Evento.getEventoById(id);
        evt.nombre          = nombre          ?? evt.nombre;
        evt.descripcion     = descripcion     ?? evt.descripcion;
        evt.fecha           = fecha           ?? evt.fecha;
        evt.lugar           = lugar           ?? evt.lugar;
        evt.precio          = precio          ?? evt.precio;
        evt.aforo_maximo    = aforo_maximo    ?? evt.aforo_maximo;
        evt.edad_minima     = (edad_minima !== undefined)
                                ? parseInt(edad_minima, 10)
                                : evt.edad_minima;
        if (req.file) evt.imagen = req.file.filename;
    
        await evt.persist();
    
        const artistas = Artista.getAll();
        const contratados = artistas.filter(a =>
          EventoArtista.contratado(a.id, evt.id)
        );
        const noContratados = artistas.filter(a =>
          !EventoArtista.contratado(a.id, evt.id)
        );
    
        return res.render('pagina', {
          contenido: 'paginas/contratar',
          session: req.session,
          idEvento: evt.id,
          fecha: evt.fecha,
          artistas: noContratados,
          artistasContratados: contratados
        });
      } catch (err) {
        if (err instanceof EventoNoEncontrado) {
          return res.status(404).render('pagina', {
            contenido: 'paginas/admin',
            session: req.session,
            mensaje: err.message
          });
        }
        next(err);
      }
    }
    
    export async function eliminarEvento(req, res, next) {
      // permisos…
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).render('pagina', {
          contenido: 'paginas/admin',
          session: req.session,
          errores: errors.mapped()
        });
      }
      const { id } = matchedData(req, { locations: ['body'] });
      try {
        Evento.delete(id);
        return res.redirect('/eventos');
      } catch (err) {
        if (err instanceof EventoNoEncontrado) {
          return res.status(404).render('pagina', {
            contenido: 'paginas/admin',
            session: req.session,
            mensaje: err.message
          });
        }
        next(err);
      }
    }
  
  export function buscarEvento(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render('pagina', { contenido: 'paginas/error', mensaje: 'Parámetros inválidos' });
    }
    const { nombre } = matchedData(req);
    try {
      const eventos = Evento.searchByName(nombre);
      res.render('pagina', { contenido: 'paginas/resultadosBusqueda', session: req.session, eventos });
    } catch (err) {
      next(err);
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
                start: e.fecha,
                allDay: true,
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



