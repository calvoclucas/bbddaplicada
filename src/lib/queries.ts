export const dashboardQuery = `
SELECT COALESCE(SUM(monto_total), 0) AS facturacion_total,
       COUNT(*) AS ventas_total
FROM venta;

SELECT COUNT(*) AS vehiculos_vendidos
FROM detalle_venta;

SELECT COUNT(*) AS stock_disponible
FROM vehiculo
WHERE estado = 'DISPONIBLE';

SELECT COUNT(*) AS leads_total,
       COALESCE(SUM(CASE WHEN EXISTS(SELECT 1 FROM venta v WHERE v.id_lead = l.id_lead) THEN 1 ELSE 0 END), 0) AS leads_convertidos
FROM \`lead\` l;

WITH periodos AS (
  SELECT DISTINCT anio, mes FROM dim_tiempo
),
v AS (
  SELECT YEAR(fecha_venta) AS anio, MONTH(fecha_venta) AS mes, COUNT(*) AS ventas, SUM(monto_total) AS facturacion
  FROM venta
  GROUP BY YEAR(fecha_venta), MONTH(fecha_venta)
)
SELECT p.anio, p.mes, COALESCE(v.ventas, 0) AS ventas, COALESCE(v.facturacion, 0) AS facturacion
FROM periodos p
LEFT JOIN v ON v.anio = p.anio AND v.mes = p.mes
ORDER BY p.anio, p.mes
LIMIT 24;

WITH u AS (
  SELECT id_venta, COUNT(*) AS unidades
  FROM detalle_venta
  GROUP BY id_venta
)
SELECT e.id_vendedor,
       CONCAT(e.nombre, ' ', e.apellido) AS vendedor,
       COUNT(v.id_venta) AS ventas,
       COALESCE(SUM(v.monto_total), 0) AS facturacion,
       COALESCE(SUM(u.unidades), 0) AS unidades
FROM vendedor e
LEFT JOIN venta v ON v.id_vendedor = e.id_vendedor
LEFT JOIN u ON u.id_venta = v.id_venta
GROUP BY e.id_vendedor, e.nombre, e.apellido
ORDER BY facturacion DESC;

SELECT s.id_sucursal,
       s.nombre,
       COUNT(v.id_venta) AS ventas,
       COALESCE(SUM(v.monto_total), 0) AS facturacion
FROM sucursal s
LEFT JOIN venta v ON v.id_sucursal = s.id_sucursal
GROUP BY s.id_sucursal, s.nombre
ORDER BY facturacion DESC;

SELECT ma.nombre AS marca,
       m.nombre AS modelo,
       COUNT(*) AS unidades,
       SUM(d.precio_acordado) AS facturacion
FROM detalle_venta d
JOIN vehiculo v ON v.id_vehiculo = d.id_vehiculo
JOIN modelo m ON m.id_modelo = v.id_modelo
JOIN marca ma ON ma.id_marca = m.id_marca
GROUP BY ma.nombre, m.nombre
ORDER BY unidades DESC
LIMIT 10;

WITH c AS (
  SELECT l.id_lead,
         l.canal_origen,
         l.estado,
         CASE WHEN EXISTS(SELECT 1 FROM venta v WHERE v.id_lead = l.id_lead) THEN 1 ELSE 0 END AS convertido
  FROM \`lead\` l
)
SELECT canal_origen,
       COUNT(*) AS leads,
       SUM(convertido) AS convertidos,
       CAST(100.0 * SUM(convertido) / NULLIF(COUNT(*), 0) AS DECIMAL(6, 2)) AS conversion_pct
FROM c
GROUP BY canal_origen
ORDER BY leads DESC;

SELECT v.id_vehiculo,
       ma.nombre AS marca,
       m.nombre AS modelo,
       v.vin,
       v.estado,
       v.fecha_ingreso,
       DATEDIFF(CURDATE(), v.fecha_ingreso) AS dias_en_stock,
       (v.costo_compra + v.gastos_reparacion) AS costo_inmovilizado
FROM vehiculo v
JOIN modelo m ON m.id_modelo = v.id_modelo
JOIN marca ma ON ma.id_marca = m.id_marca
WHERE v.estado IN ('DISPONIBLE', 'RESERVADO')
  AND v.fecha_ingreso <= CURDATE()
ORDER BY dias_en_stock DESC
LIMIT 15;
`;