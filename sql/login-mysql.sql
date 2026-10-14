-- sql/crear-login-mysql.sql
CREATE USER IF NOT EXISTS 'ventas_app'@'localhost' IDENTIFIED BY 'Ventas123!';

GRANT SELECT, INSERT, UPDATE, DELETE ON ventas_autos.* TO 'ventas_app'@'localhost';

FLUSH PRIVILEGES;