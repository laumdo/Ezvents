import { Descuento } from './Descuento.js';
import { Usuario } from '../usuarios/Usuario.js';
import { DescuentosUsuario } from '../descuentosUsuario/DescuentosUsuario.js';

export function viewDescuentos(req, res) {
    const descuentos = Descuento.getAll();
    const usuario = Usuario.getUsuarioByUsername(req.session.username); // Obtener el usuario por su ID
    const puntosUsuario  = Usuario.getAvailablePoints(usuario.id);

    res.render('pagina', { 
        contenido: 'paginas/puntos', 
        session: req.session, 
        descuentos, 
        puntosUsuario: puntosUsuario
    });
}

export function agregarDescuento(req,res){
    try {
        const { titulo, condiciones, puntos,interno,valor } = req.body;
        const imagen = req.file ? req.file.filename : 'descuento.png';

        const nuevoDescuento = new Descuento(null, titulo, condiciones, puntos, imagen,interno,valor);
        nuevoDescuento.persist();

        const usuario = Usuario.getUsuarioByUsername(req.session.username); 
        const puntosUsuario = Usuario.getAvailablePoints(usuario.id);
        const descuentos = Descuento.getAll();

        res.render('pagina', {
            contenido: 'paginas/puntos',
            session: req.session,
            mensaje: 'Descuento agregado con éxito',
            puntosUsuario,
            descuentos
        });
    } catch (error) {
        res.status(400).send("Error al agregar descuento");
    }
}


export function modificarDescuento(req,res){
    try{
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
    }
}

export function eliminarDescuento(req,res){

    try{
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
    }
}

export function canjearDescuento(req, res) {
    const idDescuento = parseInt(req.params.id, 10);
    const usuario     = Usuario.getUsuarioByUsername(req.session.username);
  
    const puntosDisponibles = Usuario.getAvailablePoints(usuario.id);
    const descuento         = Descuento.getDescuento(idDescuento);
  
    if (puntosDisponibles < descuento.puntos) {
      return res.status(400).json({ error: "Puntos insuficientes" });
    }
    if (DescuentosUsuario.existe(usuario.id, idDescuento)) {
      return res.status(400).json({ success: false, message: "Ya canjeado." });
    }
  
    // restar puntos en la tabla PuntosUsuario
    Usuario.addPoints(usuario.id, -descuento.puntos);
    // registrar canje
    DescuentosUsuario.insert(usuario.id, idDescuento);
  
    return res.json({ success: true, message: "¡Canjeado con éxito!" });
  }
  
