-- sql/db.mysql.sql
CREATE DATABASE IF NOT EXISTS ventas_autos
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE ventas_autos;

-- 1. Tabla de usuarios de la aplicación (de scripts/init-auth.ts)
CREATE TABLE IF NOT EXISTS usuario_app (
  id_usuario INT AUTO_INCREMENT PRIMARY KEY,
  usuario VARCHAR(60) NOT NULL UNIQUE,
  nombre VARCHAR(120) NOT NULL,
  password_hash VARCHAR(100) NOT NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  fecha_alta DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Catálogos y dimensiones
CREATE TABLE IF NOT EXISTS marca (
  id_marca INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(80) NOT NULL
);

CREATE TABLE IF NOT EXISTS modelo (
  id_modelo INT AUTO_INCREMENT PRIMARY KEY,
  id_marca INT NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  CONSTRAINT fk_modelo_marca FOREIGN KEY (id_marca) REFERENCES marca(id_marca)
);

CREATE TABLE IF NOT EXISTS sucursal (
  id_sucursal INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS vendedor (
  id_vendedor INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(80) NOT NULL,
  apellido VARCHAR(80) NOT NULL
);

CREATE TABLE IF NOT EXISTS dim_tiempo (
  id_tiempo INT AUTO_INCREMENT PRIMARY KEY,
  anio INT NOT NULL,
  mes INT NOT NULL
);

-- Nota: `lead` lleva comillas invertidas (backticks) porque LEAD es palabra reservada en MySQL 8+
CREATE TABLE IF NOT EXISTS `lead` (
  id_lead INT AUTO_INCREMENT PRIMARY KEY,
  canal_origen VARCHAR(80) NOT NULL,
  estado VARCHAR(40) NOT NULL
);

-- 3. Inventario y Ventas
CREATE TABLE IF NOT EXISTS vehiculo (
  id_vehiculo INT AUTO_INCREMENT PRIMARY KEY,
  id_modelo INT NOT NULL,
  vin VARCHAR(50) NOT NULL UNIQUE,
  estado VARCHAR(30) NOT NULL DEFAULT 'DISPONIBLE',
  fecha_ingreso DATE NOT NULL,
  costo_compra DECIMAL(15, 2) NOT NULL DEFAULT 0,
  gastos_reparacion DECIMAL(15, 2) NOT NULL DEFAULT 0,
  CONSTRAINT fk_vehiculo_modelo FOREIGN KEY (id_modelo) REFERENCES modelo(id_modelo)
);

CREATE TABLE IF NOT EXISTS venta (
  id_venta INT AUTO_INCREMENT PRIMARY KEY,
  id_vendedor INT NOT NULL,
  id_sucursal INT NOT NULL,
  id_lead INT NULL,
  fecha_venta DATE NOT NULL,
  monto_total DECIMAL(15, 2) NOT NULL DEFAULT 0,
  CONSTRAINT fk_venta_vendedor FOREIGN KEY (id_vendedor) REFERENCES vendedor(id_vendedor),
  CONSTRAINT fk_venta_sucursal FOREIGN KEY (id_sucursal) REFERENCES sucursal(id_sucursal),
  CONSTRAINT fk_venta_lead FOREIGN KEY (id_lead) REFERENCES `lead`(id_lead)
);

CREATE TABLE IF NOT EXISTS detalle_venta (
  id_detalle INT AUTO_INCREMENT PRIMARY KEY,
  id_venta INT NOT NULL,
  id_vehiculo INT NOT NULL,
  precio_acordado DECIMAL(15, 2) NOT NULL DEFAULT 0,
  CONSTRAINT fk_detalle_venta FOREIGN KEY (id_venta) REFERENCES venta(id_venta),
  CONSTRAINT fk_detalle_vehiculo FOREIGN KEY (id_vehiculo) REFERENCES vehiculo(id_vehiculo)
);