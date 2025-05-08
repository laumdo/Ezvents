import { param, validationResult } from 'express-validator';
import { Artista } from "./Artista.js";

export function viewArtistas(req, res) {
    const artistas = Artista.getAll();
    res.render('pagina', { contenido: 'paginas/artistas', session: req.session, artistas });
}

export function viewArtista(req, res){
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.setFlash('Id del evento inválido');
        res.redirect('/');
    }

    try{
        const artista = Artista.getArtistaById(req.params.id);
        res.render('pagina', { contenido: 'paginas/artista', session: req.session, artista });
    }catch(e){
        res.setFlash('Artista no encontrado');
        res.redirect('/artista/');
    }

}

export function agregarArtista(req, res){
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        res.setFlash('Error al agregar artista');
        res.redirect('/');
    }

    try{
        const { nombreArtistico, nombre, biografia, nacimiento, genero, canciones } = req.body;
        const imagen = req.file ? req.file.filename : 'defaultUser.png'; // Si no hay imagen, usa la predeterminada

        const datos = {id: null, nombreArtistico: nombreArtistico, nombre: nombre, biografia: biografia, nacimiento: nacimiento, genero: genero, canciones: canciones, imagen: imagen};
        const artista = new Artista(datos);
        artista.persist();

        res.setFlash('Artista creado con exito');
        res.redirect('/artista/');
    }catch(e){
        res.setFlash('Error al crear el artista');
        res.redirect('/artista/');

    }
}

export function modificarArtista(req, res){
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        res.setFlash('Error al modificar artista');
        res.redirect('/');
    }

    try{
        const { id, nombreArtistico, nombre, biografia, nacimiento, genero, canciones } = req.body;
        const imagen = req.file ? req.file.filename : null;
        let artista = Artista.getArtistaById(id);
        if (!artista) throw new ArtistaNoEncontrado(id);

        artista.nombreArtistico = nombreArtistico || artista.nombreArtistico;
        artista.nombre = nombre || artista.nombre;
        artista.biografia = biografia || artista.biografia;
        artista.nacimiento = nacimiento || artista.nacimiento;
        artista.genero = genero || artista.genero;
        artista.canciones = canciones || artista.canciones;
        artista.imagen = imagen ? imagen : artista.imagen;

        artista.persist();

        res.setFlash('Artista modificado con exito');
        res.redirect('/artista/');
    }catch(e){
        console.error('Error en modificarArtista:', e);
        res.setFlash('Error al modificar el artista');
        res.redirect('/artista/');
    }
}

export function eliminarArtista(req, res){
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        res.setFlash('Error al eliminar artista');
        res.redirect('/');
    }

    try{
        const { id } = req.body;
        Artista.delete(id);
        res.setFlash('Artista eliminado con exito');
        res.redirect('/artista/');
    }catch(e){
        res.setFlash('Error al eliminar artista');
        res.redirect('/artista/');
    }
}