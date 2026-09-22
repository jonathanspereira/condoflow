"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Package, Plus, QrCode, Clock, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

interface Parcel {
  id: number
  description: string
  status: string
  recipientName: string
  unitName: string
  receivedAt: string
  deliveredAt: string | null
  receivedByName: string
  deliveredByName: string | null
}

export default function EncomendasPage() {
  const [parcels, setParcels] = useState<Parcel[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const fetchParcels = async () => {
    const token = localStorage.getItem("condoflow_token")
    const condoId = localStorage.getItem("condoflow_selected_condo_id") || "1"
    
    if (!token) {
      router.push("/sindico/login")
      return
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/parcels/condominium?size=100`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "X-Tenant-ID": condoId 
        }
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

  useEffect(() => {
    fetchParcels()
  }, [router])

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
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Gestão de Encomendas</h1>
          <p className="text-sm text-slate-500 mt-1">Controle de recebimento e entrega de pacotes.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => router.push("/portaria/encomendas/novo")} className="gap-2">
            <Plus className="h-4 w-4" />
            Receber Pacote
          </Button>
          <Button onClick={() => router.push("/portaria/encomendas/leitor")} variant="secondary" className="gap-2">
            <QrCode className="h-4 w-4" />
            Leitor de Liberação
          </Button>
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
            <p>Nenhuma encomenda registrada.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-medium">Pacote</th>
                  <th className="px-6 py-4 font-medium">Unidade/Destinatário</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Recebido em</th>
                  <th className="px-6 py-4 font-medium">Entregue em</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {parcels.map((parcel) => (
                  <tr key={parcel.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{parcel.description}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900">{parcel.unitName}</span>
                        <span className="text-xs text-slate-500">{parcel.recipientName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(parcel.status)}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col text-slate-600">
                        <span>{formatDate(parcel.receivedAt)}</span>
                        <span className="text-xs text-slate-400">por {parcel.receivedByName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {parcel.deliveredAt ? (
                        <div className="flex flex-col text-slate-600">
                          <span>{formatDate(parcel.deliveredAt)}</span>
                          <span className="text-xs text-slate-400">por {parcel.deliveredByName}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs italic">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
