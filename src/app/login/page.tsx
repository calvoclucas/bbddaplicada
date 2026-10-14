"use client";
import { FormEvent,useState } from "react";
import { useRouter } from "next/navigation";
console.log("DB_SERVER:", process.env.DB_SERVER);
console.log("DB_DATABASE:", process.env.DB_DATABASE);
console.log("DB_USER:", process.env.DB_USER);
export default function Login(){
 const [error,setError]=useState(""); const [loading,setLoading]=useState(false); const router=useRouter();
 async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setLoading(true);setError("");const f=new FormData(e.currentTarget);
  const r=await fetch("/api/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({usuario:f.get("usuario"),password:f.get("password")})});
  const j=await r.json(); setLoading(false); if(!r.ok) return setError(j.error); router.replace("/"); router.refresh(); }
 return <main className="login"><form className="loginCard" onSubmit={submit}><div className="logo">VA</div><h1>Ventas Autos</h1><p>Tablero comercial y de inventario</p>
 <label>Usuario<input name="usuario" autoComplete="username" required /></label><label>Contraseña<input name="password" type="password" autoComplete="current-password" required /></label>
 {error&&<div className="error">{error}</div>}<button disabled={loading}>{loading?"Ingresando...":"Ingresar"}</button></form></main>;
}
