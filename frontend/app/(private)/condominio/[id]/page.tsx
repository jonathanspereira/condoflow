"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet"
import { 
  Search, Filter, MoreHorizontal, 
  MessageCircle, User, Shield, 
  AlertTriangle, CheckCircle, Clock,
  Send, Camera
} from "lucide-react"

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
  const [selectedOcorrencia, setSelectedOcorrencia] = useState<any>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const handleOpenResponder = (oc: any) => {
    setSelectedOcorrencia(oc)
    setIsSheetOpen(true)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header com Navegação */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Solar das Palmeiras</h1>
          <p className="text-muted-foreground text-sm tracking-tight">ID do Condomínio: {params.id}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">Relatórios</Button>
          <Button size="sm">Comunicado Geral</Button>
        </div>
      </div>

      {/* Stats Rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-sm">
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Abertas</p>
              <h3 className="text-2xl font-bold">08</h3>
            </div>
            <Clock className="text-blue-500 h-8 w-8 opacity-20" />
          </CardContent>
        </Card>
        <Card className="border-red-100 shadow-sm">
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600 font-bold">Urgentes</p>
              <h3 className="text-2xl font-bold text-red-700">03</h3>
            </div>
            <AlertTriangle className="text-red-500 h-8 w-8 opacity-20" />
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 font-bold">Concluídas (Mês)</p>
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
            <Card key={oc.id} className={`hover:shadow-md transition-all border-l-4 ${oc.urgente ? 'border-l-red-500' : 'border-l-transparent'}`}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-slate-100 p-2 rounded-full">
                    {oc.anonimo ? <Shield className="h-5 w-5 text-slate-600" /> : <User className="h-5 w-5 text-blue-600" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900">{oc.titulo}</h4>
                      <Badge variant="outline" className="text-[10px] uppercase font-bold">{oc.categoria}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground font-medium">
                      Por: {oc.autor} • {oc.data} • ID: <span className="font-mono">{oc.id}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                   <Badge className={oc.status === 'ABERTO' ? 'bg-amber-100 text-amber-700 hover:bg-amber-100' : 'bg-blue-100 text-blue-700 hover:bg-blue-100'}>
                    {oc.status.replace("_", " ")}
                   </Badge>
                   <Button variant="ghost" size="icon" onClick={() => handleOpenResponder(oc)}>
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

      {/* MODAL DE RESPOSTA (Issue #14) */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Gerir Ocorrência</SheetTitle>
            <SheetDescription>
              Protocolo: <span className="font-mono font-bold text-primary">{selectedOcorrencia?.id}</span>
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 py-6">
            <div className="space-y-2">
              <Label>Alterar Status</Label>
              <Select defaultValue={selectedOcorrencia?.status}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ABERTO">Aberto</SelectItem>
                  <SelectItem value="EM_ANALISE">Em Análise</SelectItem>
                  <SelectItem value="EM_EXECUCAO">Em Execução</SelectItem>
                  <SelectItem value="CONCLUIDO">Concluído</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Resposta Oficial</Label>
              <Textarea 
                placeholder="Informe ao morador as providências tomadas..." 
                className="min-h-[120px]"
              />
              <p className="text-[10px] text-muted-foreground italic">
                O morador poderá consultar esta resposta usando o número de protocolo.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Anexar Comprovativo</Label>
              <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-2 hover:bg-slate-50 cursor-pointer transition-colors border-slate-200">
                <Camera className="h-6 w-6 text-slate-400" />
                <span className="text-xs text-slate-500 font-medium">Anexar foto da conclusão</span>
              </div>
            </div>
          </div>

          <SheetFooter className="flex-col sm:flex-row gap-3">
            <Button variant="outline" className="w-full" onClick={() => setIsSheetOpen(false)}>
              Cancelar
            </Button>
            <Button className="w-full gap-2">
              <Send className="h-4 w-4" /> Enviar Resposta
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}