"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2, QrCode, CheckSquare, Square, PackageCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"
import { Scanner } from "@yudiel/react-qr-scanner"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface Parcel {
  id: number;
  description: string;
  recipientName: string;
  receivedAt: string;
}

export default function LeitorEncomendasPage() {
  const router = useRouter()
  const [scanResult, setScanResult] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDelivering, setIsDelivering] = useState(false)
  const [parcels, setParcels] = useState<Parcel[]>([])
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  const onScanSuccess = async (decodedText: string) => {
    if (scanResult === decodedText || isLoading) return
    setScanResult(decodedText)
    await fetchParcels(decodedText)
  }

  const fetchParcels = async (deliveryCode: string) => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("condoflow_token")
      const condoId = localStorage.getItem("condoflow_selected_condo_id") || "1"

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/parcels/delivery-code/${deliveryCode}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Tenant-ID": condoId,
        },
      })

      if (!res.ok) {
        throw new Error("Código de liberação inválido ou não encontrado.")
      }

      const data: Parcel[] = await res.json()
      
      if (data.length === 0) {
        toast.error("Nenhuma encomenda pendente encontrada para este código.")
        setScanResult(null)
        return
      }

      setParcels(data)
      // Seleciona todos por padrão
      setSelectedIds(data.map(p => p.id))
      toast.success(`${data.length} encomenda(s) encontrada(s)!`)

    } catch (error: any) {
      toast.error(error.message)
      setScanResult(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleParcel = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    )
  }

  const processDelivery = async () => {
    if (selectedIds.length === 0) {
      toast.error("Selecione pelo menos uma encomenda para entregar.")
      return
    }

    setIsDelivering(true)
    try {
      const token = localStorage.getItem("condoflow_token")
      const condoId = localStorage.getItem("condoflow_selected_condo_id") || "1"

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/parcels/deliver-batch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "X-Tenant-ID": condoId,
        },
        body: JSON.stringify({ parcelIds: selectedIds }),
      })

      if (!res.ok) {
        throw new Error("Erro ao confirmar entrega.")
      }

      toast.success(`${selectedIds.length} encomenda(s) entregue(s) com sucesso!`)
      
      setTimeout(() => {
        router.push("/portaria/encomendas")
      }, 2000)

    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsDelivering(false)
    }
  }

  const formatarData = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("pt-BR")
    } catch {
      return iso
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/portaria/encomendas")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Leitor de Liberação</h1>
          <p className="text-sm text-slate-500 mt-1">Valide e entregue pacotes.</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          {!scanResult ? (
            <div className="w-full overflow-hidden rounded-lg bg-slate-900">
              <Scanner 
                onScan={(result) => onScanSuccess(result[0].rawValue)} 
                onError={(error) => console.log(error?.message)} 
              />
              <p className="text-center text-xs text-slate-400 mt-2 pb-2">
                Aponte a câmera para a tela do celular do morador.
              </p>
            </div>
          ) : isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
              <p className="font-semibold text-slate-700">Buscando encomendas...</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col items-center justify-center space-y-2 mt-4">
                <QrCode className="h-10 w-10 text-emerald-500" />
                <p className="font-semibold text-emerald-700">Código lido com sucesso!</p>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-slate-800">Confirme os pacotes para entrega:</h3>
                <div className="space-y-3">
                  {parcels.map((parcel) => (
                    <div 
                      key={parcel.id} 
                      className={`flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3 md:p-4 cursor-pointer transition-colors ${selectedIds.includes(parcel.id) ? 'bg-emerald-50 border-emerald-200' : 'bg-white'}`}
                      onClick={() => handleToggleParcel(parcel.id)}
                    >
                      <Checkbox 
                        checked={selectedIds.includes(parcel.id)}
                        onCheckedChange={() => handleToggleParcel(parcel.id)}
                        className="mt-1 shrink-0"
                      />
                      <div className="space-y-1 leading-none flex-1 min-w-0">
                        <Label className="font-semibold text-sm cursor-pointer truncate block">{parcel.description}</Label>
                        <p className="text-xs text-slate-500 break-words">
                          Para: {parcel.recipientName} <br className="sm:hidden" /><span className="hidden sm:inline">•</span> Recebido em: {formatarData(parcel.receivedAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 flex flex-col sm:flex-row gap-3">
                  <Button variant="outline" className="w-full sm:w-1/2" onClick={() => setScanResult(null)} disabled={isDelivering}>
                    Cancelar
                  </Button>
                  <Button 
                    className="w-full sm:w-1/2 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white" 
                    onClick={processDelivery} 
                    disabled={isDelivering || selectedIds.length === 0}
                  >
                    {isDelivering ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <PackageCheck className="h-4 w-4" />
                    )}
                    Entregar ({selectedIds.length})
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
