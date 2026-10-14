import bcrypt from "bcryptjs";
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

async function main() {
  const pool = await new sql.ConnectionPool(config).connect();

  await pool.request().query(`
    IF OBJECT_ID('dbo.usuario_app', 'U') IS NULL
    BEGIN
      CREATE TABLE dbo.usuario_app (
        id_usuario INT IDENTITY(1,1) PRIMARY KEY,
        usuario VARCHAR(60) NOT NULL UNIQUE,
        nombre VARCHAR(120) NOT NULL,
        password_hash VARCHAR(100) NOT NULL,
        activo BIT NOT NULL DEFAULT 1,
        fecha_alta DATETIME2 NOT NULL DEFAULT SYSDATETIME()
      )
    END
  `);

  const usuario = process.env.ADMIN_USER || "admin";
  const password = process.env.ADMIN_PASSWORD || "Admin123!";
  const hash = await bcrypt.hash(password, 12);

  await pool
    .request()
    .input("u", sql.VarChar, usuario)
    .input("n", sql.VarChar, "Administrador")
    .input("h", sql.VarChar, hash)
    .query(`
      IF EXISTS (
        SELECT 1
        FROM dbo.usuario_app
        WHERE usuario = @u
      )
        UPDATE dbo.usuario_app
        SET password_hash = @h,
            activo = 1
        WHERE usuario = @u
      ELSE
        INSERT INTO dbo.usuario_app
        (
          usuario,
          nombre,
          password_hash
        )
        VALUES
        (
          @u,
          @n,
          @h
        )
    `);

  console.log(`Usuario ${usuario} creado/actualizado.`);

  await pool.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});