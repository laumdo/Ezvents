import { Usuario } from "./usuarios/Usuario.js";
import { Evento } from "./eventos/Evento.js";

export function inicializaModelos(db) {
    Usuario.initStatements(db);
    Evento.initStatements(db);
}