"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Package, Clock, CheckCircle2, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { QRCodeSVG } from "qrcode.react"

interface Parcel {
  id: number
  description: string
  status: string
  trackingCode?: string
  deliveryCode: string
  receivedAt: string
  deliveredAt: string | null
  receivedByName: string
  deliveredByName: string | null
}

export default function MinhaEncomendaPage() {
  const params = useParams()
  const router = useRouter()
  const [parcel, setParcel] = useState<Parcel | null>(null)
  const [loading, setLoading] = useState(true)
  const [batchCount, setBatchCount] = useState(1)

  useEffect(() => {
    const fetchParcel = async () => {
      const token = localStorage.getItem("condoflow_token")
      if (!token) return router.push("/morador/login")

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/parcels/me?size=100`, {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (!res.ok) throw new Error("Erro ao carregar encomenda")
        const data = await res.json()
        const found = data.content.find((p: Parcel) => p.id === Number(params.id))
        
        if (!found) throw new Error("Encomenda não encontrada")
        setParcel(found)
        
        // Count how many pending parcels share this deliveryCode
        const relatedParcels = data.content.filter((p: Parcel) => 
          p.deliveryCode === found.deliveryCode && p.status === "PENDING_PICKUP"
        )
        setBatchCount(relatedParcels.length)
        
      } catch (error) {
        toast.error("Não foi possível carregar os detalhes da encomenda.")
        router.push("/morador/minhas-encomendas")
      } finally {
        setLoading(false)
      }
    }

    fetchParcel()
  }, [params.id, router])

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString("pt-BR") + " às " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
  }

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!parcel) return null

  const isPending = parcel.status === "PENDING_PICKUP"

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Detalhes da Encomenda</h1>
          <p className="text-sm text-slate-500 mt-1">Apresente o código na portaria para retirar.</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Package className="h-6 w-6 text-slate-400" />
                {parcel.description}
              </h2>
              {parcel.trackingCode && (
                <p className="text-sm text-slate-500 font-mono">
                  Rastreio: {parcel.trackingCode}
                </p>
              )}
            </div>
            {isPending ? (
              <Badge className="bg-amber-100 text-amber-800 border-amber-200">Aguardando Retirada</Badge>
            ) : (
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Entregue</Badge>
            )}
          </div>

          <div className="mt-8 grid gap-4 text-sm bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-400" />
              <span className="text-slate-500">Recebido em:</span>
              <span className="font-medium text-slate-900">{formatDate(parcel.receivedAt)}</span>
              <span className="text-slate-400 text-xs ml-auto">por {parcel.receivedByName}</span>
            </div>
            
            {parcel.deliveredAt && (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span className="text-slate-500">Entregue em:</span>
                <span className="font-medium text-slate-900">{formatDate(parcel.deliveredAt)}</span>
                <span className="text-slate-400 text-xs ml-auto">por {parcel.deliveredByName}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {isPending && (
        <Card className="border-primary/20 shadow-md bg-white overflow-hidden">
          <div className="bg-primary/5 p-4 text-center border-b border-primary/10">
            <h3 className="font-semibold text-primary flex items-center justify-center gap-2">
              <ShieldAlert className="h-5 w-5" />
              Código de Liberação
            </h3>
            {batchCount > 1 ? (
              <p className="text-sm font-medium text-amber-600 mt-2 bg-amber-50 py-1.5 px-3 rounded-full inline-block border border-amber-200">
                Este QR Code libera {batchCount} pacotes que estão aguardando retirada!
              </p>
            ) : (
              <p className="text-xs text-slate-500 mt-1">Apresente este código para o porteiro.</p>
            )}
          </div>
          <CardContent className="p-8 flex flex-col items-center justify-center">
            <div className="bg-white p-4 rounded-xl border-2 border-slate-100 shadow-sm inline-block">
              <QRCodeSVG 
                value={parcel.deliveryCode} 
                size={220}
                level="M"
                includeMargin={true}
                fgColor="#0f172a"
              />
            </div>
            <p className="mt-6 text-xs text-slate-400 font-mono tracking-widest break-all px-4 text-center">
              {parcel.deliveryCode}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
