"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Users, LogOut, CheckCircle, Clock, Search, QrCode } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

interface AccessAuth {
  id: number
  personName: string
  type: string
  status: string
  authorizedDate: string
  startTime: string
  endTime: string
  unitName: string
  residentName: string
  accessCode: string
}

export default function AcessosDashboardPage() {
  const router = useRouter()
  const [authorizations, setAuthorizations] = useState<AccessAuth[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchAuthorizations()
  }, [])

  const fetchAuthorizations = async () => {
    setLoading(true)
    const token = localStorage.getItem("condoflow_token")
    const condoId = localStorage.getItem("condoflow_selected_condo_id") || "1"
    
    if (!token) return router.push("/portaria/login")

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/access/condominium`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "X-Tenant-ID": condoId 
        }
      })

      if (!res.ok) throw new Error("Erro ao carregar autorizações")
      const data = await res.json()
      setAuthorizations(data || [])
    } catch (error) {
      toast.error("Não foi possível carregar as autorizações.")
    } finally {
      setLoading(false)
    }
  }

  const handleExit = async (accessCode: string) => {
    const token = localStorage.getItem("condoflow_token")
    const condoId = localStorage.getItem("condoflow_selected_condo_id") || "1"
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/access/register-exit/${accessCode}`, {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${token}`,
          "X-Tenant-ID": condoId 
        }
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || "Erro ao registrar saída")
      }

      toast.success("Saída registrada com sucesso!")
      fetchAuthorizations()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const insideCondo = authorizations.filter(a => a.status === "DENTRO_DO_CONDOMINIO")
  
  const today = new Date().toISOString().split('T')[0]
  const scheduledToday = authorizations.filter(a => 
    a.authorizedDate === today && 
    (a.status === "CADASTRO_CONCLUIDO" || a.status === "QR_CODE_GERADO")
  )

  const filteredInside = insideCondo.filter(a => 
    a.personName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (a.unitName && a.unitName.includes(searchTerm))
  )

  const formatDate = (isoDate: string) => {
    if (!isoDate) return ""
    const [year, month, day] = isoDate.split("-")
    return `${day}/${month}/${year}`
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Painel de Acessos</h1>
          <p className="text-sm text-slate-500 mt-1">Gerencie a entrada e saída de visitantes e prestadores.</p>
        </div>
        <Button 
          onClick={() => router.push("/portaria/acessos/leitor")} 
          className="gap-2 shrink-0 bg-emerald-600 hover:bg-emerald-700"
          size="lg"
        >
          <QrCode className="h-5 w-5" />
          Validar Acesso
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* DENTRO DO CONDOMÍNIO */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Dentro do Condomínio ({insideCondo.length})
            </h2>
          </div>

          <Input 
            placeholder="Buscar por nome ou unidade..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white"
          />

          {loading ? (
            <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div></div>
          ) : filteredInside.length === 0 ? (
            <Card className="border-dashed shadow-none bg-slate-50/50">
              <CardContent className="flex flex-col items-center justify-center p-8 text-center text-slate-500">
                <Users className="h-8 w-8 mb-2 opacity-20" />
                <p className="text-sm">Ninguém registrado no momento.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredInside.map(auth => (
                <Card key={auth.id} className="border-emerald-200 bg-emerald-50/30">
                  <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-slate-900">{auth.personName}</h3>
                      <p className="text-xs text-slate-500">Unidade: {auth.unitName} (Morador: {auth.residentName})</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-red-200 text-red-600 hover:bg-red-50 gap-2 shrink-0"
                      onClick={() => handleExit(auth.accessCode)}
                    >
                      <LogOut className="h-4 w-4" />
                      Registrar Saída
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* AGENDADOS PARA HOJE */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800">
              <Clock className="h-5 w-5 text-blue-500" />
              Esperados para Hoje ({scheduledToday.length})
            </h2>
          </div>

          {loading ? (
            <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div></div>
          ) : scheduledToday.length === 0 ? (
            <Card className="border-dashed shadow-none bg-slate-50/50">
              <CardContent className="flex flex-col items-center justify-center p-8 text-center text-slate-500">
                <Clock className="h-8 w-8 mb-2 opacity-20" />
                <p className="text-sm">Nenhum acesso pendente para hoje.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {scheduledToday.map(auth => (
                <Card key={auth.id} className="bg-white">
                  <CardContent className="p-4 flex items-center justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-slate-900">{auth.personName}</h3>
                      <p className="text-xs text-slate-500">Unidade: {auth.unitName} - Período: {auth.startTime} às {auth.endTime}</p>
                    </div>
                    <Badge variant="secondary" className="shrink-0">{auth.type}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
