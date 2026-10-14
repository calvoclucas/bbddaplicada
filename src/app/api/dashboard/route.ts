import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getPool } from "@/lib/db";
import { dashboardQuery } from "@/lib/queries";
export const dynamic="force-dynamic";
export async function GET(){
  if(!await getSession()) return NextResponse.json({error:"No autorizado"},{status:401});
  try{
    const result=await (await getPool()).request().query(dashboardQuery);
    const rs=result.recordsets as any[];
    return NextResponse.json({
      kpis:{...rs[0][0],...rs[1][0],...rs[2][0],...rs[3][0]},
      ventasMensuales:rs[4], vendedores:rs[5], sucursales:rs[6], modelos:rs[7], canales:rs[8], inventario:rs[9]
    });
  }catch(e:any){ return NextResponse.json({error:e.message || "Error SQL"},{status:500}); }
}
