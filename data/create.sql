BEGIN TRANSACTION;
DROP TABLE IF EXISTS "Descuento";
CREATE TABLE Descuento (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo      TEXT    NOT NULL,
    condiciones TEXT,
    puntos      INTEGER NOT NULL,
    imagen      TEXT    DEFAULT 'descuento.png'
);
DROP TABLE IF EXISTS "DescuentosUsuario";
CREATE TABLE DescuentosUsuario (
    idUsuario   INTEGER NOT NULL,
    idDescuento INTEGER NOT NULL,
    codigo      TEXT    NOT NULL
                        UNIQUE,
    PRIMARY KEY (
        idUsuario,
        idDescuento
    ),
    FOREIGN KEY (
        idUsuario
    )
    REFERENCES Usuarios (id) ON DELETE CASCADE,
    FOREIGN KEY (
        idDescuento
    )
    REFERENCES Descuento (id) ON DELETE CASCADE
);
DROP TABLE IF EXISTS "Usuarios";
CREATE TABLE Usuarios (id INTEGER NOT NULL, username TEXT NOT NULL UNIQUE, password TEXT NOT NULL, rol TEXT NOT NULL DEFAULT 'U' CHECK (rol IN ('U', 'A', 'E')), nombre TEXT NOT NULL, apellidos TEXT, email TEXT, puntos INTEGER NOT NULL DEFAULT (0), PRIMARY KEY (id AUTOINCREMENT));
DROP TABLE IF EXISTS "carrito";
CREATE TABLE carrito (id INTEGER PRIMARY KEY AUTOINCREMENT, id_usuario INTEGER REFERENCES Usuarios (id), id_evento INTEGER REFERENCES eventos (id));
DROP TABLE IF EXISTS "entradasUsuario";
CREATE TABLE entradasUsuario (id INTEGER PRIMARY KEY AUTOINCREMENT, idUsuario INTEGER REFERENCES Usuarios (id), idEvento INTEGER REFERENCES eventos (id), cantidad INTEGER);
DROP TABLE IF EXISTS "eventos";
CREATE TABLE eventos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            descripcion TEXT NOT NULL,
            fecha TEXT NOT NULL,
            lugar TEXT NOT NULL,
            precio REAL NOT NULL,
            aforo_maximo INTEGER NOT NULL,
            entradas_vendidas INTEGER DEFAULT 0,
            imagen TEXT DEFAULT 'default.png'
        );
DROP TABLE IF EXISTS "mensajes";
CREATE TABLE mensajes (id INTEGER PRIMARY KEY UNIQUE, evento_id INTEGER REFERENCES eventos (id), usuario TEXT, contenido TEXT NOT NULL, fecha TEXT NOT NULL, parent_id INTEGER REFERENCES mensajes (id) ON DELETE CASCADE);
COMMIT;
