import { validationResult, matchedData } from 'express-validator';
import { Artista } from "./Artista.js";

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
        res.setFlash('Artista no encontrado');
        res.redirect('/artista/');
    }

}

export function agregarArtista(req, res){
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        const mensajes = errores.array().map(e => e.msg).join(', ');
        res.setFlash(`Error al agregar artista: ${mensajes}`);
        return res.redirect('/');
    }

    try{
        const datosValidados = matchedData(req);
        const imagen = req.file ? req.file.filename : 'defaultUser.png'; // Si no hay imagen, usa la predeterminada

        const datos = {id: null, ...datosValidados, imagen: imagen};
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
        const mensajes = errores.array().map(e => e.msg).join(', ');
        res.setFlash(`Error al modificar artista: ${mensajes}`);
        return res.redirect('/');
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
        console.error('Error en modificarArtista:', e);
        res.setFlash('Error al modificar el artista');
        res.redirect('/artista/');
    }
}

export function eliminarArtista(req, res){
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        res.setFlash('Error al eliminar artista');
        return res.redirect('/');
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