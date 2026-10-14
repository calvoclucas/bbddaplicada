USE master;
GO

CREATE LOGIN ventas_app
WITH PASSWORD = 'Ventas123!';
GO

USE ventas_autos;
GO

CREATE USER ventas_app FOR LOGIN ventas_app;
GO

ALTER ROLE db_datareader ADD MEMBER ventas_app;
ALTER ROLE db_datawriter ADD MEMBER ventas_app;
GO