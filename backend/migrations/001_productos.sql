-- Catálogo de productos (ejecutar en la base configurada en DB_NAME)
-- Columna nombre_producto: coincide con modelos ER típicos ("Nombre del producto")
CREATE TABLE IF NOT EXISTS productos (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre_producto VARCHAR(255) NOT NULL,
  descripcion TEXT NULL,
  precio_compra DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  precio_venta DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  cantidad_inventario INT UNSIGNED NOT NULL DEFAULT 0,
  estado TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1=activo, 0=inactivo',
  PRIMARY KEY (id),
  KEY idx_productos_nombre_producto (nombre_producto)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
