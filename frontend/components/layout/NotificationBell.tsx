"use client"

import React, { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const fetchUnreadCount = async () => {
      const token = localStorage.getItem("condoflow_token")
      if (!token) return

      try {
        const res = await fetch("http://localhost:8080/api/v1/notifications/unread-count", {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          setUnreadCount(data.unreadCount || 0)
        }
      } catch (error) {
        console.error("Erro ao buscar notificações", error)
      }
    }

    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 15000) // Poll a cada 15 segundos
    return () => clearInterval(interval)
  }, [])

  return (
    <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-emerald-600">
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white border-2 border-white">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </Button>
  )
}
