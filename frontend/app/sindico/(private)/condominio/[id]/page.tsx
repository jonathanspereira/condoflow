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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { 
  Search, Filter, MoreHorizontal, 
  MessageCircle, User, Shield, 
  AlertTriangle, CheckCircle, Clock,
  Send, Camera, Loader2, ArrowLeft, Building, Paperclip
} from "lucide-react"
import { toast } from "sonner"
import { useRef } from "react"

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
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getToken = () => (typeof window !== "undefined" ? localStorage.getItem("condoflow_token") : "")

  // Carregar dados do condomínio e ocorrências reais da API
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        // Busca detalhes do condomínio selecionado
        const resCondo = await fetch(`http://localhost:8080/api/v1/condominiums/${id}`, {
          headers: { 
            Authorization: `Bearer ${getToken()}`,
            "X-Tenant-ID": id
          }
        })
        if (resCondo.ok) {
          const condoData = await resCondo.json()
          setCondominioInfo(condoData)
        }

        // Busca as ocorrências vinculadas a este condomínio
        const resOco = await fetch(`http://localhost:8080/api/v1/occurrences/condominium/${id}`, {
          headers: { 
            Authorization: `Bearer ${getToken()}`,
            "X-Tenant-ID": id
          }
        })
        if (resOco.ok) {
          const ocoData = await resOco.json()
          setOcorrencias(ocoData)
        }
      } catch (error) {
        console.error("Erro ao carregar dados do painel do síndico:", error)
        toast.error("Erro ao carregar dados do condomínio.")
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
      // 1. Atualizar o status e a mensagem em uma única chamada
      const response = await fetch(`http://localhost:8080/api/v1/occurrences/${selectedOcorrencia.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
          "X-Tenant-ID": id
        },
        body: JSON.stringify({
          status: novoStatus,
          response: respostaOficial.trim() || null
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        const msg = errorData?.message || "Não foi possível atualizar o status da ocorrência."
        toast.error(msg)
        setIsSubmitting(false)
        return
      }

      const updatedOcorrencia = await response.json()


      // Atualiza a lista localmente
      setOcorrencias(prev => prev.map(o => o.id === updatedOcorrencia.id ? updatedOcorrencia : o))
      setIsSheetOpen(false)
      toast.success("Ocorrência atualizada com sucesso!")
    } catch (error) {
      console.error("Erro ao atualizar ocorrência:", error)
      toast.error("Erro de conexão com o servidor.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUploadAttachment = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !selectedOcorrencia) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch(`http://localhost:8080/api/v1/occurrences/${selectedOcorrencia.id}/attachments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "X-Tenant-ID": id
        },
        body: formData
      })

      if (response.ok) {
        const updated = await response.json()
        setSelectedOcorrencia(updated)
        // Atualiza a lista localmente
        setOcorrencias(prev => prev.map(o => o.id === updated.id ? updated : o))
        toast.success("Anexo enviado com sucesso!")
      } else {
        toast.error("Erro ao enviar anexo.")
      }
    } catch (err) {
      toast.error("Erro de conexão ao enviar anexo.")
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const formatarData = (iso?: string) => {
    if (!iso) return "-"
    try {
      return new Date(iso).toLocaleString("pt-BR", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit"
      }).replace(",", " às")
    } catch {
      return iso
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
                          Por: <span className="font-semibold text-slate-800">{oc.authorName || "Anônimo"}</span>
                          {oc.unitName ? <span className="ml-1 text-emerald-700 font-semibold">• Origem: Unidade {oc.unitName}</span> : ""}
                          {oc.relatedUnits && oc.relatedUnits.length > 0 ? <span className="ml-1 text-amber-700 font-semibold">• Envolvidos: {Array.isArray(oc.relatedUnits) ? oc.relatedUnits.join(", ") : oc.relatedUnits}</span> : ""}
                          {" • "}ID: <span className="font-mono">{oc.protocol}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                       <Badge className={oc.status === 'OPEN' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}>
                        {{"OPEN": "Aberto", "IN_PROGRESS": "Em Andamento", "RESOLVED": "Resolvido", "CLOSED": "Concluído"}[oc.status as string] || oc.status}
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

      {/* Dialog / Modal de Gestão de Ocorrência */}
      <Dialog open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-50 border-slate-200 shadow-2xl flex flex-col">
          <DialogHeader className="pb-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-bold text-slate-800">Gerir Ocorrência</DialogTitle>
              <Badge variant="outline" className="text-xs font-mono bg-white border-slate-300">
                {selectedOcorrencia?.protocol || selectedOcorrencia?.id}
              </Badge>
            </div>
            <DialogDescription className="text-slate-500 mt-2">
              Analise os detalhes e atualize o status para o morador.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 py-6 space-y-8">
            {/* Detalhes da Ocorrência */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-lg text-slate-900">{selectedOcorrencia?.title || "Sem título"}</h3>
                  <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5 flex-wrap">
                    <span>Por: <strong className="text-slate-700">{selectedOcorrencia?.authorName || "Anônimo"}</strong></span>
                    {selectedOcorrencia?.unitName && (
                      <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-xs">
                        Unidade Origem: {selectedOcorrencia.unitName}
                      </span>
                    )}
                    {selectedOcorrencia?.relatedUnits && selectedOcorrencia.relatedUnits.length > 0 && (
                      <span className="font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-xs">
                        Unidades Envolvidas: {Array.isArray(selectedOcorrencia.relatedUnits) ? selectedOcorrencia.relatedUnits.join(", ") : selectedOcorrencia.relatedUnits}
                      </span>
                    )}
                  </p>
                </div>
                <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-none uppercase text-[10px] tracking-wider">
                  {selectedOcorrencia?.category || "GERAL"}
                </Badge>
              </div>
              
              {selectedOcorrencia?.description && (
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {selectedOcorrencia.description}
                  </p>
                </div>
              )}
            </div>

            {/* Ações de Resolução */}
            <div className="space-y-6">
              <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-600" />
                Ações do Síndico
              </h4>
              
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-5">
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-slate-700">Novo Status</Label>
                  <Select value={novoStatus} onValueChange={setNovoStatus}>
                    <SelectTrigger className="w-full bg-slate-50 border-slate-200 focus:ring-emerald-500">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OPEN">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-amber-500" />
                          Aberto
                        </div>
                      </SelectItem>
                      <SelectItem value="IN_PROGRESS">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                          Em Andamento
                        </div>
                      </SelectItem>
                      <SelectItem value="RESOLVED">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-500" />
                          Resolvido
                        </div>
                      </SelectItem>
                      <SelectItem value="CLOSED">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-slate-500" />
                          Fechado
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <Label className="text-sm font-medium text-slate-700">Histórico e Respostas</Label>

                  {/* Se a ocorrência anterior tinha o campo response, mostra como primeira msg do síndico */}
                  {selectedOcorrencia?.response && (!selectedOcorrencia.messages || selectedOcorrencia.messages.length === 0) && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                        <Building className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="bg-blue-50/50 p-3 rounded-lg rounded-tl-none border border-blue-100 text-xs text-slate-700 w-full">
                        <p className="font-semibold text-[10px] text-blue-600 mb-1">Síndico / Administração</p>
                        <p className="whitespace-pre-wrap">{selectedOcorrencia.response}</p>
                      </div>
                    </div>
                  )}

                  {/* Mensagens do Histórico */}
                  {selectedOcorrencia?.messages?.length > 0 && (
                    <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2">
                      {selectedOcorrencia.messages.map((msg: any) => {
                        const isSindico = msg.senderRole === "ADMIN" || msg.senderRole === "SINDICO"
                        return (
                          <div key={msg.id} className="flex gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isSindico ? 'bg-blue-100' : 'bg-slate-200'}`}>
                              {isSindico ? <Building className="h-4 w-4 text-blue-600" /> : <User className="h-4 w-4 text-slate-500" />}
                            </div>
                            <div className={`p-3 rounded-lg rounded-tl-none border text-xs text-slate-700 w-full ${isSindico ? 'bg-blue-50/50 border-blue-100' : 'bg-slate-50 border-slate-200'}`}>
                              <p className={`font-semibold text-[10px] mb-1 ${isSindico ? 'text-blue-600' : 'text-slate-500'}`}>
                                {msg.senderName} • {formatarData(msg.createdAt)}
                              </p>
                              <p className="whitespace-pre-wrap">{msg.content}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <Label className="text-xs font-semibold text-slate-500 uppercase">Anexos Existentes ({selectedOcorrencia?.attachments?.length || 0})</Label>
                    {selectedOcorrencia?.attachments && selectedOcorrencia.attachments.length > 0 ? (
                      <div className="space-y-2">
                        {selectedOcorrencia.attachments.map((att: any) => (
                          <Button key={att.id} variant="outline" className="w-full justify-start gap-2 text-xs h-auto py-2 bg-slate-50 border-slate-200 text-slate-700" onClick={() => window.open(`http://localhost:8080/api/v1/occurrences/${selectedOcorrencia.id}/attachments/${att.id}`, "_blank")}>
                            <Paperclip className="h-3 w-3 shrink-0" /> 
                            <span className="truncate">{att.fileName}</span>
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400">Nenhum anexo.</p>
                    )}
                  </div>

                  <Textarea 
                    placeholder="Adicionar nova resposta. O morador será notificado..." 
                    className="min-h-[100px] bg-slate-50 border-slate-200 focus:ring-emerald-500 resize-none mt-2"
                    value={respostaOficial}
                    onChange={(e) => setRespostaOficial(e.target.value)}
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium text-slate-700">Comprovante / Foto (Opcional)</Label>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden" 
                    onChange={handleUploadAttachment}
                  />
                  <div 
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 transition-colors bg-slate-50/50 ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50 cursor-pointer border-slate-200'}`}
                  >
                    <div className="bg-white p-3 rounded-full shadow-sm border border-slate-100">
                      {isUploading ? <Loader2 className="h-5 w-5 text-slate-400 animate-spin" /> : <Camera className="h-5 w-5 text-slate-400" />}
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-slate-600 font-medium">
                        {isUploading ? "Enviando arquivo..." : "Clique para anexar um arquivo"}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">Sobe e salva imediatamente na ocorrência</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-6 border-t border-slate-200 mt-auto flex-col sm:flex-row gap-3">
            <Button variant="outline" className="w-full sm:w-1/3 text-slate-600 hover:bg-slate-100" onClick={() => setIsSheetOpen(false)}>
              Cancelar
            </Button>
            <Button className="w-full sm:w-2/3 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all" onClick={handleSalvarOcorrencia} disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              Atualizar Ocorrência
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}