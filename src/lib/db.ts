import sql from "mssql";


const config: sql.config = {
  server: process.env.DB_SERVER || "localhost",
  database: process.env.DB_DATABASE || "ventas_autos",
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    trustServerCertificate: true,
    encrypt: false
  }
};

declare global {
  var sqlPool: Promise<sql.ConnectionPool> | undefined;
}

export async function getPool() {
  if (!global.sqlPool) {
    global.sqlPool = new sql.ConnectionPool(config).connect();
  }

  return global.sqlPool;
}