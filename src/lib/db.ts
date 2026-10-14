import mysql from "mysql2/promise";

declare global {
  var mysqlPool: mysql.Pool | undefined;
}

export async function getPool() {
  if (!global.mysqlPool) {
    global.mysqlPool = mysql.createPool({
      host: process.env.DB_SERVER || "localhost",
      port: Number(process.env.DB_PORT || 3306),
      database: process.env.DB_DATABASE || "ventas_autos",
      user: process.env.DB_USER || "ventas_app",
      password: process.env.DB_PASSWORD || "Ventas123!",
      multipleStatements: true,
      decimalNumbers: true
    });
  }
  return global.mysqlPool;
}