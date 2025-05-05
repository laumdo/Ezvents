import { Descuento } from './Descuento.js';
import { Usuario } from '../usuarios/Usuario.js';
import { DescuentosUsuario } from '../descuentosUsuario/DescuentosUsuario.js';

export function viewDescuentos(req, res) {
    const descuentos = Descuento.getAll();
    const usuario = Usuario.getUsuarioByUsername(req.session.username); // Obtener el usuario por su ID

    res.render('pagina', { 
        contenido: 'paginas/puntos', 
        session: req.session, 
        descuentos, 
        puntosUsuario: usuario.puntos 
    });
}

export function agregarDescuento(req,res){
    try {
        const { titulo, condiciones, puntos,interno,valor } = req.body;
        const imagen = req.file ? req.file.filename : 'descuento.png';

        const nuevoDescuento = new Descuento(null, titulo, condiciones, puntos, imagen,interno,valor);
        nuevoDescuento.persist();

        const usuario = Usuario.getUsuarioByUsername(req.session.username); 
        const descuentos = Descuento.getAll();

        res.render('pagina', {
            contenido: 'paginas/puntos',
            session: req.session,
            mensaje: 'Descuento agregado con éxito',
            puntosUsuario: usuario.puntos,
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
