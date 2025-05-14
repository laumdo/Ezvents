import { Descuento } from './Descuento.js';
import { Usuario } from '../usuarios/Usuario.js';
import { DescuentosUsuario } from '../descuentosUsuario/DescuentosUsuario.js';
import { render } from '../utils/render.js';
import { matchedData, validationResult } from 'express-validator';

export function viewDescuentos(req, res) {
    const descuentos = Descuento.getAll();
    const usuario = Usuario.getUsuarioByUsername(req.session.username);

    res.render('pagina', { 
        contenido: 'paginas/puntos', 
        session: req.session, 
        descuentos, 
        puntosUsuario: usuario.puntos,
        datos: {},      
        errores: {}    
    });
}

export function agregarDescuento(req,res){
    const result = validationResult(req);
    if (!result.isEmpty()) {
        const errores = result.mapped();
        const datos = matchedData(req);
        const usuario = Usuario.getUsuarioByUsername(req.session.username);
        const descuentos = Descuento.getAll();
        return render(req, res, 'paginas/admin', {
            session: req.session,
            errores,
            datos,
            descuentos,
            puntosUsuario: usuario.puntos,
            // flags para mantener la sección y formulario abiertos
            activeSection: 'descuentos',
            activeForm:    'addDescuento'
            });
    }

    try {
        const { titulo, condiciones, puntos, interno, valor } = matchedData(req);
        const imagen = req.file?.filename ?? 'descuento.png';

        const nuevo = new Descuento(
            null,
            titulo,
            condiciones,
            parseInt(puntos, 10),
            imagen,
            interno === 'on',           // checkbox marca interno
            valor != null ? parseFloat(valor) : null
        );
        nuevo.persist();

        req.log.info("Descuento '%s' creado por %s", titulo, req.session.username);
        const usuario = Usuario.getUsuarioByUsername(req.session.username);
        const descuentos = Descuento.getAll();
        return render(req, res, 'paginas/admin', {
            session: req.session,
            mensaje: 'Descuento agregado con éxito',
            descuentos,
            puntosUsuario: usuario.puntos,
            // flags para mantener la sección y formulario abiertos
            activeSection: 'descuentos',
            activeForm:    'addDescuento',
            datos: {},
            errores: {}
        });

    } catch (e) {
        const datos = matchedData(req);
        req.log.warn("Error al crear descuento '%s': %s", datos.titulo, e.message);
        req.log.debug(e);
        const usuario = Usuario.getUsuarioByUsername(req.session.username);
        const descuentos = Descuento.getAll();
        return render(req, res, 'paginas/admin', {
            session: req.session,
            error: 'No se pudo crear el descuento: ' + e.message,
            datos,
            errores: {},
            descuentos,
            puntosUsuario: usuario.puntos,
            // flags para mantener la sección y formulario abiertos
            activeSection: 'descuentos',
            activeForm:    'addDescuento'
        });
    }
}


export function modificarDescuento(req,res){
    
    const result = validationResult(req);
    if (!result.isEmpty()) {
        const errores = result.mapped();
        const datos = matchedData(req);
        const usuario = Usuario.getUsuarioByUsername(req.session.username);
        const descuentos = Descuento.getAll();
        return render(req, res, 'paginas/admin', {
            session: req.session,
            errores,
            datos,
            descuentos,
            puntosUsuario: usuario.puntos,
            activeSection: 'descuentos',
            activeForm:    'editDescuento'
        });
    }

    try {
        const datos = matchedData(req);
        const { id, titulo, condiciones, puntos } = datos;
        const imagen = req.file?.filename ?? null;

        const descuento = Descuento.getDescuento(id);

        if (titulo !== undefined)      descuento.titulo      = titulo;
        if (condiciones !== undefined) descuento.condiciones = condiciones;
        if (puntos !== undefined)      descuento.puntos      = puntos;
        if (imagen)                    descuento.imagen      = imagen;

        descuento.persist();

        req.log.info("Descuento %d modificado por %s", id, req.session.username);
        return render(req, res,'pagina',{
            contenido: 'paginas/admin',
            session:req.session,
            mensaje:'Descuento modificado con exito',
            activeSection: 'descuentos',
            activeForm:    'editDescuento',
        });
    } catch (e) {
        const datos = matchedData(req);
        req.log.warn("Error al modificar descuento %s: %s", datos.id, e.message);
        req.log.debug(e);
        const usuario = Usuario.getUsuarioByUsername(req.session.username);
        const descuentos = Descuento.getAll();
        return render(req, res, 'paginas/admin', {
            session: req.session,
            error: 'No se pudo modificar el descuento: ' + e.message,
            datos,
            errores: {},
            descuentos,
            puntosUsuario: usuario.puntos,
            activeSection: 'descuentos',
            activeForm:    'editDescuento'
        });
    }
}

export function eliminarDescuento(req,res){
    const result = validationResult(req);
    if (!result.isEmpty()) {
        const errores = result.mapped();
        const datos   = matchedData(req);
        const usuario    = Usuario.getUsuarioByUsername(req.session.username);
        const descuentos = Descuento.getAll();
        return render(req, res, 'paginas/admin', {
            session: req.session,
            errores,
            datos,
            descuentos,
            puntosUsuario: usuario.puntos,
            activeSection: 'descuentos',
            activeForm:    'deleteDescuento',
        });
    }

    try {
        const { id } = matchedData(req);

        Descuento.getDescuento(id);

        Descuento.delete(id);

        req.log.info("Descuento %d eliminado por %s", id, req.session.username);
        return render(req, res,'pagina',{
            contenido: 'paginas/admin',
            session:req.session,
            mensaje:'Descuento modificado con exito',
            activeSection: 'descuentos',
            activeForm:    'deleteDescuento',
        });
    } catch (e) {
        req.log.warn("Error al eliminar descuento %s: %s", req.body.id, e.message);
        req.log.debug(e);
        const datos   = matchedData(req);
        const usuario = Usuario.getUsuarioByUsername(req.session.username);
        const descuentos = Descuento.getAll();
        return render(req, res, 'paginas/admin', {
            session: req.session,
            error: 'No se pudo eliminar el descuento: ' + e.message,
            datos,
            errores: {},
            descuentos,
            puntosUsuario: usuario.puntos,
            activeSection: 'descuentos',
            activeForm:    'deleteDescuento',
        });
    }
}

export async function canjearDescuento(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { id: idDescuento } = matchedData(req, { locations: ['params'] });

        const usuario = Usuario.getUsuarioByUsername(req.session.username);
        if (!usuario) {
        const err = new Error('Usuario no autenticado');
        err.statusCode = 401;
        throw err;
        }

        let descuento;
        try {
            descuento = Descuento.getDescuento(idDescuento);
        } catch (e) {
            const err = new Error(`Descuento ${idDescuento} no encontrado`);
            err.statusCode = 404;
            throw err;
        }

        if (usuario.puntos < descuento.puntos) {
            const err = new Error('Puntos insuficientes');
            err.statusCode = 400;
            throw err;
        }

        if (DescuentosUsuario.existe(usuario.id, idDescuento)) {
            const err = new Error('Este descuento ya ha sido canjeado');
            err.statusCode = 400;
            throw err;
        }

        usuario.puntos -= descuento.puntos;
        usuario.persist();

        DescuentosUsuario.insert(usuario.id, idDescuento);

        return res.json({
            success: true,
            message: '¡Descuento canjeado con éxito!'
        });

    } catch (err) {

        return next(err);
    }
}