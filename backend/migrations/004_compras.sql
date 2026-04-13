-- Tablas del módulo de compras (ejecutar en la misma base que productos/usuarios).
-- Relación: compras -> detalle_compras -> productos; compras.usuario_id -> usuarios.

CREATE TABLE IF NOT EXISTS compras (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  usuario_id INT UNSIGNED NOT NULL,
  proveedor VARCHAR(255) NOT NULL,
  total DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_compras_fecha (fecha),
  KEY idx_compras_usuario (usuario_id),
  CONSTRAINT fk_compras_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS detalle_compras (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  compra_id INT UNSIGNED NOT NULL,
  producto_id INT UNSIGNED NOT NULL,
  cantidad_comprada INT UNSIGNED NOT NULL,
  precio_unitario DECIMAL(12, 2) NOT NULL,
  PRIMARY KEY (id),
  KEY idx_detalle_compras_compra (compra_id),
  KEY idx_detalle_compras_producto (producto_id),
  CONSTRAINT fk_detalle_compras_compra FOREIGN KEY (compra_id) REFERENCES compras (id) ON DELETE CASCADE,
  CONSTRAINT fk_detalle_compras_producto FOREIGN KEY (producto_id) REFERENCES productos (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
