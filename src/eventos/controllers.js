//import { param, validationResult } from 'express-validator';
import { validationResult, matchedData } from 'express-validator';
import { Evento } from './Evento.js';
import { Usuario } from '../usuarios/Usuario.js';
import { Artista } from '../artista/Artista.js';
import { EntradasUsuario } from '../entradasUsuario/EntradasUsuario.js';
import { Valoraciones } from '../valoraciones/Valoracion.js';
import { EventoArtista } from '../eventosArtistas/EventoArtista.js';

export function viewEventos(req, res) {
    let eventos = Evento.getAll();
    const ahora = new Date();
    
    eventos = eventos.filter(evento => {
        if (!evento.fecha || !evento.hora) return false;
        const [year, month, day] = evento.fecha.split('-').map(Number);
        const [hour, minute] = evento.hora.split(':').map(Number);
        const fechaEvento = new Date(year, month - 1, day, hour, minute);
        return fechaEvento >= ahora;
    });


    const ordenar = req.query.ordenar;
    if (ordenar) {
        const [campo, direccion] = ordenar.split('_');

        eventos.sort((a, b) => {
            let valA = a[campo];
            let valB = b[campo];

            if (campo === 'nombre') {
                valA = valA.toLowerCase();
                valB = valB.toLowerCase();
            } else if (campo === 'fecha') {
                valA = new Date(`${a.fecha}T${a.hora}`);
                valB = new Date(`${b.fecha}T${b.hora}`);
            } else {
                valA = parseFloat(valA);
                valB = parseFloat(valB);
            }

            return direccion === 'asc' ? valA > valB ? 1 : -1 : valA < valB ? 1 : -1;
        });
    }
    const fechaFiltro = req.query.fecha;
    const fechaInicio = req.query.fecha_inicio ? new Date(req.query.fecha_inicio) : null;
    const fechaFin = req.query.fecha_fin ? new Date(req.query.fecha_fin) : null;

    if (fechaFiltro === 'antes' && fechaInicio) {
        eventos = eventos.filter(evento => new Date(evento.fecha) <= fechaInicio);
    } else if (fechaFiltro === 'despues' && fechaInicio) {
        eventos = eventos.filter(evento => new Date(evento.fecha) >= fechaInicio);
    } else if (fechaFiltro === 'entre' && fechaInicio && fechaFin) {
        eventos = eventos.filter(evento => {
            const fechaEvento = new Date(evento.fecha);
            return fechaEvento >= fechaInicio && fechaEvento <= fechaFin;
        });
    }

    const precioMin = parseFloat(req.query.precioMin);
    const precioMax = parseFloat(req.query.precioMax);
    
    if (!isNaN(precioMin)) {
        eventos = eventos.filter(evento => evento.precio >= precioMin);
    }
    
    if (!isNaN(precioMax)) {
        eventos = eventos.filter(evento => evento.precio <= precioMax);
    }

    // Filtrar por artista
    const artistaFiltro = req.query.artista;
    if (artistaFiltro) {
        const eventosDelArtista = EventoArtista.getEventsByArtist(artistaFiltro);
        const idsEventosDelArtista = eventosDelArtista.map(e => e.id_evento);
        eventos = eventos.filter(evento => idsEventosDelArtista.includes(evento.id));
    }

    // Filtrar por empresa
    const empresaFiltro = req.query.empresa;
    if (empresaFiltro) {
        eventos = eventos.filter(evento => evento.empresa === empresaFiltro);//cambiar
    }

    const artistas = Artista.getAll();
    const empresas = Usuario.getEmpresas();

    res.render('pagina', {
        contenido: 'paginas/index',
        session: req.session,
        eventos,
        esInicio: true,
        artistas,
        empresas,
        filtros: {
            fechaTipo: req.query.fechaTipo,
            fecha: req.query.fecha,
            fechaInicio: req.query.fechaInicio,
            fechaFin: req.query.fechaFin,
            precioMin: req.query.precioMin,
            precioMax: req.query.precioMax,
            artista: req.query.artista,
            empresa: req.query.empresa
        },
        req // para que EJS tenga acceso a los parámetros
    });
}


function calcularEdad(fechaNacimiento) {
  const [y, m, d] = fechaNacimiento.split('-').map(Number);
  const dob = new Date(y, m - 1, d);
  const diff = Date.now() - dob.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
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
    
      // OJO: usa tu sesión para idEmpresa
      const idEmpresa = req.session.usuario_id;
      const evt = new Evento({
        id: null,
        idEmpresa,
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

       // Ordenar según query
       const ordenar = req.query.ordenar;
       if (ordenar) {
           const [campo, direccion] = ordenar.split('_');
   
           eventosConInfo.sort((a, b) => {
               let valA, valB;
   
               if (campo === 'nombre') {
                   valA = a.nombre.toLowerCase();
                   valB = b.nombre.toLowerCase();
               } else if (campo === 'fecha') {
                   valA = new Date(`${a.fecha}T${a.hora}`);
                   valB = new Date(`${b.fecha}T${b.hora}`);
               } else if (campo === 'precio') {
                   valA = parseFloat(a.precio);
                   valB = parseFloat(b.precio);
               } else if (campo === 'valoracion') {
                   valA = parseFloat(a.media);
                   valB = parseFloat(b.media);
               }
   
               return direccion === 'asc' ? valA - valB : valB - valA;
           });
       }

    res.render('pagina', {
        contenido: 'paginas/eventosPasados',
        session: req.session,
        eventos: eventosConInfo,
        query: req.query
    });
}




