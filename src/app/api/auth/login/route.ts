import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { getPool } from "@/lib/db";
import { createToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { usuario, password } = z.object({ usuario:z.string().min(1), password:z.string().min(1) }).parse(await req.json());
    const pool = await getPool();
    const r = await pool.request().input("usuario", usuario).query(`SELECT TOP 1 id_usuario,usuario,nombre,password_hash,activo FROM dbo.usuario_app WHERE usuario=@usuario`);
    const user = r.recordset[0];
    if (!user || !user.activo || !(await bcrypt.compare(password,user.password_hash)))
      return NextResponse.json({ error:"Usuario o contraseña incorrectos" }, { status:401 });
    const token = await createToken({ id:user.id_usuario, usuario:user.usuario, nombre:user.nombre });
    const res = NextResponse.json({ ok:true });
    res.cookies.set("ventas_session",token,{ httpOnly:true,sameSite:"lax",secure:process.env.NODE_ENV==="production",path:"/",maxAge:28800 });
    return res;
  }catch (e: any) {
  console.error("LOGIN ERROR:", e);

  return Response.json(
    {
      error: e?.message || String(e)
    },
    {
      status: 500
    }
  );
}
}
