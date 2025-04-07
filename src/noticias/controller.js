import { param, validationResult } from 'express-validator';
import { Noticia } from './noticias.js';

export function viewNoticias(req, res) {
    const noticias = Noticia.getAll();
    res.render('pagina', { contenido: 'paginas/index', session: req.session, noticias });
}

export function viewNoticias(req, res) {
    param('id').isInt().withMessage('ID de la noticia inválido');
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).render('pagina', { contenido: 'paginas/error', mensaje: 'ID de la noticia inválido' });
    }

    try {
        const noticia = Noticia.getNoticiaById(req.params.id);
        res.render('pagina', { contenido: 'paginas/noticias', session: req.session, noticia });
    } catch (error) {
        res.status(404).render('pagina', { contenido: 'paginas/error', mensaje: 'Noticia no encontrada' });
    }
}


export function agregarNoticia(req, res) {
    try {
        const { titulo, descripcion } = req.body;
        const imagen = req.file ? req.file.filename : 'default.png';

        const nuevaNoticia = new Noticia(titulo, descripcion, imagen);
        nuevaNoticia.persist();

        res.render('pagina', { 
            contenido: 'paginas/index', 
            session: req.session,
            mensaje: 'Noticia modificada con éxito' });
    } catch (error) {
        res.status(400).send("Error al añadir la noticia.");
    }
}

export function modificarNoticia(req, res) {
    try {
        const { titulo, descripcion } = req.body;
        const imagen = req.file ? req.file.filename : null;
        let noticia = Noticia.getNoticiaById(id);
        if (!noticia) throw new NoticiaNoEncontrada(id);

        noticia.titulo = titulo || noticia.titulo;
        noticia.descripcion = descripcion || noticia.descripcion;
        noticia.imagen = imagen ? imagen : noticia.imagen

        noticia.persist(); 

        res.render('pagina', { 
            contenido: 'paginas/admin', 
            session: req.session,
            mensaje: 'Noticia modificada con éxito' });
    } catch (error) {
        res.render('pagina', { 
            contenido: 'paginas/admin', 
            session: req.session,
            error: 'Error al modificar la noticia' });
    }
}

export function eliminarNoticia(req, res) {
    try {

        const { id } = req.body;
        Noticia.getNoticiaById(id);
        
        Noticia.delete(id);

        res.render('pagina', { 
            contenido: 'paginas/admin',
            session: req.session, 
            mensaje: 'Noticia eliminada con éxito' });
    } catch (error) {
        res.render('pagina', { contenido: 'paginas/admin', error: 'Error al eliminar la noticia. Verifique el ID' });
    }
}

export function buscarNoticia(req, res) {
    const nombreNoticia = req.query.nombre;  
    if (!nombreNoticia || nombreNoticia.trim() === '') {
        return res.status(400).render('pagina', { contenido: 'paginas/error', mensaje: 'El nombre de la noticia no puede estar vacío.' });
    }

    try {
        const noticias = Noticia.getAll();


        const noticiasFiltradas = noticias.filter(noticia =>
            noticia.titulo.toLowerCase().includes(nombreNoticia.toLowerCase())
        );
 
        res.render('pagina', { contenido: 'paginas/resultadosBusqueda', noticias: noticiasFiltradas, session: req.session });
    } catch (error) {
        console.error('Error al buscar noticias:', error);
        res.status(500).send('Error al buscar noticias');
    }
}
