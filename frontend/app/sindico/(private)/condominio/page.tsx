"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building2, AlertCircle, Clock, CheckCircle2, Bell, BellOff, Loader2 } from "lucide-react"

interface CondominioSindico {
  id: number
  name: string
  urgentOccurrences: number
  openOccurrences: number
  resolvedThisMonth: number
  focusModeEnabled: boolean
}

export default function SindicoDashboard() {
  const router = useRouter()
  const [condominios, setCondominios] = useState<CondominioSindico[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isTogglingGlobal, setIsTogglingGlobal] = useState(false)

  const getToken = () => typeof window !== "undefined" ? localStorage.getItem("condoflow_token") : ""

  const fetchCondominios = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("http://localhost:8080/api/v1/condominiums/me", {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      if (response.ok) {
        const data = await response.json()
        setCondominios(data)
      }
    } catch (error) {
      console.error("Erro ao buscar condomínios do síndico:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCondominios()
  }, [])

  const modoFocoGlobal = condominios.length > 0 && condominios.every((c) => c.focusModeEnabled)

  const handleToggleGlobal = async (checked: boolean) => {
    setIsTogglingGlobal(true)
    try {
      const response = await fetch("http://localhost:8080/api/v1/condominiums/focus-mode", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({ enabled: checked })
      })
      if (response.ok) {
        setCondominios((prev) => prev.map((c) => ({ ...c, focusModeEnabled: checked })))
      }
    } catch (error) {
      console.error("Erro ao atualizar modo foco global:", error)
    } finally {
      setIsTogglingGlobal(false)
    }
  }

  const urgentesCondominios = condominios.filter((c) => c.urgentOccurrences > 0)

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
      {/* Header com Modo Foco Global */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meus Condomínios</h1>
          <p className="text-muted-foreground">
            {isLoading
              ? "Carregando..."
              : `Bem-vindo de volta. Você tem ${condominios.length} unidades sob sua gestão.`}
          </p>
        </div>

        <div className="flex items-center space-x-4 bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex flex-col items-end">
            <Label htmlFor="modo-foco" className="font-bold flex items-center gap-2">
              {modoFocoGlobal ? <BellOff className="h-4 w-4 text-orange-500" /> : <Bell className="h-4 w-4 text-blue-500" />}
              Modo Foco Global
            </Label>
            <span className="text-xs text-muted-foreground text-right">
              {modoFocoGlobal ? "Apenas emergências" : "Todas as notificações"}
            </span>
          </div>
          {isTogglingGlobal ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <Switch
              id="modo-foco"
              checked={modoFocoGlobal}
              onCheckedChange={handleToggleGlobal}
              disabled={condominios.length === 0}
            />
          )}
        </div>
      </div>

      <Tabs defaultValue="todos" className="w-full">
        <TabsList className="grid w-full max-w-[400px] grid-cols-2">
          <TabsTrigger value="todos">Todos os Prédios</TabsTrigger>
          <TabsTrigger value="urgentes">Urgências Críticas</TabsTrigger>
        </TabsList>

        <TabsContent value="todos" className="mt-6">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Carregando condomínios...</p>
          ) : condominios.length === 0 ? (
            <p className="text-sm text-muted-foreground">Você ainda não administra nenhum condomínio.</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {condominios.map((predio) => (
                <Card 
                  key={predio.id} 
                  className="hover:shadow-md transition-shadow cursor-pointer border-t-4 border-t-emerald-600"
                  onClick={() => router.push(`/sindico/condominio/${predio.id}`)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                      {predio.urgentOccurrences > 0 && (
                        <Badge variant="destructive" className="animate-pulse">
                          {predio.urgentOccurrences} Urgências
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl mt-2">{predio.name}</CardTitle>
                  </CardHeader>

                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="flex flex-col items-center p-3 bg-slate-100 rounded-md text-center">
                        <Clock className="h-4 w-4 mb-1 text-blue-600" />
                        <span className="text-xl font-bold">{predio.openOccurrences}</span>
                        <span className="text-[10px] uppercase text-muted-foreground font-semibold">Abertas</span>
                      </div>
                      <div className="flex flex-col items-center p-3 bg-slate-100 rounded-md text-center">
                        <CheckCircle2 className="h-4 w-4 mb-1 text-green-600" />
                        <span className="text-xl font-bold">{predio.resolvedThisMonth}</span>
                        <span className="text-[10px] uppercase text-muted-foreground font-semibold">Mês Atual</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="urgentes" className="mt-6">
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <AlertCircle className="h-5 w-5" />
                Atenção Prioritária
              </CardTitle>
              <CardDescription className="text-red-600">
                Estas ocorrências exigem sua atenção imediata em todos os condomínios.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {urgentesCondominios.length === 0 ? (
                <p className="text-sm text-red-800">Nenhuma urgência no momento. 🎉</p>
              ) : (
                urgentesCondominios.map((c) => (
                  <div 
                    key={c.id} 
                    className="flex items-center justify-between bg-white border border-red-200 rounded-md p-3 cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => router.push(`/sindico/condominio/${c.id}`)}
                  >
                    <span className="font-medium text-slate-900">{c.name}</span>
                    <Badge variant="destructive">{c.urgentOccurrences} urgências</Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}