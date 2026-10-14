import sql from "mssql/msnodesqlv8";

const config = {
  server: "(localdb)\\MSSQLLocalDB",
  database: "ventas_autos",
  driver: "msnodesqlv8",
  options: {
    trustedConnection: true,
    trustServerCertificate: true,
  },
};

declare global {
  var sqlPool: Promise<any> | undefined;
}

export function getPool() {
  if (!global.sqlPool) {
    global.sqlPool = new sql.ConnectionPool(config).connect();
  }

  return global.sqlPool;
}