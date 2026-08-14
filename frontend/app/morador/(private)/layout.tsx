"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  ClipboardList,
  User,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
  Building2,
  Bell,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"

// MENU PARA O MORADOR
const MENU_MORADOR = [
  { name: "Minhas Ocorrências", href: "/morador/minhas-ocorrencias", icon: ClipboardList },
]

// MENU PARA O SÍNDICO
const MENU_SINDICO = [
  { name: "Painel Geral", href: "/sindico/condominio/1", icon: LayoutDashboard },
  { name: "Ocorrências", href: "/sindico/painel/ocorrencia/historico", icon: ClipboardList },
  { name: "Moradores", href: "/sindico/moradores", icon: Users },
]

interface HeaderUser {
  name: string
  unitName?: string
  condominiumName?: string
}

export default function PrivateLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname()
  const router = useRouter()
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [userData, setUserData] = useState<HeaderUser | null>(null)

  // Lógica para determinar o contexto
  const isAreaSindico = pathname.startsWith("/sindico")
  const isSeletorCondominio = pathname === "/sindico/condominio"
  const menuAtual = isAreaSindico ? MENU_SINDICO : MENU_MORADOR
  const activeMenuIndex = menuAtual.findIndex((item) => pathname === item.href)

  const getToken = () => (typeof window !== "undefined" ? localStorage.getItem("condoflow_token") : "")

  const getInitials = (name?: string) => {
    if (!name) return "?"
    const parts = name.trim().split(/\s+/)
    const first = parts[0]?.[0] || ""
    const last = parts.length > 1 ? parts[parts.length - 1][0] : ""
    return (first + last).toUpperCase()
  }

  useEffect(() => {
    async function fetchHeaderData() {
      try {
        const response = await fetch("http://localhost:8080/api/v1/users/me", {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        })
        if (response.ok) {
          const data = await response.json()
          setUserData(data)
        }
      } catch (error) {
        console.error("Erro ao carregar dados do usuário no header:", error)
      }
    }

    fetchHeaderData()
  }, [])

  const handleProfileClick = () => {
    if (isAreaSindico) {
      router.push("/sindico/perfil")
      return
    }

    router.push("/morador/perfil")
  }

  const handleLogout = () => {
    router.push("/")
  }

  const NavContent = (mobile = false) => (
    <div className="flex flex-col h-full py-4 overflow-hidden">
      {/* Logo Area */}
      <div className={`px-6 mb-8 flex items-center gap-3 transition-all duration-300 ${!mobile && isCollapsed ? "px-4 justify-center" : ""}`}>
        <div className="bg-primary p-2 rounded-lg shrink-0 transition-colors">
          <Building2 className="h-5 w-5 text-white" />
        </div>
        {(mobile || !isCollapsed) && (
          <div className="flex flex-col animate-in fade-in duration-500">
            <span className="font-bold text-lg tracking-tight text-slate-900 leading-none">CondoFlow</span>
            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
              {isAreaSindico ? 'Administração' : 'Morador'}
            </span>
          </div>
        )}
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 space-y-2">
        <TooltipProvider delayDuration={0}>
          {menuAtual.map((item, index) => {
            const isActive = index === activeMenuIndex
            return (
              <Tooltip key={`${item.href}-${item.name}`}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`flex items-center rounded-md text-sm font-medium transition-all duration-200 h-10 ${
                      isActive ? "bg-primary/10 text-primary" : "text-slate-600 hover:bg-slate-100"
                    } ${!mobile && isCollapsed ? "justify-center w-10 mx-auto" : "px-3 gap-3 w-full"}`}
                  >
                    <item.icon className={`h-5 w-5 shrink-0 ${isActive ? "text-primary" : "text-slate-400"}`} />
                    {(mobile || !isCollapsed) && <span className="truncate">{item.name}</span>}
                  </Link>
                </TooltipTrigger>
                {!mobile && isCollapsed && (
                  <TooltipContent side="right">{item.name}</TooltipContent>
                )}
              </Tooltip>
            )
          })}
        </TooltipProvider>
      </nav>

      {/* Acesso/Condomínios no Rodapé */}
      <div className="px-3 mt-auto space-y-4">
        {(!isCollapsed || mobile) && isAreaSindico && (
          <div className="bg-primary/5 p-3 rounded-lg border border-primary/20 mx-2 animate-in fade-in">
            <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Acesso</p>
            <div className="flex items-center gap-2 text-xs font-semibold text-primary">Síndico</div>
          </div>
        )}
        {isAreaSindico && <Separator className="mx-2" />}
        {isAreaSindico ? (
          <Link
            href="/sindico/condominio"
            onClick={() => setIsMobileOpen(false)}
            className={`flex items-center gap-3 rounded-md text-sm font-medium transition-all duration-200 h-10 text-slate-600 hover:bg-slate-100 ${!mobile && isCollapsed ? "justify-center px-0 w-10 mx-auto" : "px-3"}`}
          >
            <Building2 className="h-5 w-5 shrink-0 text-slate-400" />
            {(mobile || !isCollapsed) && <span className="truncate">Condomínios</span>}
          </Link>
        ) : null}
      </div>
    </div>
  )

  if (isSeletorCondominio) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex flex-col">
        <header className="h-16 bg-white border-b flex items-center justify-between px-4 md:px-8 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-lg shrink-0">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-tight text-slate-900 leading-none">CondoFlow</span>
              <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Administração</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary hidden sm:flex">
              Seletor de Condomínio
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-9 w-9 rounded-full p-0">
                  <Avatar className="h-9 w-9 border-2 border-slate-100">
                    <AvatarFallback className="bg-primary text-white text-[10px] font-bold">
                      {getInitials(userData?.name)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={handleProfileClick}>
                  <User className="h-4 w-4" />
                  Perfil
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={handleLogout} className="text-red-600 focus:text-red-600">
                  <LogOut className="h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1">{children}</main>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-slate-50/50">
      {/* Sidebar Desktop */}
      <aside 
        className={`hidden md:flex flex-col bg-white border-r transition-all duration-300 relative z-30 ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        {NavContent()}
        <Button
          onClick={() => setIsCollapsed(!isCollapsed)}
          variant="secondary"
          size="icon"
          className="absolute -right-3 top-8 h-6 w-6 rounded-full border shadow-sm z-50 hover:bg-slate-200 transition-colors"
        >
          {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </Button>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header Dinâmico */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-4 md:px-8 shrink-0 relative z-20">
          <div className="flex items-center gap-4">
            <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64">
                {NavContent(true)}
              </SheetContent>
            </Sheet>

            {/* Título de contexto no Header */}
            {isAreaSindico ? (
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary hidden sm:flex">
                        Módulo Administrativo
                    </Badge>
                    <span className="text-sm font-bold text-slate-700 hidden sm:block italic">
                        {userData?.condominiumName || "Carregando..."}
                    </span>
                </div>
            ) : (
                <h2 className="text-sm font-medium text-slate-500 hidden sm:block">
                  Morador:{" "}
                  <span className="text-slate-900 font-bold tracking-tight">
                    {userData
                      ? `${userData.name}${userData.unitName ? ` - ${userData.unitName}` : ""}`
                      : "Carregando..."}
                  </span>
                </h2>
            )}
          </div>

          <div className="flex items-center gap-3">
             <Button variant="ghost" size="icon" className="relative text-slate-500">
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
             </Button>
             <Separator orientation="vertical" className="h-6 mx-1" />
             <DropdownMenu>
               <DropdownMenuTrigger asChild>
                 <Button variant="ghost" className="h-9 w-9 rounded-full p-0">
                   <Avatar className="h-9 w-9 border-2 border-slate-100">
                      <AvatarFallback className="bg-primary text-white text-[10px] font-bold">
                          {getInitials(userData?.name)}
                      </AvatarFallback>
                   </Avatar>
                 </Button>
               </DropdownMenuTrigger>
               <DropdownMenuContent align="end">
                 <DropdownMenuItem onSelect={handleProfileClick}>
                   <User className="h-4 w-4" />
                   Perfil
                 </DropdownMenuItem>
                 <DropdownMenuSeparator />
                 <DropdownMenuItem onSelect={handleLogout} className="text-red-600 focus:text-red-600">
                   <LogOut className="h-4 w-4" />
                   Sair
                 </DropdownMenuItem>
               </DropdownMenuContent>
             </DropdownMenu>
          </div>
        </header>

        {/* Área de Conteúdo */}
        <main className="flex-1 overflow-y-auto relative">
          {children}
        </main>
      </div>
    </div>
  )
}