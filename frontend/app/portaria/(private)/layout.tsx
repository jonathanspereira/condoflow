"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Clock,
  CheckCheck,
  User,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
  Building2,
  Bell,
  Package
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
import { toast } from "sonner"

interface NotificationItem {
  id: number
  title: string
  message: string
  protocol?: string
  read: boolean
  createdAt: string
}

interface HeaderUser {
  name: string
  unitName?: string
  condominiumName?: string
  role: string
}

export default function PortariaLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname()
  const router = useRouter()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [userData, setUserData] = useState<HeaderUser | null>(null)

  const menuPortaria = [
    { name: "Encomendas", href: "/portaria/encomendas", icon: Package },
  ]
  
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState<number>(0)

  const getToken = () => (typeof window !== "undefined" ? localStorage.getItem("condoflow_token") : "")

  const getInitials = (name?: string) => {
    if (!name) return "?"
    const parts = name.trim().split(/\s+/)
    const first = parts[0]?.[0] || ""
    const last = parts.length > 1 ? parts[parts.length - 1][0] : ""
    return (first + last).toUpperCase()
  }

  // Buscar notificações
  const fetchNotifications = async () => {
    const token = getToken()
    if (!token) return
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setNotifications(data)
        setUnreadCount(data.filter((n: any) => !n.read).length)
      }
    } catch (err) {
      console.error("Erro ao buscar notificações:", err)
    }
  }

  const markAllAsRead = async () => {
    const token = getToken()
    if (!token) return
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/read-all`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      })
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
      toast.success("Todas as notificações foram marcadas como lidas.")
    } catch (err) {
      console.error("Erro ao marcar notificações como lidas:", err)
    }
  }

  const handleNotificationClick = async (n: NotificationItem) => {
    const token = getToken()
    if (token && !n.read) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/${n.id}/read`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` }
        })
        setNotifications((prev) => prev.map((item) => (item.id === n.id ? { ...item, read: true } : item)))
        setUnreadCount((prev) => Math.max(0, prev - 1))
      } catch (err) {
        console.error("Erro ao marcar notificação individual:", err)
      }
    }
  }

  useEffect(() => {
    async function fetchHeaderData() {
      const token = getToken()
      if (!token) {
        toast.error("Sessão expirada. Faça login novamente.")
        router.push("/portaria/login")
        return
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (response.ok) {
          const data = await response.json()
          
          if (data.role !== "CONCIERGE" && data.role !== "SUPER_ADMIN") {
            toast.error("Acesso negado. Esta área é exclusiva para a portaria.")
            router.push("/")
            return
          }
          
          setUserData(data)
        } else {
          localStorage.removeItem("condoflow_token")
          localStorage.removeItem("condoflow_user")
          toast.error("Sessão expirada ou inválida. Faça login novamente.")
          router.push("/portaria/login")
        }
      } catch (error) {
        toast.error("Erro de conexão com o servidor.")
      }
    }
    
    fetchHeaderData()
    fetchNotifications()

    const interval = setInterval(fetchNotifications, 15000)
    return () => clearInterval(interval)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("condoflow_token")
    localStorage.removeItem("condoflow_user")
    toast.success("Sessão encerrada com sucesso.")
    router.push("/portaria/login")
  }

  const activeMenuIndex = menuPortaria.findIndex((item) => pathname.startsWith(item.href))

  const NavContent = (mobile = false) => (
    <div className="flex flex-col h-full py-4 overflow-hidden">
      <div className={`px-6 mb-8 flex items-center gap-3 transition-all duration-300 ${!mobile && isCollapsed ? "px-4 justify-center" : ""}`}>
        <div className="bg-primary p-2 rounded-lg shrink-0 transition-colors">
          <Building2 className="h-5 w-5 text-white" />
        </div>
        {(mobile || !isCollapsed) && (
          <div className="flex flex-col animate-in fade-in duration-500">
            <span className="font-bold text-lg tracking-tight text-slate-900 leading-none">CondoFlow</span>
            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Portaria</span>
          </div>
        )}
      </div>

      <nav className="flex-1 px-3 space-y-2">
        <TooltipProvider delayDuration={0}>
          {menuPortaria.map((item, index) => {
            const isActive = index === activeMenuIndex || (activeMenuIndex === -1 && index === 0)
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
    </div>
  )

  return (
    <div className="flex h-screen bg-slate-50/50">
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

            <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary hidden sm:flex">
                    Módulo Portaria
                </Badge>
                <span className="text-sm font-bold text-slate-700 hidden sm:block italic">
                    {userData ? (userData.condominiumName || "Condomínio") : "Carregando..."}
                </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative text-slate-600 hover:text-slate-900">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 flex h-3 w-3 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white ring-2 ring-white animate-pulse">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-80 p-0 shadow-xl border-slate-200">
                  <div className="flex items-center justify-between p-3.5 border-b border-slate-100 bg-slate-50/80">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-emerald-600" />
                      <span className="font-bold text-xs text-slate-900">Notificações</span>
                    </div>
                    {unreadCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-[10px] text-emerald-600 hover:text-emerald-700 font-semibold px-2"
                        onClick={markAllAsRead}
                      >
                        <CheckCheck className="h-3 w-3 mr-1" />
                        Lidas
                      </Button>
                    )}
                  </div>
                  <div className="max-h-[320px] overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400 flex flex-col items-center gap-1.5">
                        <Bell className="h-6 w-6 text-slate-300" />
                        <span>Nenhuma notificação.</span>
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} onClick={() => handleNotificationClick(n)} className={`p-3 text-xs cursor-pointer transition-colors flex gap-2.5 items-start ${n.read ? "bg-white text-slate-600" : "bg-emerald-50/40 text-slate-900"}`}>
                           <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.read ? "bg-transparent" : "bg-emerald-500"}`} />
                           <div className="flex-1 space-y-1">
                             <div className="flex items-center justify-between gap-1">
                               <span className="font-bold text-slate-900">{n.title}</span>
                             </div>
                             <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">{n.message}</p>
                           </div>
                        </div>
                      ))
                    )}
                  </div>
                </DropdownMenuContent>
             </DropdownMenu>

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
                 <DropdownMenuItem onSelect={() => router.push("/portaria/perfil")}>
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

        <main className="flex-1 overflow-y-auto relative bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  )
}
