"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Package, Loader2, Camera, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import Select from "react-select"
import { Scanner } from "@yudiel/react-qr-scanner"
import { Label } from "@/components/ui/label"

interface ParcelItem {
  recipientName: string;
  description: string;
  trackingCode: string;
}

export default function RegistrarEncomendaPage() {
  const router = useRouter()
  const [units, setUnits] = useState<any[]>([])
  const [loadingUnits, setLoadingUnits] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showScanner, setShowScanner] = useState(false)

  const [unitId, setUnitId] = useState<string>("")
  const [parcels, setParcels] = useState<ParcelItem[]>([])

  // Formulário do item atual
  const [recipientName, setRecipientName] = useState("")
  const [description, setDescription] = useState("")
  const [trackingCode, setTrackingCode] = useState("")

  useEffect(() => {
    const fetchUnits = async () => {
      const token = localStorage.getItem("condoflow_token")
      const condoId = localStorage.getItem("condoflow_selected_condo_id") || "1"

      if (!token) return

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/units/condominium/${condoId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          setUnits(data.map((u: any) => ({ 
            value: u.id.toString(), 
            label: `${u.unit} ${u.ownerName} ${u.rented && u.tenantName ? u.tenantName : ''}`,
            unit: u.unit,
            ownerName: u.ownerName,
            rented: u.rented,
            tenantName: u.tenantName
          })))
        }
      } catch (error) {
        toast.error("Erro ao carregar unidades")
      } finally {
        setLoadingUnits(false)
      }
    }
    fetchUnits()
  }, [])

  const handleAddItem = () => {
    if (!recipientName || !description || !trackingCode) {
      toast.error("Preencha todos os campos do pacote antes de adicionar.")
      return
    }

    setParcels([...parcels, { recipientName, description, trackingCode }])
    
    // Limpar campos para o próximo item
    setRecipientName("")
    setDescription("")
    setTrackingCode("")
  }

  const handleRemoveItem = (index: number) => {
    const newParcels = [...parcels]
    newParcels.splice(index, 1)
    setParcels(newParcels)
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!unitId) {
      toast.error("Selecione a unidade de destino.")
      return
    }

    if (parcels.length === 0) {
      toast.error("Adicione pelo menos um pacote à lista.")
      return
    }

    setIsSubmitting(true)
    try {
      const token = localStorage.getItem("condoflow_token")
      const condoId = localStorage.getItem("condoflow_selected_condo_id") || "1"

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/parcels/batch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "X-Tenant-ID": condoId,
        },
        body: JSON.stringify({
          unitId: parseInt(unitId),
          parcels: parcels,
        }),
      })

      if (!res.ok) throw new Error("Erro ao registrar encomendas")

      toast.success("Encomendas registradas com sucesso! E-mail enviado ao morador.")
      router.push("/portaria/encomendas")
    } catch (error) {
      toast.error("Erro ao registrar as encomendas. Tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatOptionLabel = (option: any) => (
    <div className="flex items-center gap-1">
      <span className="font-semibold text-slate-800">{option.unit}</span>
      <span className="text-slate-500 mx-1">-</span>
      <span className="text-slate-700">{option.ownerName}</span>
      {option.rented && option.tenantName && (
        <>
          <span className="text-slate-400 mx-1">*</span>
          <span className="text-emerald-600 font-medium">{option.tenantName}</span>
        </>
      )}
    </div>
  )

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/portaria/encomendas")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Registrar Encomendas</h1>
          <p className="text-sm text-slate-500 mt-1">Dê entrada em pacotes na portaria em lote.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Dados dos Pacotes
          </CardTitle>
          <CardDescription>O morador receberá apenas um e-mail consolidado com o QR Code de liberação.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            
            <div className="space-y-2">
              <Label>Unidade de Destino *</Label>
              <Select
                isLoading={loadingUnits}
                options={units}
                formatOptionLabel={formatOptionLabel}
                placeholder="Pesquisar unidade..."
                noOptionsMessage={() => "Nenhuma unidade encontrada"}
                onChange={(option: any) => setUnitId(option?.value || "")}
                value={units.find((u) => u.value === unitId) || null}
                className="text-sm"
              />
            </div>

            <div className="p-4 bg-slate-50 border rounded-lg space-y-4">
              <h3 className="text-sm font-semibold text-slate-700">Adicionar Pacote</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome no Pacote (Destinatário) *</Label>
                  <Input 
                    placeholder="Ex: João da Silva" 
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Descrição da Encomenda *</Label>
                  <Input 
                    placeholder="Ex: Caixa pequena da Amazon" 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Código de Rastreio *</Label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Ex: NL123456789BR" 
                    value={trackingCode}
                    onChange={(e) => setTrackingCode(e.target.value)}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon"
                    onClick={() => setShowScanner(!showScanner)}
                    title="Ler código de barras/QR"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {showScanner && (
                <div className="w-full overflow-hidden rounded-lg bg-slate-900 relative">
                  <Button 
                    type="button"
                    variant="secondary" 
                    size="sm" 
                    className="absolute top-2 right-2 z-10"
                    onClick={() => setShowScanner(false)}
                  >
                    Fechar Câmera
                  </Button>
                  <Scanner 
                    formats={["qr_code", "code_128", "code_39", "ean_13", "ean_8", "upc_a", "upc_e", "itf"]}
                    onScan={(result) => {
                      if (result && result.length > 0) {
                        setTrackingCode(result[0].rawValue)
                        setShowScanner(false)
                        toast.success("Código lido com sucesso!")
                      }
                    }} 
                    onError={(error) => console.log(error?.message)} 
                  />
                </div>
              )}

              <Button type="button" variant="secondary" onClick={handleAddItem} className="w-full gap-2">
                <Plus className="h-4 w-4" />
                Adicionar à Lista
              </Button>
            </div>

            {parcels.length > 0 && (
              <div className="space-y-3">
                <Label>Pacotes Adicionados ({parcels.length})</Label>
                <div className="space-y-2">
                  {parcels.map((p, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-md bg-white">
                      <div>
                        <p className="font-medium text-sm">{p.description}</p>
                        <p className="text-xs text-slate-500">Para: {p.recipientName} • Cód: {p.trackingCode}</p>
                      </div>
                      <Button type="button" variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleRemoveItem(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button type="submit" className="w-full mt-4" disabled={isSubmitting || parcels.length === 0 || !unitId}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Registrando...
                </>
              ) : (
                `Salvar ${parcels.length} Encomenda(s)`
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

