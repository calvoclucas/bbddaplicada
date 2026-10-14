import { loadEnvConfig } from "@next/env";
import bcrypt from "bcryptjs";
import mysql from "mysql2/promise";

loadEnvConfig(process.cwd());

async function main() {
  const pool = await mysql.createConnection({
    host: process.env.DB_SERVER || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    database: process.env.DB_DATABASE || "ventas_autos",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || ""
  });

  const u = process.env.ADMIN_USER || "admin";
  const pass = process.env.ADMIN_PASSWORD || "Admin123!";
  const h = await bcrypt.hash(pass, 12);

  await pool.execute(
    `INSERT INTO usuario_app (usuario, nombre, password_hash, activo)
     VALUES (?, ?, ?, 1)
     ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), activo = 1`,
    [u, "Administrador", h]
  );

  console.log(`Usuario "${u}" listo con contraseña "${pass}"`);
  await pool.end();
}

main().catch((e) => {
  console.error("Error en init-auth:", e);
  process.exit(1);
});