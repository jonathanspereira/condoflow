"use client"

import React, { useState, useEffect } from "react"
import { Bell, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Notification {
  id: number
  title: string
  message: string
  relatedProtocol?: string
  read: boolean
  createdAt: string
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const getToken = () => typeof window !== "undefined" ? localStorage.getItem("condoflow_token") : null

  const fetchNotifications = async () => {
    const token = getToken()
    if (!token) return

    try {
      const res = await fetch("http://localhost:8080/api/v1/notifications", {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data: Notification[] = await res.json()
        setNotifications(data)
        setUnreadCount(data.filter(n => !n.read).length)
      }
    } catch (error) {
      console.error("Erro ao buscar notificações", error)
    }
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 15000)
    return () => clearInterval(interval)
  }, [])

  const markAllAsRead = async () => {
    const token = getToken()
    if (!token || unreadCount === 0) return
    setIsLoading(true)
    try {
      const res = await fetch("http://localhost:8080/api/v1/notifications/read-all", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
        setUnreadCount(0)
      }
    } catch (error) {
      console.error("Erro ao marcar todas como lidas", error)
    } finally {
      setIsLoading(false)
    }
  }

  const markAsRead = async (id: number) => {
    const token = getToken()
    if (!token) return
    try {
      const res = await fetch(`http://localhost:8080/api/v1/notifications/${id}/read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error("Erro ao marcar notificação como lida", error)
    }
  }

  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso)
      return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) + " - " + d.toLocaleDateString("pt-BR")
    } catch {
      return iso
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-emerald-600">
          <Bell className="h-6 w-6" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-2 flex h-3 w-3 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white border border-white">
              {unreadCount > 9 ? "+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 overflow-hidden shadow-lg border-slate-200">
        <div className="flex items-center justify-between p-4 bg-slate-50 border-b border-slate-100">
          <h4 className="font-semibold text-sm text-slate-900">Notificações</h4>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAllAsRead}
              disabled={isLoading}
              className="text-xs text-emerald-600 hover:text-emerald-700 h-auto p-1 px-2"
            >
              {isLoading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Check className="h-3 w-3 mr-1" />}
              Marcar lidas
            </Button>
          )}
        </div>
        <ScrollArea className="h-80">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              Nenhuma notificação encontrada.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {notifications.map(n => (
                <div 
                  key={n.id} 
                  className={`p-4 transition-colors hover:bg-slate-50 cursor-pointer ${!n.read ? 'bg-emerald-50/30' : 'opacity-70'}`}
                  onClick={() => {
                    if (!n.read) markAsRead(n.id)
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <p className={`text-sm ${!n.read ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'}`}>
                        {n.title}
                      </p>
                      <p className="text-xs text-slate-500 leading-snug">
                        {n.message}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {formatTime(n.createdAt)}
                      </p>
                    </div>
                    {!n.read && (
                      <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0 mt-1" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
