"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Search, Filter, MoreHorizontal, 
  MessageCircle, User, Shield, 
  AlertTriangle, CheckCircle, Clock 
} from "lucide-react"

// Exemplo de dados vindos do banco
const ocorrenciasMock = [
  {
    id: "OC-001",
    titulo: "Infiltração no teto da Academia",
    categoria: "Manutenção",
    status: "ABERTO",
    urgente: true,
    autor: "João (Apto 12)",
    anonimo: false,
    data: "Há 2 horas"
  },
  {
    id: "OC-002",
    titulo: "Barulho excessivo após às 22h",
    categoria: "Convivência",
    status: "EM_EXECUCAO",
    urgente: false,
    autor: "Anônimo",
    anonimo: true,
    data: "Há 5 horas"
  }
]

export default function CondominioDetalhes({ params }: { params: { id: string } }) {
  return (
    <div className="p-6 space-y-6">
      {/* Header com Navegação */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Solar das Palmeiras</h1>
          <p className="text-muted-foreground text-sm">Gestão de Ocorrências</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Relatórios</Button>
          <Button>Comunicado Geral</Button>
        </div>
      </div>

      {/* Stats Rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Abertas</p>
              <h3 className="text-2xl font-bold">08</h3>
            </div>
            <Clock className="text-blue-500 h-8 w-8 opacity-20" />
          </CardContent>
        </Card>
        <Card className="border-red-100">
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Urgentes</p>
              <h3 className="text-2xl font-bold text-red-700">03</h3>
            </div>
            <AlertTriangle className="text-red-500 h-8 w-8 opacity-20" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Concluídas (Mês)</p>
              <h3 className="text-2xl font-bold text-green-700">24</h3>
            </div>
            <CheckCircle className="text-green-500 h-8 w-8 opacity-20" />
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Busca */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por título ou protocolo..." className="pl-10" />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Lista de Ocorrências */}
      <Tabs defaultValue="todas">
        <TabsList>
          <TabsTrigger value="todas">Todas</TabsTrigger>
          <TabsTrigger value="urgentes">Urgentes</TabsTrigger>
          <TabsTrigger value="anonimas">Anônimas</TabsTrigger>
        </TabsList>

        <TabsContent value="todas" className="mt-4 space-y-4">
          {ocorrenciasMock.map((oc) => (
            <Card key={oc.id} className={`hover:border-slate-400 transition-all ${oc.urgente ? 'border-l-4 border-l-red-500' : ''}`}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-slate-100 p-2 rounded-full">
                    {oc.anonimo ? <Shield className="h-5 w-5 text-slate-600" /> : <User className="h-5 w-5 text-blue-600" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900">{oc.titulo}</h4>
                      <Badge variant="outline" className="text-[10px]">{oc.categoria}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Por: {oc.autor} • {oc.data} • ID: {oc.id}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                   <Badge className={oc.status === 'ABERTO' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}>
                    {oc.status.replace("_", " ")}
                   </Badge>
                   <Button variant="ghost" size="icon">
                      <MessageCircle className="h-5 w-5 text-slate-400" />
                   </Button>
                   <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-5 w-5 text-slate-400" />
                   </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}