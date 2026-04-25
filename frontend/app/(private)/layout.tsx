"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  ClipboardList, 
  User, 
  LogOut, 
  Menu, 
  ChevronLeft,
  ChevronRight,
  Building2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const MENU_ITEMS = [
  { name: "Dashboard", href: "/condominio/1", icon: LayoutDashboard },
  { name: "Minhas Ocorrências", href: "/minhas-ocorrencias", icon: ClipboardList },
  { name: "Meu Perfil", href: "/perfil", icon: User },
]

interface NavContentProps {
  mobile?: boolean
  isCollapsed?: boolean
  pathname?: string
  onMobileClose?: () => void
}

function NavContent({ 
  mobile = false, 
  isCollapsed = true, 
  pathname = "", 
  onMobileClose = () => {} 
}: Readonly<NavContentProps>) {
  return (
    <div className="flex flex-col h-full py-4 overflow-hidden">
      {/* Logo Area */}
      <div className={`px-6 mb-8 flex items-center gap-3 transition-all duration-300 ${!mobile && isCollapsed ? "px-4 justify-center" : ""}`}>
        <div className="bg-primary p-2 rounded-lg shrink-0">
          <Building2 className="h-5 w-5 text-white" />
        </div>
        {(mobile || !isCollapsed) && (
          <span className="font-bold text-xl tracking-tight text-slate-900 animate-in fade-in duration-500">
            CondoFlow
          </span>
        )}
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 space-y-2">
        <TooltipProvider delayDuration={0}>
          {MENU_ITEMS.map((item) => {
            const isActive = pathname === item.href
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    onClick={() => onMobileClose()}
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

      {/* Footer Area */}
      <div className="px-3 mt-auto">
        <Separator className="mb-4" />
        <Button 
          variant="ghost" 
          className={`w-full text-red-500 hover:text-red-600 hover:bg-red-50 transition-all ${!mobile && isCollapsed ? "justify-center px-0" : "justify-start gap-3 px-3"}`}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {(mobile || !isCollapsed) && <span>Sair</span>}
        </Button>
      </div>
    </div>
  )
}

export default function PrivateLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(true) // Default recolhido
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <div className="flex h-screen bg-slate-50/50">
      {/* Sidebar Desktop */}
      <aside 
        className={`hidden md:flex flex-col bg-white border-r transition-all duration-300 relative ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        <NavContent 
          pathname={pathname} 
          isCollapsed={isCollapsed} 
          onMobileClose={() => setIsMobileOpen(false)}
        />
        {/* Toggle Button */}
        <Button
          onClick={() => setIsCollapsed(!isCollapsed)}
          variant="secondary"
          size="icon"
          className="absolute -right-3 top-8 h-6 w-6 rounded-full border shadow-sm z-50 hover:bg-primary hover:text-white transition-colors"
        >
          {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </Button>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-4 md:px-8 shrink-0">
          <div className="flex items-center gap-4">
            <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64">
                <NavContent 
                  mobile 
                  pathname={pathname} 
                  onMobileClose={() => setIsMobileOpen(false)}
                />
              </SheetContent>
            </Sheet>
            <h2 className="text-sm font-medium text-slate-500 hidden sm:block">
              Unidade: <span className="text-slate-900 font-bold">Apto 402</span>
            </h2>
          </div>

          <div className="flex items-center gap-3">
             <Avatar className="h-8 w-8 border">
                <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-bold">JS</AvatarFallback>
             </Avatar>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}