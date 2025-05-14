import { validationResult, matchedData } from 'express-validator';
import { Artista } from "./Artista.js";
import { error } from '../utils/helpers.js';

export function viewArtistas(req, res) {
    const artistas = Artista.getAll();
    res.render('pagina', { contenido: 'paginas/artistas', session: req.session, artistas });
}

export function viewArtista(req, res){
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.setFlash('Id del evento inválido');
        return res.redirect('/');
    }

    try{
        const {id} = matchedData(req);
        const artista = Artista.getArtistaById(id);
        res.render('pagina', { contenido: 'paginas/artista', session: req.session, artista });
    }catch(e){
        return res.status(404).render("pagina", {
        contenido: "paginas/error",
        mensaje: "Artista no encontrado",
        });
    }

}

export function agregarArtista(req, res){
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        req.log.warn( { campos: errores.array().map((e) => e.param) }, "Intento de añadir artista con datos inválidos" );
        const datos = matchedData(req);
        return res.status(400).render("pagina", { contenido: "paginas/admin", session: req.session, errores: errores.mapped(), datos, helpers: { error }, });
    }

    try{
        const datosValidados = matchedData(req);
        const imagen = req.file ? req.file.filename : 'defaultUser.png'; // Si no hay imagen, usa la predeterminada

        const datos = {id: null, nombreArtistico: datosValidados.nombreArtistico, nombre: datosValidados.nombre, biografia: datosValidados.biografia, nacimiento: datosValidados.nacimiento, genero: datosValidados.genero, canciones: datosValidados.canciones, imagen: imagen};
        const artista = new Artista(datos);
        artista.persist();

        res.setFlash('Artista creado con exito');
        res.redirect('/artista/');
    }catch(e){
        return res.status(400).render("pagina", {
        contenido: "paginas/error",
        mensaje: "Datos inválidos",
        });

    }
}

export function modificarArtista(req, res){
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        req.log.warn( { campos: errores.array().map((e) => e.param) }, "Intento de modificar artista con datos inválidos" );
        const datos = matchedData(req);
        return res.status(400).render("pagina", { contenido: "paginas/admin", session: req.session, errores: errores.mapped(), datos, activeSection: "artistas", activeForm: "editArtista", helpers: { error }, });
    }

    try{
        const datosValidados = matchedData(req);
        const imagen = req.file ? req.file.filename : null;
        let artista = Artista.getArtistaById(datosValidados.id);
        if (!artista) throw new ArtistaNoEncontrado(datosValidados.id);

        artista.nombreArtistico = datosValidados.nombreArtistico || artista.nombreArtistico;
        artista.nombre = datosValidados.nombre || artista.nombre;
        artista.biografia = datosValidados.biografia || artista.biografia;
        artista.nacimiento = datosValidados.nacimiento || artista.nacimiento;
        artista.genero = datosValidados.genero || artista.genero;
        artista.canciones = datosValidados.canciones || artista.canciones;
        artista.imagen = imagen ? imagen : artista.imagen;

        artista.persist();

        res.setFlash('Artista modificado con exito');
        res.redirect('/artista/');
    }catch(e){
        return res.status(400).render("pagina", {
        contenido: "paginas/error",
        mensaje: "Datos inválidos",
        });
    }
}

export function eliminarArtista(req, res){
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.status(400).render("pagina", { contenido: "paginas/admin", session: req.session, errores: errores.mapped(), helpers: { error }, });
    }

    try{
        const { id } = matchedData(req);
        Artista.delete(id);
        res.setFlash('Artista eliminado con exito');
        res.redirect('/artista/');
    }catch(e){
        return res.status(404).render("pagina", {
        contenido: "paginas/error",
        mensaje: "Artista no encontrado",
        });
    }
}