import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import Dashboard from "@/components/Dashboard";
export default async function Home(){ const s=await getSession(); if(!s) redirect("/login"); return <Dashboard nombre={String(s.nombre||s.usuario||"Usuario")} />; }
