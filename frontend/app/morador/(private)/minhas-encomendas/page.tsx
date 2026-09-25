"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Package, Clock, CheckCircle2, ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

interface Parcel {
  id: number
  description: string
  status: string
  receivedAt: string
  deliveredAt: string | null
}

export default function MinhasEncomendasPage() {
  const [parcels, setParcels] = useState<Parcel[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [periodFilter, setPeriodFilter] = useState("ALL")
  const router = useRouter()

  useEffect(() => {
    const fetchParcels = async () => {
      setLoading(true)
      const token = localStorage.getItem("condoflow_token")
      if (!token) return router.push("/morador/login")

      try {
        let url = `${process.env.NEXT_PUBLIC_API_URL}/parcels/me?size=50`
        if (statusFilter !== "ALL") {
          url += `&status=${statusFilter}`
        }

        if (periodFilter !== "ALL") {
          const now = new Date()
          if (periodFilter === "7days") {
            now.setDate(now.getDate() - 7)
            url += `&startDate=${now.toISOString()}`
          } else if (periodFilter === "30days") {
            now.setDate(now.getDate() - 30)
            url += `&startDate=${now.toISOString()}`
          }
        }

        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (!res.ok) throw new Error("Erro ao carregar encomendas")
        const data = await res.json()
        setParcels(data.content || [])
      } catch (error) {
        toast.error("Não foi possível carregar as encomendas.")
      } finally {
        setLoading(false)
      }
    }

    fetchParcels()
  }, [router, statusFilter, periodFilter])

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString("pt-BR") + " às " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
  }

  const getStatusBadge = (status: string) => {
    if (status === "PENDING_PICKUP") {
      return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Aguardando Retirada</Badge>
    }
    if (status === "DELIVERED") {
      return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Entregue</Badge>
    }
    return <Badge variant="outline">{status}</Badge>
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Minhas Encomendas</h1>
          <p className="text-sm text-slate-500 mt-1">Acompanhe as encomendas recebidas na portaria.</p>
        </div>
        <div className="flex items-center gap-2">
          <select 
            className="text-sm border-slate-200 rounded-md py-1.5 px-3 bg-white border"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">Status: Todos</option>
            <option value="PENDING_PICKUP">Aguardando Retirada</option>
            <option value="DELIVERED">Entregue</option>
          </select>
          <select 
            className="text-sm border-slate-200 rounded-md py-1.5 px-3 bg-white border"
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value)}
          >
            <option value="ALL">Período: Todos</option>
            <option value="7days">Últimos 7 dias</option>
            <option value="30days">Últimos 30 dias</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : parcels.length === 0 ? (
        <Card className="border-dashed shadow-none">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center text-slate-500">
            <Package className="h-12 w-12 mb-4 opacity-20" />
            <p>Você não tem encomendas registradas.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {parcels.map((parcel) => (
            <Card 
              key={parcel.id}
              className={`hover:border-primary/50 transition-colors cursor-pointer ${
                parcel.status === "PENDING_PICKUP" ? "border-primary/30 shadow-sm bg-primary/5" : ""
              }`}
              onClick={() => router.push(`/morador/minhas-encomendas/${parcel.id}`)}
            >
              <CardContent className="p-4 md:p-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${parcel.status === "PENDING_PICKUP" ? "bg-primary text-white" : "bg-slate-100 text-slate-400"}`}>
                    <Package className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-slate-900">{parcel.description}</h3>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      {getStatusBadge(parcel.status)}
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Chegou: {formatDate(parcel.receivedAt)}
                      </span>
                      {parcel.deliveredAt && (
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                          Retirado: {formatDate(parcel.deliveredAt)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="shrink-0">
                  <ChevronRight className="h-5 w-5 text-slate-400" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
