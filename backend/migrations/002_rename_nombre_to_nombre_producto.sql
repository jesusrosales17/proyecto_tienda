-- Solo si ya tenías la tabla con la columna "nombre" (script viejo).
-- Renombra a nombre_producto para que coincida con el backend.

ALTER TABLE productos CHANGE COLUMN nombre nombre_producto VARCHAR(255) NOT NULL;
