export const dashboardQuery = `
SET NOCOUNT ON;
SELECT COALESCE(SUM(monto_total),0) facturacion_total,
       COUNT(*) ventas_total
FROM dbo.venta;

SELECT COUNT(*) vehiculos_vendidos FROM dbo.detalle_venta;
SELECT COUNT(*) stock_disponible FROM dbo.vehiculo WHERE estado=N'DISPONIBLE';
SELECT COUNT(*) leads_total,
       COALESCE(SUM(CASE WHEN EXISTS(SELECT 1 FROM dbo.venta v WHERE v.id_lead=l.id_lead) THEN 1 ELSE 0 END),0) leads_convertidos
FROM dbo.lead l;

;WITH periodos AS (SELECT DISTINCT anio, mes FROM dbo.dim_tiempo),
v AS (
 SELECT YEAR(fecha_venta) anio, MONTH(fecha_venta) mes, COUNT(*) ventas, SUM(monto_total) facturacion
 FROM dbo.venta GROUP BY YEAR(fecha_venta), MONTH(fecha_venta)
)
SELECT TOP 24 p.anio,p.mes,COALESCE(v.ventas,0) ventas,COALESCE(v.facturacion,0) facturacion
FROM periodos p LEFT JOIN v ON v.anio=p.anio AND v.mes=p.mes
ORDER BY p.anio,p.mes;

;WITH u AS (SELECT id_venta,COUNT(*) unidades FROM dbo.detalle_venta GROUP BY id_venta)
SELECT e.id_vendedor, CONCAT(e.nombre,' ',e.apellido) vendedor, COUNT(v.id_venta) ventas,
       COALESCE(SUM(v.monto_total),0) facturacion, COALESCE(SUM(u.unidades),0) unidades
FROM dbo.vendedor e LEFT JOIN dbo.venta v ON v.id_vendedor=e.id_vendedor
LEFT JOIN u ON u.id_venta=v.id_venta
GROUP BY e.id_vendedor,e.nombre,e.apellido ORDER BY facturacion DESC;

SELECT s.id_sucursal,s.nombre,COUNT(v.id_venta) ventas,COALESCE(SUM(v.monto_total),0) facturacion
FROM dbo.sucursal s LEFT JOIN dbo.venta v ON v.id_sucursal=s.id_sucursal
GROUP BY s.id_sucursal,s.nombre ORDER BY facturacion DESC;

SELECT TOP 10 ma.nombre marca,m.nombre modelo,COUNT(*) unidades,SUM(d.precio_acordado) facturacion
FROM dbo.detalle_venta d JOIN dbo.vehiculo v ON v.id_vehiculo=d.id_vehiculo
JOIN dbo.modelo m ON m.id_modelo=v.id_modelo JOIN dbo.marca ma ON ma.id_marca=m.id_marca
GROUP BY ma.nombre,m.nombre ORDER BY unidades DESC;

;WITH c AS (
 SELECT l.id_lead,l.canal_origen,l.estado,
 CASE WHEN EXISTS(SELECT 1 FROM dbo.venta v WHERE v.id_lead=l.id_lead) THEN 1 ELSE 0 END convertido
 FROM dbo.lead l
)
SELECT canal_origen,COUNT(*) leads,SUM(convertido) convertidos,
 CAST(100.0*SUM(convertido)/NULLIF(COUNT(*),0) AS decimal(6,2)) conversion_pct
FROM c GROUP BY canal_origen ORDER BY leads DESC;

DECLARE @fecha_corte date=CONVERT(date,GETDATE());
SELECT TOP 15 v.id_vehiculo,ma.nombre marca,m.nombre modelo,v.vin,v.estado,v.fecha_ingreso,
DATEDIFF(day,v.fecha_ingreso,@fecha_corte) dias_en_stock,
v.costo_compra+v.gastos_reparacion costo_inmovilizado
FROM dbo.vehiculo v JOIN dbo.modelo m ON m.id_modelo=v.id_modelo JOIN dbo.marca ma ON ma.id_marca=m.id_marca
WHERE v.estado IN (N'DISPONIBLE',N'RESERVADO') AND v.fecha_ingreso<=@fecha_corte
ORDER BY dias_en_stock DESC;
`;
