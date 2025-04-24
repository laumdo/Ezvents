import { Usuario } from "./usuarios/Usuario.js";
import { Evento } from "./eventos/Evento.js";
import { Carrito} from "./carrito/Carrito.js"
import { EntradasUsuario } from "./entradasUsuario/EntradasUsuario.js";
import { Descuento } from "./descuentos/Descuento.js";
import {DescuentosUsuario} from "./descuentosUsuario/DescuentosUsuario.js"
import { Artista } from "./artista/Artista.js";

export function inicializaModelos(db) {
    Usuario.initStatements(db);
    Evento.initStatements(db);
    Carrito.initStatements(db);
    EntradasUsuario.initStatements(db);
    Descuento.initStatements(db);
    DescuentosUsuario.initStatements(db);
    Artista.initStatements(db);
}