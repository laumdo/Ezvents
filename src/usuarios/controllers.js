import { body, validationResult } from 'express-validator';
import { RolesEnum, Usuario } from './Usuario';
//import { Usuario, RolesEnum } from './Usuario.js';

export function viewLogin(req, res) {
    let contenido = 'paginas/login';
    if (req.session != null && req.session.login) {
        contenido = 'paginas/index'
    }
    res.render('pagina', {
        contenido,
        session: req.session
    });
}

export function doLogin(req, res) {
    body('username').escape(); // Se asegura que eliminar caracteres problemáticos
    body('password').escape(); // Se asegura que eliminar caracteres problemáticos

    // Capturo las variables username y password
    const username = req.body.username.trim();
    const password = req.body.password.trim();

    try {
        const usuario = Usuario.login(username, password);
        req.session.login = true;
        req.session.nombre = usuario.nombre;
        req.session.esAdmin = usuario.rol === RolesEnum.ADMIN;
        req.session.esEmpresa = usuario.rol ===RolesEnum.EMPRESA;

        return res.render('pagina', {
            contenido: 'paginas/index',
            session: req.session
        });

    } catch (e) {
        res.render('pagina', {
            contenido: 'paginas/login',
            error: 'El usuario o contraseña no son válidos'
        })
    }
}

export function doLogout(req, res, next) {
    // TODO: https://expressjs.com/en/resources/middleware/session.html
    // clear the user from the session object and save.
    // this will ensure that re-using the old session id
    // does not have a logged in user
    req.session.login = null
    req.session.nombre = null;
    req.session.esAdmin = null;
    req.session.esEmpresa=null;
    req.session.save((err) => {
        if (err) next(err);

        // regenerate the session, which is good practice to help
        // guard against forms of session fixation
        req.session.regenerate((err) => {
            if (err) next(err)
            res.redirect('/');
        })
    })
}

export function agregarUsuario(req, res){

    try{
        const{username, password,nombre,rol}=req.body;
        const nuevoUsuario= new Usuario(null,username,password,nombre,rol);
        usuario.persist();

        res.redirect('/usuarios');

    }catch(error){
        res.status(400).send("Error al agregar un usuario.");
    }
}

export function eliminarunUsuario(req, res){

    try{

        const{nombre}=req.body;

        // Verificar si el usuario existe
        Usuario.getUsuarioByUsername(nombre); // Lanza error si no existe

        Usuario.delete(nombre);

        res.render('pagina', { contenido: 'paginas/admin', mensaje: 'Usuario eliminado con éxito' });

    }catch(error){
        res.render('pagina', { contenido: 'paginas/admin', error: 'Error al eliminar el un usuario.' });
    }
}