"use client"

import React, { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
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
  Send, Camera, Loader2, ArrowLeft
} from "lucide-react"

interface CondominioDetalhesProps {
  params: Promise<{ id: string }>
}

export default function CondominioDetalhes({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  // Desembrulhando params para compatibilidade com Next.js 16+
  const { id } = use(params)
  
  const [condominioInfo, setCondominioInfo] = useState<any>(null)
  const [ocorrencias, setOcorrencias] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [busca, setBusca] = useState("")
  const [abaAtiva, setAbaAtiva] = useState("todas")

  const [selectedOcorrencia, setSelectedOcorrencia] = useState<any>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [respostaOficial, setRespostaOficial] = useState("")
  const [novoStatus, setNovoStatus] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const getToken = () => (typeof window !== "undefined" ? localStorage.getItem("condoflow_token") : "")

  // Carregar dados do condomínio e ocorrências reais da API
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        // Busca detalhes do condomínio selecionado
        const resCondo = await fetch(`http://localhost:8080/api/v1/condominiums/${id}`, {
          headers: { Authorization: `Bearer ${getToken()}` }
        })
        if (resCondo.ok) {
          const condoData = await resCondo.json()
          setCondominioInfo(condoData)
        }

        // Busca as ocorrências vinculadas a este condomínio
        const resOco = await fetch(`http://localhost:8080/api/v1/occurrences/condominium/${id}`, {
          headers: { Authorization: `Bearer ${getToken()}` }
        })
        if (resOco.ok) {
          const ocoData = await resOco.json()
          setOcorrencias(ocoData)
        }
      } catch (error) {
        console.error("Erro ao carregar dados do painel do síndico:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchData()
    }
  }, [id])

  const handleOpenResponder = (oc: any) => {
    setSelectedOcorrencia(oc)
    setNovoStatus(oc.status)
    setRespostaOficial(oc.response || "")
    setIsSheetOpen(true)
  }

  const handleSalvarOcorrencia = async () => {
    if (!selectedOcorrencia) return
    setIsSubmitting(true)

    try {
      const response = await fetch(`http://localhost:8080/api/v1/occurrences/${selectedOcorrencia.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          status: novoStatus,
          response: respostaOficial
        })
      })

      if (response.ok) {
        // Atualiza a lista localmente
        setOcorrencias(prev => prev.map(o => o.id === selectedOcorrencia.id ? { ...o, status: novoStatus, response: respostaOficial } : o))
        setIsSheetOpen(false)
      }
    } catch (error) {
      console.error("Erro ao atualizar ocorrência:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Filtragem local baseada na barra de busca
  const ocorrenciasFiltradas = ocorrencias.filter(oc => {
    const matchBusca = oc.title?.toLowerCase().includes(busca.toLowerCase()) ||
      oc.protocol?.toLowerCase().includes(busca.toLowerCase()) ||
      String(oc.id).includes(busca)
    
    if (!matchBusca) return false;
    if (abaAtiva === "abertas") return oc.status === "OPEN";
    if (abaAtiva === "emandamento") return oc.status === "IN_PROGRESS";
    return true;
  })

  const qtdAbertas = ocorrencias.filter(o => o.status === "OPEN").length
  const qtdEmAndamento = ocorrencias.filter(o => o.status === "IN_PROGRESS").length
  const qtdConcluidas = ocorrencias.filter(o => o.status === "RESOLVED" || o.status === "CLOSED").length

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <Loader2 className="animate-spin text-emerald-600" size={32} />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => router.push("/sindico/condominio")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {condominioInfo?.name || "Gestão do Condomínio"}
            </h1>
            <p className="text-muted-foreground text-xs">
              CNPJ: <span className="font-mono">{condominioInfo?.cnpj || "N/D"}</span> • Endereço: {condominioInfo?.address || "N/D"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">Relatórios</Button>
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">Comunicado Geral</Button>
        </div>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-sm border-slate-200">
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Abertas</p>
              <h3 className="text-2xl font-bold">{qtdAbertas}</h3>
            </div>
            <Clock className="text-blue-500 h-8 w-8 opacity-20" />
          </CardContent>
        </Card>
        <Card className="border-blue-100 shadow-sm">
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 font-bold">Em Andamento</p>
              <h3 className="text-2xl font-bold text-blue-700">{qtdEmAndamento}</h3>
            </div>
            <Loader2 className="text-blue-500 h-8 w-8 opacity-20" />
          </CardContent>
        </Card>
        <Card className="shadow-sm border-slate-200">
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 font-bold">Concluídas</p>
              <h3 className="text-2xl font-bold text-green-700">{qtdConcluidas}</h3>
            </div>
            <CheckCircle className="text-green-500 h-8 w-8 opacity-20" />
          </CardContent>
        </Card>
      </div>

      {/* Barra de Pesquisa */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por título ou protocolo..." 
            className="pl-10 bg-white" 
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Abas e Lista de Ocorrências */}
      <Tabs value={abaAtiva} onValueChange={setAbaAtiva}>
        <TabsList className="bg-slate-100">
          <TabsTrigger value="todas">Todas ({ocorrencias.length})</TabsTrigger>
          <TabsTrigger value="abertas">Abertas ({qtdAbertas})</TabsTrigger>
          <TabsTrigger value="emandamento">Em Andamento ({qtdEmAndamento})</TabsTrigger>
        </TabsList>

        {["todas", "abertas", "emandamento"].map(aba => (
          <TabsContent key={aba} value={aba} className="mt-4 space-y-4">
            {ocorrenciasFiltradas.length > 0 ? (
              ocorrenciasFiltradas.map((oc) => (
                <Card key={oc.id} className="hover:shadow-md transition-all border-l-4 border-l-slate-300">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-slate-100 p-2.5 rounded-full">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900">{oc.title}</h4>
                          <Badge variant="outline" className="text-[10px] uppercase font-bold">{oc.category}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground font-medium mt-0.5">
                          Por: {oc.authorName} • ID: <span className="font-mono">{oc.protocol}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                       <Badge className={oc.status === 'OPEN' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}>
                        {(oc.status || "OPEN").replace("_", " ")}
                       </Badge>
                       <Button variant="ghost" size="icon" onClick={() => handleOpenResponder(oc)}>
                          <MessageCircle className="h-5 w-5 text-slate-400 hover:text-emerald-600" />
                       </Button>
                       <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-5 w-5 text-slate-400" />
                       </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground border rounded-xl bg-white">
                <p>Nenhuma ocorrência encontrada para este condomínio.</p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Sheet / Modal Lateral de Gestão de Ocorrência */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Gerir Ocorrência</SheetTitle>
            <SheetDescription>
              Protocolo: <span className="font-mono font-bold text-emerald-600">{selectedOcorrencia?.protocol || selectedOcorrencia?.id}</span>
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 py-6">
            <div className="space-y-2">
              <Label>Alterar Status</Label>
              <Select value={novoStatus} onValueChange={setNovoStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OPEN">Aberto</SelectItem>
                  <SelectItem value="IN_PROGRESS">Em Andamento</SelectItem>
                  <SelectItem value="RESOLVED">Resolvido</SelectItem>
                  <SelectItem value="CLOSED">Fechado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Resposta Oficial</Label>
              <Textarea 
                placeholder="Informe ao morador as providências..." 
                className="min-h-[120px]"
                value={respostaOficial}
                onChange={(e) => setRespostaOficial(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Anexar Foto</Label>
              <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-2 hover:bg-slate-50 cursor-pointer border-slate-200">
                <Camera className="h-6 w-6 text-slate-400" />
                <span className="text-xs text-slate-500 font-medium">Foto de conclusão</span>
              </div>
            </div>
          </div>

          <SheetFooter className="flex-col sm:flex-row gap-3">
            <Button variant="outline" className="w-full" onClick={() => setIsSheetOpen(false)}>Cancelar</Button>
            <Button className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700" onClick={handleSalvarOcorrencia} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              <Send className="h-4 w-4" /> Salvar
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}