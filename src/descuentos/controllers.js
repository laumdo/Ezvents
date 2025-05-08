import { Descuento } from './Descuento.js';
import { Usuario } from '../usuarios/Usuario.js';
import { DescuentosUsuario } from '../descuentosUsuario/DescuentosUsuario.js';
import { render } from '../utils/render.js';
import { matchedData, validationResult } from 'express-validator';

export function viewDescuentos(req, res) {
    const descuentos = Descuento.getAll();
    const usuario = Usuario.getUsuarioByUsername(req.session.username); // Obtener el usuario por su ID

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
        return render(req, res, 'paginas/puntos', {
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
        return render('pagina',{
            contenido: 'paginas/admin',
            session:req.session,
            mensaje:'Descuento modificado con exito',
            activeSection: 'descuentos',
            activeForm:    'editDescuento',
            //datos: {},
            //errores: {}
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
    /*try{
        const{ id,titulo, condiciones, puntos,interno,valor}=req.body;
        const imagen = req.file ? req.file.filename : null;
        let descuento = Descuento.getDescuento(id);
        if(!descuento) throw new DescuentoNoEncontrado(id);

        descuento.titulo=titulo || descuento.titulo;
        descuento.condiciones=condiciones || descuento.condiciones;
        descuento.puntos=puntos || descuento.puntos;
        descuento.imagen=imagen ? imagen : descuento.imagen;
        descuento.interno=interno || descuento.interno;
        descuento.valor=valor || descuento.valor;

        descuento.persist();
        res.render('pagina',{
            contenido: 'paginas/admin',
            session:req.session,
            mensaje:'Descuento modificado con exito'
        });
    }catch(error){
        res.render('pagina',{
            contenido:'paginas/admin',
            session:req.session,
            error:'Error al modificar descuento'
        });
    }*/
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
        return render('pagina',{
            contenido: 'paginas/admin',
            session:req.session,
            mensaje:'Descuento modificado con exito',
            activeSection: 'descuentos',
            activeForm:    'deleteDescuento',
            //datos: {},
            //errores: {}
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
   /* try{
        const{id}=req.body;
        Descuento.getDescuento(id);

        Descuento.delete(id);

        res.render('pagina',{
            contenido: 'paginas/admin',
            session:req.session,
            mensaje: 'Descuento eliminado con exito'
        });
    }catch(error){
        res.render('pagina',{ contenido:'paginas/admin', error: 'Error al eliminar el descuento. Verifique el ID.'});
    }*/
}

export function canjearDescuento(req, res) {
    const idDescuento = parseInt(req.params.id, 10);
    const usuario = Usuario.getUsuarioByUsername(req.session.username);

    if (!usuario) {
        return res.status(401).json({ error: "Usuario no autenticado" });
    }

    const descuento = Descuento.getDescuento(idDescuento);
    if (!descuento) {
        return res.status(404).json({ error: "Descuento no encontrado" });
    }

    // Verificar si el usuario tiene suficientes puntos
    if (usuario.puntos < descuento.puntos) {
        return res.status(400).json({ error: "Puntos insuficientes" });
    }

    // Verificar si el usuario ya canjeó este descuento
    const yaCanjeado = DescuentosUsuario.existe(usuario.id, idDescuento);
    if (yaCanjeado) {
        return res.status(400).json({ 
            success: false,
            message: "Este descuento ya ha sido canjeado." 
        });
    }
    

    // Restar puntos al usuario
    usuario.puntos -= descuento.puntos;
    usuario.persist(); // Guardar cambios en la BD

    // Registrar el canje en DescuentosUsuario
    DescuentosUsuario.insert(usuario.id,idDescuento);

    return res.json({ 
        success: true, 
        message: "¡Descuento canjeado con éxito!" 
    });
    
}
