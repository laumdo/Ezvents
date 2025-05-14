BEGIN TRANSACTION;
DROP TABLE IF EXISTS "Descuento";
CREATE TABLE "Descuento" (
	"id"	INTEGER,
	"titulo"	TEXT NOT NULL,
	"condiciones"	TEXT,
	"puntos"	INTEGER NOT NULL,
	"imagen"	TEXT DEFAULT 'descuento.png',
	"interno"	INTEGER NOT NULL DEFAULT 0,
	"valor"	REAL DEFAULT NULL,
	PRIMARY KEY("id" AUTOINCREMENT)
);
DROP TABLE IF EXISTS "DescuentosUsuario";
CREATE TABLE "DescuentosUsuario" (
	"idUsuario"	INTEGER NOT NULL,
	"idDescuento"	INTEGER NOT NULL,
	"codigo"	TEXT NOT NULL UNIQUE,
	PRIMARY KEY("idUsuario","idDescuento"),
	FOREIGN KEY("idDescuento") REFERENCES "Descuento"("id") ON DELETE CASCADE,
	FOREIGN KEY("idDescuento") REFERENCES "Descuento"("id") ON DELETE CASCADE,
	FOREIGN KEY("idUsuario") REFERENCES "Usuarios"("id") ON DELETE CASCADE,
	FOREIGN KEY("idUsuario") REFERENCES "Usuarios"("id") ON DELETE CASCADE
);
DROP TABLE IF EXISTS "Usuarios";
CREATE TABLE "Usuarios" (
	"id"	INTEGER NOT NULL,
	"username"	TEXT NOT NULL UNIQUE,
	"password"	TEXT NOT NULL,
	"rol"	TEXT NOT NULL DEFAULT 'U' CHECK("rol" IN ('U', 'A', 'E')),
	"nombre"	TEXT NOT NULL,
	"apellidos"	TEXT,
	"email"	TEXT,
	"puntos"	INTEGER NOT NULL DEFAULT (0),
	"fecha_nacimiento"	TEXT NOT NULL,
	"fecha_ultimo_bonus"	TEXT,
	PRIMARY KEY("id" AUTOINCREMENT)
);
DROP TABLE IF EXISTS "acudeA";
CREATE TABLE "acudeA" (
	"id"	INTEGER,
	"idArtista"	INTEGER,
	"idEvento"	INTEGER,
	PRIMARY KEY("id"),
	FOREIGN KEY("idArtista") REFERENCES "artista"("id") ON DELETE CASCADE,
	FOREIGN KEY("idEvento") REFERENCES "eventos"("id") ON DELETE CASCADE
);
DROP TABLE IF EXISTS "artista";
CREATE TABLE "artista" (
	"id"	INTEGER,
	"nombreArtistico"	TEXT NOT NULL,
	"nombre"	TEXT NOT NULL,
	"biografia"	TEXT,
	"genero"	TEXT NOT NULL,
	"nacimiento"	TEXT NOT NULL,
	"canciones"	TEXT NOT NULL,
	"imagen"	TEXT DEFAULT ('defaultUser.png'),
	PRIMARY KEY("id")
);
DROP TABLE IF EXISTS "carrito";
CREATE TABLE "carrito" (
	"id"	INTEGER,
	"id_usuario"	INTEGER,
	"id_evento"	INTEGER,
	"precio"	REAL NOT NULL,
	"cantidad"	INTEGER NOT NULL DEFAULT (1),
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("id_evento") REFERENCES "eventos"("id") ON DELETE CASCADE,
	FOREIGN KEY("id_usuario") REFERENCES "Usuarios"("id") ON DELETE CASCADE
);
DROP TABLE IF EXISTS "entradasUsuario";
CREATE TABLE "entradasUsuario" (
	"id"	INTEGER,
	"idUsuario"	INTEGER,
	"idEvento"	INTEGER,
	"cantidad"	INTEGER,
	"fecha_compra"	TEXT NOT NULL DEFAULT 10-10-2000,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("idEvento") REFERENCES "eventos"("id") ON DELETE CASCADE,
	FOREIGN KEY("idUsuario") REFERENCES "Usuarios"("id") ON DELETE CASCADE
);
DROP TABLE IF EXISTS "eventos";
CREATE TABLE "eventos" (
	"id"	INTEGER,
	"idEmpresa"	INTEGER,
	"nombre"	TEXT NOT NULL,
	"descripcion"	TEXT NOT NULL,
	"fecha"	TEXT NOT NULL,
	"hora"	TEXT,
	"lugar"	TEXT NOT NULL,
	"precio"	REAL NOT NULL,
	"aforo_maximo"	INTEGER NOT NULL,
	"entradas_vendidas"	INTEGER DEFAULT 0,
	"imagen"	TEXT DEFAULT 'default.png',
	"edad_minima"	INTEGER NOT NULL DEFAULT 18,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("idEmpresa") REFERENCES "Usuarios"("id")
);
DROP TABLE IF EXISTS "mensajes";
CREATE TABLE "mensajes" (
	"id"	INTEGER UNIQUE,
	"evento_id"	INTEGER,
	"usuario"	TEXT,
	"contenido"	TEXT NOT NULL,
	"fecha"	TEXT NOT NULL,
	"parent_id"	INTEGER,
	PRIMARY KEY("id"),
	FOREIGN KEY("evento_id") REFERENCES "eventos"("id"),
	FOREIGN KEY("parent_id") REFERENCES "mensajes"("id") ON DELETE CASCADE
);
DROP TABLE IF EXISTS "valoraciones";
CREATE TABLE "valoraciones" (
	"id"	INTEGER,
	"id_evento"	INTEGER,
	"id_usuario"	INTEGER,
	"puntuacion"	INTEGER NOT NULL,
	"comentario"	TEXT,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("id_evento") REFERENCES "eventos"("id") ON DELETE CASCADE,
	FOREIGN KEY("id_usuario") REFERENCES "Usuarios"("id") ON DELETE CASCADE
);
COMMIT;
