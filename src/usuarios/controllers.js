import { body, validationResult } from 'express-validator';
//import { RolesEnum, Usuario } from './Usuario';
import { Usuario, RolesEnum } from './Usuario.js';
import bcrypt from "bcryptjs";
import session from 'express-session';


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
        req.session.username = usuario.username;
        req.session.esUsuario= usuario.rol===RolesEnum.USUARIO;
        req.session.esAdmin = usuario.rol === RolesEnum.ADMIN;
        req.session.esEmpresa = usuario.rol ===RolesEnum.EMPRESA;

        if(req.session.esEmpresa){
            return res.render('pagina', {
                contenido: 'paginas/empresa', 
                session: req.session
            });
        }
        else if(req.session.esAdmin){
            return res.render('pagina',{ 
                contenido: 'paginas/admin',
                session: req.session
            });
        }
        else{
            return res.redirect('/');
        }

    } catch (e) {
        res.render('pagina', {
            contenido: 'paginas/login',
            session: req.session,
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
    req.session.esUsuario=null;
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

export function eliminarUsuario(req, res){

    try{

        const{nombre}=req.body;

        // Verificar si el usuario existe
        Usuario.getUsuarioByUsername(nombre); // Lanza error si no existe

        Usuario.delete(nombre);

        res.render('pagina', { contenido: 'paginas/admin', 
            session: req.session,
            mensaje: 'Usuario eliminado con éxito' });

    }catch(error){
        res.render('pagina', { contenido: 'paginas/admin', 
            session: req.session,
            error: 'Error al eliminar el un usuario.' });
    }
}

export function viewRegister(req, res){
    res.render('pagina', {contenido: 'paginas/register', session: req.session, error: null});
}

export function viewDatos(req, res) {
    if (!req.session || !req.session.username) {
        return res.redirect('/usuarios/login'); // Redirigir si no está logueado
    }

    let usuario = null;
    try {
        console.log(req.session.username);
        usuario = Usuario.getUsuarioByUsername(req.session.username);
    } catch (e) {
        console.error("Error obteniendo usuario:", e);
        usuario = null; // Asegurar que no crashee la vista
    }

    res.render('pagina', { contenido: 'paginas/datos', session: req.session, usuario });
}


export function doRegister(req, res){
    body('username').escape();
    body('password').escape();
    body('nombre').escape();
    body('apellidos').escape();
    body('email').escape();
    body('rol').escape();

    const username = req.body.username.trim();
    const password = req.body. password.trim();
    const nombre = req.body.nombre.trim();
    const apellidos = req.body.apellidos.trim();
    const email = req.body.email.trim();
    const rolSeleccionado = req.body.rol.trim().toUpperCase();

    //Ver si usuario existe
    try{
        Usuario.getUsuarioByUsername(username);
        return res.render('pagina', {
            contenido: 'paginas/register', 
            session: req.session,
            error: 'El usuario ya existe'});
    }catch(e){
        //ver

    let rol;
    if (rolSeleccionado === "USUARIO") {
        rol = RolesEnum.USUARIO;
    } else if (rolSeleccionado === "EMPRESA") {
        rol = RolesEnum.EMPRESA;
    } else if (rolSeleccionado === "ADMINISTRADOR") {
        rol = RolesEnum.ADMIN;
    }

    const hashedPassword = bcrypt.hashSync(password, 10);//10?
    const nuevoUsuario = new Usuario(username, hashedPassword, nombre, apellidos, email, rol);
    nuevoUsuario.persist();

    req.session.login = true;
    req.session.nombre = nuevoUsuario.nombre;
    req.session.esUsuario=nuevoUsuario.rol===RolesEnum.USUARIO;
    req.session.esAdmin = nuevoUsuario.rol === RolesEnum.ADMIN;
    req.session.esEmpresa=nuevoUsuario.rol === RolesEnum.EMPRESA;

    return res.redirect('/');
    }
}