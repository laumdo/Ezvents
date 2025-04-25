import { param, validationResult } from 'express-validator';
import { Artista } from "./Artista.js";

export function viewArtistas(req, res){
    const artistas = Artista.getAll();
    res.render('pagina', { contenido: 'paginas/artistas', session: req.session, artistas });    
}

export function viewArtista(req, res){
    param('id').isInt().withMessage('ID de artista inválido');
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).render('pagina', { contenido: 'paginas/error', mensaje: 'ID de evento inválido' });
    }

    try{
        const artista = Artista.getArtistaById(req.params.id);
        res.render('pagina', { contenido: 'paginas/artista', session: req.session, artista });
    }catch(e){
        res.status(404).render('pagina', { contenido: 'paginas/error', mensaje: 'Artista no encontrado' });
    }

}

export function agregarArtista(req, res){//falta poner la imagen
    try{
        const { nombreArtistico, nombre, biografia, nacimiento, genero, canciones } = req.body;
        const artista = new Artista(null, nombreArtistico, nombre, biografia, nacimiento, genero, canciones);
        artista.persist();

        res.setFlash('Artista creado con exito');
        res.redirect('/artista/');
    }catch(e){
        res.setFlash('Error al crear el artista');
        res.redirect('/artista/');

    }
}

export function modificarArtista(req, res){
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

//Buscar artista??