"use client"

import React, { useState } from "react" // Adicionado useState
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  ShieldCheck, 
  Building2, 
  LayoutDashboard, 
  LogOut, 
  ChevronRight, // Ícone para abrir
  ChevronLeft,  // Ícone para fechar
  Globe
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const MENU_ADMIN = [
  { name: "Visão Geral", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Condomínios", href: "/admin/condominios", icon: Building2 },
]

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname()
  // 1. Estado começando como TRUE para colapsar por padrão
  const [isCollapsed, setIsCollapsed] = useState(true)

  return (
    <div className="flex h-screen bg-slate-100/50">
      {/* Sidebar Dark Dinâmica */}
      <aside 
        className={`bg-slate-950 text-slate-400 flex flex-col shrink-0 transition-all duration-300 relative ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Toggle Button */}
        <Button
          onClick={() => setIsCollapsed(!isCollapsed)}
          variant="secondary"
          size="icon"
          className="absolute -right-3 top-20 h-6 w-6 rounded-full border shadow-sm z-50 bg-emerald-500 hover:bg-emerald-600 text-slate-950 border-none"
        >
          {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </Button>

        {/* Logo HQ */}
        <div className={`h-16 flex items-center gap-3 px-6 border-b border-slate-800 ${isCollapsed ? "px-0 justify-center" : ""}`}>
          <div className="bg-emerald-500 p-1.5 rounded-md shrink-0">
            <ShieldCheck className="h-5 w-5 text-slate-950" />
          </div>
          {!isCollapsed && (
            <span className="font-bold text-white tracking-tight animate-in fade-in duration-500">
              CondoFlow <span className="text-emerald-500">HQ</span>
            </span>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {!isCollapsed && (
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-2 mb-4 animate-in fade-in">
              Menu Principal
            </p>
          )}
          
          <TooltipProvider delayDuration={0}>
            {MENU_ADMIN.map((item) => {
              const isActive = pathname === item.href
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 h-10 rounded-lg text-sm font-medium transition-all ${
                        isActive 
                          ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
                          : "hover:bg-slate-900 hover:text-slate-200"
                      } ${isCollapsed ? "justify-center px-0" : "px-3"}`}
                    >
                      {item.icon && <item.icon size={18} className="shrink-0" />}
                      {!isCollapsed && <span className="animate-in slide-in-from-left-2 duration-300">{item.name}</span>}
                    </Link>
                  </TooltipTrigger>
                  {isCollapsed && (
                    <TooltipContent side="right" className="bg-slate-900 text-white border-slate-800">
                      {item.name}
                    </TooltipContent>
                  )}
                </Tooltip>
              )
            })}
          </TooltipProvider>
        </nav>

        {/* Footer Admin */}
        <div className="p-4 mt-auto space-y-2">
          {!isCollapsed && (
            <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-800 animate-in fade-in">
              <p className="text-[10px] text-slate-500 font-bold uppercase">Plataforma</p>
              <div className="flex items-center justify-between mt-1 text-xs text-slate-300">
                <span>Status API</span>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
            </div>
          )}
          <Separator className="bg-slate-800" />
          <Button 
            variant="ghost" 
            className={`w-full text-slate-400 hover:text-red-400 hover:bg-red-500/10 ${isCollapsed ? "justify-center px-0" : "justify-start gap-3 px-3"}`}
          >
            <LogOut size={18} />
            {!isCollapsed && <span>Sair do HQ</span>}
          </Button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* ... Header permanece igual ao anterior ... */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-500 italic">Ambiente de Controle Global</span>
          </div>
          <div className="flex items-center gap-4">
             <div className="h-8 w-8 rounded-full bg-slate-900 text-emerald-500 flex items-center justify-center font-bold text-xs border border-emerald-500/20">
                AD
             </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  )
}