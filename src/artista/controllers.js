import { Artista } from "./Artista.js";

export function viewArtistas(req, res){
    const artistas = Artista.getAll();
    res.render('pagina', { contenido: 'paginas/artistas', session: req.session, artistas });    
}

export function viewArtista(req, res){

}

export function agregarArtista(req, res){

}

export function modificarArtista(req, res){

}

export function eliminarArtista(req, res){
    try{
        const { id } = req.body;
        Artista.delete(id);
        res.setFlash('Artista eliminado con exito');
        res.redirect('/artistas');
    }catch(e){
        res.setFlash('Error al eliminar artista');
        res.redirect('/artistas');
    }
}

//Buscar artista??