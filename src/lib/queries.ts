export const dashboardQuery = `
SET NOCOUNT ON;

-- KPIs
SELECT
    COALESCE(SUM(monto_total), 0) AS facturacion_total,
    COUNT(*) AS ventas_total
FROM dbo.venta;

SELECT
    COUNT(*) AS vehiculos_vendidos
FROM dbo.detalle_venta;

SELECT
    COUNT(*) AS stock_disponible
FROM dbo.vehiculo
WHERE estado = N'DISPONIBLE';

-- Leads convertidos
;WITH leads_cte AS
(
    SELECT
        l.id_lead,
        CASE
            WHEN EXISTS
            (
                SELECT 1
                FROM dbo.venta v
                WHERE v.id_lead = l.id_lead
            )
            THEN 1
            ELSE 0
        END AS convertido
    FROM dbo.lead l
)
SELECT
    COUNT(*) AS leads_total,
    SUM(convertido) AS leads_convertidos
FROM leads_cte;

-- Ventas por mes
SELECT
    YEAR(fecha_venta) AS anio,
    MONTH(fecha_venta) AS mes,
    COUNT(*) AS ventas,
    SUM(monto_total) AS facturacion
FROM dbo.venta
GROUP BY
    YEAR(fecha_venta),
    MONTH(fecha_venta)
ORDER BY
    anio,
    mes;

-- Rendimiento por vendedor
;WITH u AS
(
    SELECT
        id_venta,
        COUNT(*) AS unidades
    FROM dbo.detalle_venta
    GROUP BY id_venta
)
SELECT
    e.id_vendedor,
    CONCAT(e.nombre, ' ', e.apellido) AS vendedor,
    COUNT(v.id_venta) AS ventas,
    COALESCE(SUM(v.monto_total), 0) AS facturacion,
    COALESCE(SUM(u.unidades), 0) AS unidades
FROM dbo.vendedor e
LEFT JOIN dbo.venta v
    ON v.id_vendedor = e.id_vendedor
LEFT JOIN u
    ON u.id_venta = v.id_venta
GROUP BY
    e.id_vendedor,
    e.nombre,
    e.apellido
ORDER BY facturacion DESC;

-- Ventas por sucursal
SELECT
    s.id_sucursal,
    s.nombre,
    COUNT(v.id_venta) AS ventas,
    COALESCE(SUM(v.monto_total), 0) AS facturacion
FROM dbo.sucursal s
LEFT JOIN dbo.venta v
    ON v.id_sucursal = s.id_sucursal
GROUP BY
    s.id_sucursal,
    s.nombre
ORDER BY facturacion DESC;

-- Modelos más vendidos
SELECT TOP 10
    ma.nombre AS marca,
    m.nombre AS modelo,
    COUNT(*) AS unidades,
    SUM(d.precio_acordado) AS facturacion
FROM dbo.detalle_venta d
INNER JOIN dbo.vehiculo v
    ON v.id_vehiculo = d.id_vehiculo
INNER JOIN dbo.modelo m
    ON m.id_modelo = v.id_modelo
INNER JOIN dbo.marca ma
    ON ma.id_marca = m.id_marca
GROUP BY
    ma.nombre,
    m.nombre
ORDER BY unidades DESC;

-- Conversion por canal
;WITH c AS
(
    SELECT
        l.id_lead,
        l.canal_origen,
        CASE
            WHEN EXISTS
            (
                SELECT 1
                FROM dbo.venta v
                WHERE v.id_lead = l.id_lead
            )
            THEN 1
            ELSE 0
        END AS convertido
    FROM dbo.lead l
)
SELECT
    canal_origen,
    COUNT(*) AS leads,
    SUM(convertido) AS convertidos,
    CAST(
        100.0 * SUM(convertido) / NULLIF(COUNT(*), 0)
        AS DECIMAL(6,2)
    ) AS conversion_pct
FROM c
GROUP BY canal_origen
ORDER BY leads DESC;

-- Aging de inventario
DECLARE @fecha_corte DATE = CONVERT(DATE, GETDATE());

SELECT TOP 15
    v.id_vehiculo,
    ma.nombre AS marca,
    m.nombre AS modelo,
    v.vin,
    v.estado,
    v.fecha_ingreso,
    DATEDIFF(DAY, v.fecha_ingreso, @fecha_corte) AS dias_en_stock,
    v.costo_compra + v.gastos_reparacion AS costo_inmovilizado
FROM dbo.vehiculo v
INNER JOIN dbo.modelo m
    ON m.id_modelo = v.id_modelo
INNER JOIN dbo.marca ma
    ON ma.id_marca = m.id_marca
WHERE
    v.estado IN (N'DISPONIBLE', N'RESERVADO')
    AND v.fecha_ingreso <= @fecha_corte
ORDER BY dias_en_stock DESC;
`;