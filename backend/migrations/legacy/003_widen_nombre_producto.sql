-- Si nombre_producto quedó con pocos caracteres (p. ej. VARCHAR(10)), amplía a 255:
ALTER TABLE productos MODIFY COLUMN nombre_producto VARCHAR(255) NOT NULL;
