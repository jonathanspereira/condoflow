"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building2, AlertCircle, Clock, CheckCircle2, Bell, BellOff } from "lucide-react"

// Mock de dados (Simulando o que viria do Prisma)
const condominios = [
  {
    id: "1",
    nome: "Residencial Solar das Palmeiras",
    ocorrenciasUrgentes: 3,
    totalAberta: 12,
    ultimaAtualizacao: "10 min atrás",
    modoFocoAtivo: true,
  },
  {
    id: "2",
    nome: "Edifício Grand Tower",
    ocorrenciasUrgentes: 0,
    totalAberta: 5,
    ultimaAtualizacao: "2 horas atrás",
    modoFocoAtivo: false,
  },
  {
    id: "3",
    nome: "Condomínio Park Avenue",
    ocorrenciasUrgentes: 1,
    totalAberta: 8,
    ultimaAtualizacao: "Ontem",
    modoFocoAtivo: true,
  },
]

export default function SindicoDashboard() {
  const [modoFocoGlobal, setModoFocoGlobal] = useState(false)

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
      {/* Header com Modo Foco Global */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meus Condomínios</h1>
          <p className="text-muted-foreground">Bem-vindo de volta. Você tem {condominios.length} unidades sob sua gestão.</p>
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
          <Switch 
            id="modo-foco" 
            checked={modoFocoGlobal} 
            onCheckedChange={setModoFocoGlobal} 
          />
        </div>
      </div>

      <Tabs defaultValue="todos" className="w-full">
        <TabsList className="grid w-full max-w-[400px] grid-cols-2">
          <TabsTrigger value="todos">Todos os Prédios</TabsTrigger>
          <TabsTrigger value="urgentes">Urgências Críticas</TabsTrigger>
        </TabsList>

        <TabsContent value="todos" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {condominios.map((predio) => (
              <Card key={predio.id} className="hover:shadow-md transition-shadow cursor-pointer border-t-4 border-t-primary">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                    {predio.ocorrenciasUrgentes > 0 && (
                      <Badge variant="destructive" className="animate-pulse">
                        {predio.ocorrenciasUrgentes} Urgências
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl mt-2">{predio.nome}</CardTitle>
                  <CardDescription>Atualizado {predio.ultimaAtualizacao}</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="flex flex-col items-center p-3 bg-slate-100 rounded-md text-center">
                      <Clock className="h-4 w-4 mb-1 text-blue-600" />
                      <span className="text-xl font-bold">{predio.totalAberta}</span>
                      <span className="text-[10px] uppercase text-muted-foreground font-semibold">Abertas</span>
                    </div>
                    <div className="flex flex-col items-center p-3 bg-slate-100 rounded-md text-center">
                      <CheckCircle2 className="h-4 w-4 mb-1 text-green-600" />
                      <span className="text-xl font-bold">42</span>
                      <span className="text-[10px] uppercase text-muted-foreground font-semibold">Mês Atual</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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
             <CardContent>
               <p className="text-sm text-red-800 font-medium">Filtro ativo: Mostrando apenas problemas de Gás, Elevador e Segurança.</p>
               {/* Aqui entraria uma lista unificada de ocorrências filtradas */}
             </CardContent>
           </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}