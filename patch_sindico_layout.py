import re

with open("frontend/app/sindico/(private)/layout.tsx", "r") as f:
    content = f.read()

# Add imports
content = content.replace('import {\n  LayoutDashboard,', 'import {\n  LayoutDashboard,\n  Clock,\n  CheckCheck,')

# Add NotificationItem interface
notification_item = """
interface NotificationItem {
  id: number
  title: string
  message: string
  protocol?: string
  read: boolean
  createdAt: string
}
"""
content = content.replace('interface HeaderUser', notification_item + '\ninterface HeaderUser')

# Add state and logic
logic = """
  // Notificações do Sininho
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState<number>(0)

  // Buscar notificações do backend
  const fetchNotifications = async () => {
    const token = getToken()
    if (!token) return
    try {
      const res = await fetch("http://localhost:8080/api/v1/notifications", {
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
      await fetch("http://localhost:8080/api/v1/notifications/read-all", {
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
        await fetch(`http://localhost:8080/api/v1/notifications/${n.id}/read`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` }
        })
        setNotifications((prev) => prev.map((item) => (item.id === n.id ? { ...item, read: true } : item)))
        setUnreadCount((prev) => Math.max(0, prev - 1))
      } catch (err) {
        console.error("Erro ao marcar notificação individual:", err)
      }
    }

    if (n.protocol) {
      router.push("/sindico/painel/ocorrencia/historico")
    }
  }

  const formatDataNotificacao = (iso: string) => {
    try {
      const d = new Date(iso)
      return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) + " - " + d.toLocaleDateString("pt-BR")
    } catch {
      return iso
    }
  }
"""

content = content.replace('const isAreaSindico = pathname.startsWith("/sindico")', logic + '\n  const isAreaSindico = pathname.startsWith("/sindico")')

# Update useEffect
fetch_data_logic = """
    fetchHeaderData()
    fetchNotifications()

    // Polling a cada 15s para buscar novas notificações
    const interval = setInterval(fetchNotifications, 15000)
    return () => clearInterval(interval)
"""
content = content.replace('fetchHeaderData()\n  }, [router])', fetch_data_logic + '  }, [router])')


# Update JSX
bell_jsx = """
             {/* SININHO COM NOTIFICAÇÕES EM TEMPO REAL */}
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative text-slate-600 hover:text-slate-900">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
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
                      {unreadCount > 0 && (
                        <Badge className="bg-emerald-100 text-emerald-800 text-[10px] font-semibold border-none px-1.5">
                          {unreadCount} nova{unreadCount > 1 ? "s" : ""}
                        </Badge>
                      )}
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
                        <span>Nenhuma notificação por enquanto.</span>
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => handleNotificationClick(n)}
                          className={`p-3 text-xs cursor-pointer transition-colors flex gap-2.5 items-start ${
                            n.read ? "bg-white hover:bg-slate-50 text-slate-600" : "bg-emerald-50/40 hover:bg-emerald-50/70 text-slate-900"
                          }`}
                        >
                          <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.read ? "bg-transparent" : "bg-emerald-500"}`} />
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-bold text-slate-900">{n.title}</span>
                              <span className="text-[9px] text-slate-400 flex items-center gap-0.5 shrink-0">
                                <Clock className="h-2.5 w-2.5" />
                                {formatDataNotificacao(n.createdAt)}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">{n.message}</p>
                            {n.protocol && (
                              <span className="inline-block text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-100/60 px-1.5 py-0.5 rounded mt-0.5">
                                #{n.protocol}
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
"""

content = content.replace('<NotificationBell />', bell_jsx)

with open("frontend/app/sindico/(private)/layout.tsx", "w") as f:
    f.write(content)

