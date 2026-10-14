"use client";
import { useEffect,useState } from "react";
import { useRouter } from "next/navigation";
import { BarChart,Bar,LineChart,Line,XAxis,YAxis,CartesianGrid,Tooltip,ResponsiveContainer,PieChart,Pie,Cell } from "recharts";
import { Car,ChartNoAxesCombined,DollarSign,Target,LogOut,RefreshCw } from "lucide-react";
const money=(v:any)=>new Intl.NumberFormat("es-AR",{style:"currency",currency:"ARS",maximumFractionDigits:0}).format(Number(v||0));
const COLORS=["#2563eb","#06b6d4","#8b5cf6","#f59e0b","#10b981"];
export default function Dashboard({nombre}:{nombre:string}){
 const [d,setD]=useState<any>(); const [error,setError]=useState(""); const router=useRouter();
 async function load(){setError("");const r=await fetch("/api/dashboard",{cache:"no-store"});const j=await r.json();if(!r.ok)setError(j.error);else setD(j)}
 useEffect(()=>{load()},[]); async function logout(){await fetch("/api/auth/logout",{method:"POST"});router.replace("/login")}
 if(error)return <main className="center"><div className="errorPanel"><h2>Error al consultar SQL Server</h2><pre>{error}</pre><button onClick={load}>Reintentar</button></div></main>;
 if(!d)return <main className="center">Cargando tablero...</main>;
 const conv=d.kpis.leads_total?100*d.kpis.leads_convertidos/d.kpis.leads_total:0;
 return <div><header><div><div className="eyebrow">VENTAS AUTOS</div><h1>Dashboard ejecutivo</h1></div><div className="user"><span>{nombre}</span><button onClick={load} title="Actualizar"><RefreshCw size={18}/></button><button onClick={logout} title="Salir"><LogOut size={18}/></button></div></header>
 <main className="wrap"><section className="kpis">
 <Card icon={<DollarSign/>} label="Facturación total" value={money(d.kpis.facturacion_total)}/><Card icon={<ChartNoAxesCombined/>} label="Ventas" value={d.kpis.ventas_total}/><Card icon={<Car/>} label="Unidades vendidas" value={d.kpis.vehiculos_vendidos}/><Card icon={<Target/>} label="Conversión de leads" value={`${conv.toFixed(1)}%`}/></section>
 <section className="grid"><Panel title="Ventas y facturación mensual" wide><ResponsiveContainer width="100%" height={290}><LineChart data={d.ventasMensuales}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="mes"/><YAxis yAxisId="left"/><YAxis yAxisId="right" orientation="right" tickFormatter={(v)=>`${Math.round(v/1e6)}M`}/><Tooltip formatter={(v:any,n)=>n==="facturacion"?money(v):v}/><Bar yAxisId="left" dataKey="ventas" fill="#93c5fd"/><Line yAxisId="right" type="monotone" dataKey="facturacion" stroke="#2563eb" strokeWidth={3}/></LineChart></ResponsiveContainer></Panel>
 <Panel title="Ventas por sucursal"><ResponsiveContainer width="100%" height={290}><PieChart><Pie data={d.sucursales} dataKey="facturacion" nameKey="nombre" outerRadius={95} label>{d.sucursales.map((_:any,i:number)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}</Pie><Tooltip formatter={(v:any)=>money(v)}/></PieChart></ResponsiveContainer></Panel>
 <Panel title="Modelos más vendidos"><ResponsiveContainer width="100%" height={290}><BarChart data={d.modelos} layout="vertical"><CartesianGrid strokeDasharray="3 3"/><XAxis type="number"/><YAxis type="category" dataKey="modelo" width={105}/><Tooltip/><Bar dataKey="unidades" fill="#2563eb" radius={[0,6,6,0]}/></BarChart></ResponsiveContainer></Panel>
 <Panel title="Conversión por canal"><div className="tableWrap"><table><thead><tr><th>Canal</th><th>Leads</th><th>Convertidos</th><th>%</th></tr></thead><tbody>{d.canales.map((x:any)=><tr key={x.canal_origen}><td>{x.canal_origen}</td><td>{x.leads}</td><td>{x.convertidos}</td><td>{x.conversion_pct}%</td></tr>)}</tbody></table></div></Panel>
 <Panel title="Rendimiento por vendedor"><div className="tableWrap"><table><thead><tr><th>Vendedor</th><th>Ventas</th><th>Unidades</th><th>Facturación</th></tr></thead><tbody>{d.vendedores.map((x:any)=><tr key={x.id_vendedor}><td>{x.vendedor}</td><td>{x.ventas}</td><td>{x.unidades}</td><td>{money(x.facturacion)}</td></tr>)}</tbody></table></div></Panel>
 <Panel title="Aging de inventario" wide><div className="tableWrap"><table><thead><tr><th>Marca / Modelo</th><th>VIN</th><th>Estado</th><th>Días</th><th>Costo inmovilizado</th></tr></thead><tbody>{d.inventario.map((x:any)=><tr key={x.id_vehiculo}><td>{x.marca} {x.modelo}</td><td>{x.vin}</td><td><span className="pill">{x.estado}</span></td><td>{x.dias_en_stock}</td><td>{money(x.costo_inmovilizado)}</td></tr>)}</tbody></table></div></Panel></section></main></div>
}
function Card({icon,label,value}:{icon:any,label:string,value:any}){return <article className="card"><div className="icon">{icon}</div><div><small>{label}</small><strong>{value}</strong></div></article>}
function Panel({title,children,wide=false}:{title:string,children:any,wide?:boolean}){return <article className={`panel ${wide?"wide":""}`}><h2>{title}</h2>{children}</article>}
