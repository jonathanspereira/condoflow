"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2, Users, Building2, Truck } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

export default function NovoAcessoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [type, setType] = useState("VISITOR")
  const [personName, setPersonName] = useState("")
  const [personPhone, setPersonPhone] = useState("")
  const [authorizedDate, setAuthorizedDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [company, setCompany] = useState("")
  const [service, setService] = useState("")
  const [observation, setObservation] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const token = localStorage.getItem("condoflow_token")
    if (!token) {
      router.push("/morador/login")
      return
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/access`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          type,
          personName,
          personPhone,
          authorizedDate,
          startTime: startTime.length === 5 ? `${startTime}:00` : startTime,
          endTime: endTime.length === 5 ? `${endTime}:00` : endTime,
          company,
          service,
          observation
        })
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || "Erro ao criar autorização")
      }

      toast.success("Autorização criada com sucesso!")
      router.push("/morador/acessos")

    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 md:p-8 pb-24 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/morador/acessos")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Nova Autorização</h1>
          <p className="text-sm text-slate-500 mt-1">Gere um convite para liberar acesso à sua unidade.</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-3">
              <Label>Tipo de Acesso</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setType("VISITOR")}
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all ${
                    type === "VISITOR" ? "border-primary bg-primary/5 text-primary" : "border-slate-100 hover:border-slate-200 text-slate-500"
                  }`}
                >
                  <Users className="h-6 w-6" />
                  <span className="font-semibold text-sm">Visitante</span>
                </button>

                <button
                  type="button"
                  onClick={() => setType("SERVICE_PROVIDER")}
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all ${
                    type === "SERVICE_PROVIDER" ? "border-primary bg-primary/5 text-primary" : "border-slate-100 hover:border-slate-200 text-slate-500"
                  }`}
                >
                  <Building2 className="h-6 w-6" />
                  <span className="font-semibold text-sm">Prestador</span>
                </button>

                <button
                  type="button"
                  onClick={() => setType("DELIVERY")}
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all ${
                    type === "DELIVERY" ? "border-primary bg-primary/5 text-primary" : "border-slate-100 hover:border-slate-200 text-slate-500"
                  }`}
                >
                  <Truck className="h-6 w-6" />
                  <span className="font-semibold text-sm">Entregador</span>
                </button>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="grid gap-2">
                <Label htmlFor="personName">Nome completo da pessoa</Label>
                <Input 
                  id="personName" 
                  required 
                  value={personName} 
                  onChange={(e) => setPersonName(e.target.value)} 
                  placeholder="Ex: João da Silva" 
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="personPhone">Telefone (opcional)</Label>
                <Input 
                  id="personPhone" 
                  value={personPhone} 
                  onChange={(e) => setPersonPhone(e.target.value)} 
                  placeholder="(00) 00000-0000" 
                />
              </div>

              {type !== "VISITOR" && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="company">Empresa (opcional)</Label>
                    <Input 
                      id="company" 
                      value={company} 
                      onChange={(e) => setCompany(e.target.value)} 
                      placeholder="Ex: Vivo / Consertos LTDA" 
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="service">Serviço/Entrega (opcional)</Label>
                    <Input 
                      id="service" 
                      value={service} 
                      onChange={(e) => setService(e.target.value)} 
                      placeholder="Ex: Instalação de Internet" 
                    />
                  </div>
                </>
              )}
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="grid gap-2">
                <Label htmlFor="authorizedDate">Data Autorizada</Label>
                <Input 
                  id="authorizedDate" 
                  type="date" 
                  required 
                  value={authorizedDate} 
                  onChange={(e) => setAuthorizedDate(e.target.value)} 
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="startTime">Horário Inicial</Label>
                  <Input 
                    id="startTime" 
                    type="time" 
                    required 
                    value={startTime} 
                    onChange={(e) => setStartTime(e.target.value)} 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endTime">Horário Final</Label>
                  <Input 
                    id="endTime" 
                    type="time" 
                    required 
                    value={endTime} 
                    onChange={(e) => setEndTime(e.target.value)} 
                  />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="observation">Observações para Portaria (opcional)</Label>
                <Textarea 
                  id="observation" 
                  value={observation} 
                  onChange={(e) => setObservation(e.target.value)} 
                  placeholder="Ex: Autorizado subir apenas o ajudante." 
                />
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <Button type="button" variant="outline" className="flex-1" onClick={() => router.push("/morador/acessos")} disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" className="flex-1 bg-primary" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Gerar Convite"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
