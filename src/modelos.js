import { Usuario } from "./usuarios/Usuario.js";
import { Evento } from "./eventos/Evento.js";
import { Carrito} from "./carrito/Carrito.js"

export function inicializaModelos(db) {
    Usuario.initStatements(db);
    Evento.initStatements(db);
    Carrito.initStatements(db);
}