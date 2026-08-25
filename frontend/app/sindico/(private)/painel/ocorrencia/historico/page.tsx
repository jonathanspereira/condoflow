"use client"

import React, { useState, useEffect, useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import {
  Search,
  MessageCircle,
  User,
  Shield,
  CheckCircle,
  Clock,
  Loader2,
  Building,
  Paperclip,
  Camera,
  FileText,
  Building2,
  X
} from "lucide-react"
import { toast } from "sonner"

interface CondominiumOption {
  id: number
  name: string
}

interface OccurrenceMessage {
  id: number
  content: string
  senderName: string
  senderRole: string
  createdAt: string
}

interface OccurrenceAttachment {
  id: number
  fileName: string
  fileType?: string
  createdAt?: string
}

interface Occurrence {
  id: string
  protocol: string
  title: string
  description: string
  response?: string
  category: string
  status: string
  condominiumName: string
  condominiumId?: number
  unitName?: string
  relatedUnits?: string
  authorName?: string
  createdAt: string
  updatedAt?: string
  messages?: OccurrenceMessage[]
  attachments?: OccurrenceAttachment[]
}

const CATEGORIA_LABELS: Record<string, string> = {
  MANUTENCAO: "Manutenção",
  CONVIVENCIA: "Convivência",
  LIMPEZA: "Limpeza",
  SEGURANCA: "Segurança",
  OUTROS: "Outros",
}

const STATUS_LABELS: Record<string, string> = {
  OPEN: "Aberto",
  IN_PROGRESS: "Em Andamento",
  RESOLVED: "Resolvido",
  CLOSED: "Concluído",
}

export default function HistoricoOcorrenciasPage() {
  const [condominios, setCondominios] = useState<CondominiumOption[]>([])
  const [selectedCondoId, setSelectedCondoId] = useState<string>("TODOS")
  const [ocorrencias, setOcorrencias] = useState<Occurrence[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [busca, setBusca] = useState("")
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>("TODAS")
  const [unidadeFiltro, setUnidadeFiltro] = useState<string>("TODAS")
  const [abaStatus, setAbaStatus] = useState<string>("todas")

  // Modal de Detalhes / Resposta
  const [selectedOcorrencia, setSelectedOcorrencia] = useState<Occurrence | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [novoStatus, setNovoStatus] = useState<string>("")
  const [novaResposta, setNovaResposta] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getToken = () => (typeof window !== "undefined" ? localStorage.getItem("condoflow_token") : "")

  // 1. Carrega condomínios do síndico
  useEffect(() => {
    async function loadCondominios() {
      try {
        const res = await fetch("http://localhost:8080/api/v1/condominiums/me", {
          headers: { Authorization: `Bearer ${getToken()}` },
        })
        if (res.ok) {
          const data = await res.json()
          setCondominios(data)
        }
      } catch (err) {
        console.error("Erro ao carregar condomínios:", err)
      }
    }
    loadCondominios()
  }, [])

  // 2. Carrega ocorrências com base no condomínio selecionado
  const fetchOcorrencias = async () => {
    setIsLoading(true)
    try {
      let condoIdsToFetch: number[] = []

      if (selectedCondoId === "TODOS") {
        condoIdsToFetch = condominios.map((c) => c.id)
      } else {
        condoIdsToFetch = [Number(selectedCondoId)]
      }

      if (condoIdsToFetch.length === 0 && condominios.length > 0) {
        condoIdsToFetch = condominios.map((c) => c.id)
      }

      let allOco: Occurrence[] = []

      // Busca ocorrências de cada condomínio
      for (const cid of condoIdsToFetch) {
        const res = await fetch(`http://localhost:8080/api/v1/occurrences/condominium/${cid}`, {
          headers: { 
            Authorization: `Bearer ${getToken()}`,
            "X-Tenant-ID": cid.toString()
          },
        })
        if (res.ok) {
          const list: Occurrence[] = await res.json()
          allOco = [...allOco, ...list]
        }
      }

      // Ordena por data de criação mais recente
      allOco.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      setOcorrencias(allOco)
    } catch (error) {
      console.error("Erro ao buscar histórico de ocorrências:", error)
      toast.error("Erro ao carregar histórico de ocorrências.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchOcorrencias()
  }, [selectedCondoId, condominios])

  // Extrai lista única de unidades para badging / filtro
  const listaUnidadesUnicas = Array.from(
    new Set(
      ocorrencias.flatMap((o) => {
        const list: string[] = []
        if (o.unitName) list.push(o.unitName)
        if (o.relatedUnits) {
          o.relatedUnits.split(",").forEach((u) => list.push(u.trim()))
        }
        return list
      })
    )
  ).filter(Boolean)

  // Abrir Modal de Gestão
  const handleOpenResponder = (oc: Occurrence) => {
    setSelectedOcorrencia(oc)
    setNovoStatus(oc.status)
    setNovaResposta("")
    setIsDialogOpen(true)
  }

  // Atualizar Ocorrência (Status + Mensagem)
  const handleSalvarOcorrencia = async () => {
    if (!selectedOcorrencia) return
    setIsSubmitting(true)

    try {
      const response = await fetch(`http://localhost:8080/api/v1/occurrences/${selectedOcorrencia.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
          "X-Tenant-ID": selectedOcorrencia.condominiumId ? String(selectedOcorrencia.condominiumId) : ""
        },
        body: JSON.stringify({
          status: novoStatus,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        toast.error(errorData?.message || "Erro ao atualizar status da ocorrência.")
        setIsSubmitting(false)
        return
      }

      let updatedOcorrencia: Occurrence = await response.json()

      if (novaResposta.trim()) {
        const msgRes = await fetch(`http://localhost:8080/api/v1/occurrences/${selectedOcorrencia.id}/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
            "X-Tenant-ID": selectedOcorrencia.condominiumId ? String(selectedOcorrencia.condominiumId) : ""
          },
          body: JSON.stringify({ content: novaResposta.trim() }),
        })

        if (msgRes.ok) {
          updatedOcorrencia = await msgRes.json()
        } else {
          toast.error("Status atualizado, mas houve falha ao salvar a mensagem.")
        }
      }

      setOcorrencias((prev) => prev.map((o) => (o.id === updatedOcorrencia.id ? updatedOcorrencia : o)))
      setSelectedOcorrencia(updatedOcorrencia)
      setIsDialogOpen(false)
      toast.success("Ocorrência atualizada com sucesso!")
    } catch (err) {
      console.error("Erro ao atualizar ocorrência:", err)
      toast.error("Erro de conexão ao atualizar a ocorrência.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Enviar Anexo
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
          "X-Tenant-ID": selectedOcorrencia.condominiumId ? String(selectedOcorrencia.condominiumId) : ""
        },
        body: formData,
      })

      if (response.ok) {
        const updated: Occurrence = await response.json()
        setSelectedOcorrencia(updated)
        setOcorrencias((prev) => prev.map((o) => (o.id === updated.id ? updated : o)))
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
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).replace(",", " às")
    } catch {
      return iso
    }
  }

  // Filtragem local
  const ocorrenciasFiltradas = ocorrencias.filter((oc) => {
    const matchBusca =
      oc.title?.toLowerCase().includes(busca.toLowerCase()) ||
      oc.protocol?.toLowerCase().includes(busca.toLowerCase()) ||
      oc.authorName?.toLowerCase().includes(busca.toLowerCase()) ||
      oc.unitName?.toLowerCase().includes(busca.toLowerCase()) ||
      oc.relatedUnits?.toLowerCase().includes(busca.toLowerCase())

    if (!matchBusca) return false

    if (categoriaFiltro !== "TODAS" && oc.category !== categoriaFiltro) {
      return false
    }

    if (unidadeFiltro !== "TODAS") {
      const isOriginUnit = oc.unitName?.toLowerCase() === unidadeFiltro.toLowerCase()
      const isRelated = oc.relatedUnits?.toLowerCase().includes(unidadeFiltro.toLowerCase())
      if (!isOriginUnit && !isRelated) return false
    }

    if (abaStatus === "abertas") return oc.status === "OPEN"
    if (abaStatus === "emandamento") return oc.status === "IN_PROGRESS"
    if (abaStatus === "concluidas") return oc.status === "RESOLVED" || oc.status === "CLOSED"

    return true
  })

  // Métricas
  const qtdTotal = ocorrencias.length
  const qtdAbertas = ocorrencias.filter((o) => o.status === "OPEN").length
  const qtdEmAndamento = ocorrencias.filter((o) => o.status === "IN_PROGRESS").length
  const qtdConcluidas = ocorrencias.filter((o) => o.status === "RESOLVED" || o.status === "CLOSED").length

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Histórico de Ocorrências</h1>
          <p className="text-sm text-muted-foreground">
            Acompanhe e gerencie todas as ocorrências registradas no condomínio.
          </p>
        </div>

        {/* Condominium Filter */}
        {condominios.length > 0 && (
          <div className="flex items-center gap-2 bg-white p-2 rounded-lg border shadow-sm">
            <Building className="h-4 w-4 text-slate-500" />
            <Select value={selectedCondoId} onValueChange={setSelectedCondoId}>
              <SelectTrigger className="w-[200px] h-8 text-xs border-none focus:ring-0">
                <SelectValue placeholder="Selecione o condomínio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos os Condomínios</SelectItem>
                {condominios.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Cards de Métricas Resumidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="shadow-sm border-slate-200">
          <CardContent className="pt-5 pb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Total Registrado</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{qtdTotal}</h3>
            </div>
            <FileText className="text-slate-400 h-7 w-7 opacity-30" />
          </CardContent>
        </Card>

        <Card className="shadow-sm border-amber-200 bg-amber-50/20">
          <CardContent className="pt-5 pb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-amber-700 uppercase">Abertas</p>
              <h3 className="text-2xl font-black text-amber-800 mt-1">{qtdAbertas}</h3>
            </div>
            <Clock className="text-amber-500 h-7 w-7 opacity-30" />
          </CardContent>
        </Card>

        <Card className="shadow-sm border-blue-200 bg-blue-50/20">
          <CardContent className="pt-5 pb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-700 uppercase">Em Andamento</p>
              <h3 className="text-2xl font-black text-blue-800 mt-1">{qtdEmAndamento}</h3>
            </div>
            <Loader2 className="text-blue-500 h-7 w-7 opacity-30" />
          </CardContent>
        </Card>

        <Card className="shadow-sm border-emerald-200 bg-emerald-50/20">
          <CardContent className="pt-5 pb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-emerald-700 uppercase">Concluídas</p>
              <h3 className="text-2xl font-black text-emerald-800 mt-1">{qtdConcluidas}</h3>
            </div>
            <CheckCircle className="text-emerald-500 h-7 w-7 opacity-30" />
          </CardContent>
        </Card>
      </div>

      {/* Main Card */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4 border-b border-slate-100">
          <div className="flex flex-col md:flex-row gap-4 justify-between md:items-center">
            <div>
              <CardTitle className="text-lg">Registros de Ocorrências</CardTitle>
              <CardDescription>Lista consolidada com detalhes, unidades relacionadas e canal de atendimento.</CardDescription>
            </div>

            {/* Controls: Search & Category */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar protocolo, título ou unidade..."
                  className="pl-9 h-9 text-xs bg-slate-50"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                />
              </div>

              <div className="w-full sm:w-44">
                <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
                  <SelectTrigger className="h-9 text-xs bg-slate-50">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TODAS">Todas as Categorias</SelectItem>
                    <SelectItem value="MANUTENCAO">Manutenção</SelectItem>
                    <SelectItem value="CONVIVENCIA">Convivência</SelectItem>
                    <SelectItem value="LIMPEZA">Limpeza</SelectItem>
                    <SelectItem value="SEGURANCA">Segurança</SelectItem>
                    <SelectItem value="OUTROS">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* FILTRO DE UNIDADES VIA BADGES */}
          {listaUnidadesUnicas.length > 0 && (
            <div className="pt-3 flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5" />
                Filtrar por Unidade:
              </span>
              <Badge
                onClick={() => setUnidadeFiltro("TODAS")}
                className={`cursor-pointer text-[11px] font-semibold transition-all ${
                  unidadeFiltro === "TODAS" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Todas
              </Badge>
              {listaUnidadesUnicas.map((u) => (
                <Badge
                  key={u}
                  onClick={() => setUnidadeFiltro(unidadeFiltro === u ? "TODAS" : u)}
                  className={`cursor-pointer text-[11px] font-semibold transition-all ${
                    unidadeFiltro === u ? "bg-emerald-600 text-white" : "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
                  }`}
                >
                  {u}
                  {unidadeFiltro === u && <X className="h-3 w-3 ml-1" />}
                </Badge>
              ))}
            </div>
          )}
        </CardHeader>

        <CardContent className="pt-4">
          <Tabs value={abaStatus} onValueChange={setAbaStatus}>
            <TabsList className="bg-slate-100 mb-4">
              <TabsTrigger value="todas">Todas ({ocorrencias.length})</TabsTrigger>
              <TabsTrigger value="abertas">Abertas ({qtdAbertas})</TabsTrigger>
              <TabsTrigger value="emandamento">Em Andamento ({qtdEmAndamento})</TabsTrigger>
              <TabsTrigger value="concluidas">Concluídas ({qtdConcluidas})</TabsTrigger>
            </TabsList>

            <TabsContent value={abaStatus} className="mt-0">
              <div className="rounded-md border bg-white overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="w-[140px]">Protocolo</TableHead>
                      <TableHead>Título / Relato</TableHead>
                      <TableHead>Solicitante & Unidades</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ação</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-12">
                          <div className="flex flex-col items-center gap-2">
                            <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                            <span>Carregando histórico de ocorrências...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : ocorrenciasFiltradas.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-12">
                          Nenhuma ocorrência encontrada.
                        </TableCell>
                      </TableRow>
                    ) : (
                      ocorrenciasFiltradas.map((item) => {
                        const statusBadgeClass =
                          item.status === "OPEN"
                            ? "bg-amber-100 text-amber-800 border-amber-200"
                            : item.status === "IN_PROGRESS"
                            ? "bg-blue-100 text-blue-800 border-blue-200"
                            : item.status === "RESOLVED"
                            ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                            : "bg-slate-100 text-slate-700 border-slate-200"

                        return (
                          <TableRow key={item.id} className="hover:bg-slate-50/70 transition-colors">
                            <TableCell className="font-mono text-xs font-bold text-emerald-700">
                              {item.protocol || item.id}
                            </TableCell>

                            <TableCell>
                              <div className="flex flex-col max-w-md">
                                <span className="font-semibold text-slate-900 text-sm">{item.title}</span>
                                <span className="text-xs text-muted-foreground line-clamp-1">
                                  {item.description}
                                </span>
                              </div>
                            </TableCell>

                            <TableCell>
                              <div className="flex flex-col text-xs gap-1">
                                <span className="font-semibold text-slate-800">{item.authorName || "Anônimo"}</span>
                                <div className="flex flex-wrap gap-1 items-center">
                                  {item.unitName && (
                                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold">
                                      Origem: {item.unitName}
                                    </Badge>
                                  )}
                                  {item.relatedUnits && (
                                    item.relatedUnits.split(",").map((ru, i) => (
                                      <Badge key={i} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-bold">
                                        Relacionada: {ru.trim()}
                                      </Badge>
                                    ))
                                  )}
                                </div>
                              </div>
                            </TableCell>

                            <TableCell>
                              <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-semibold">
                                {CATEGORIA_LABELS[item.category] || item.category}
                              </Badge>
                            </TableCell>

                            <TableCell>
                              <Badge className={`text-[10px] font-semibold ${statusBadgeClass}`}>
                                {STATUS_LABELS[item.status] || item.status}
                              </Badge>
                            </TableCell>

                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 gap-1.5 text-xs text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 font-medium"
                                onClick={() => handleOpenResponder(item)}
                              >
                                <MessageCircle className="h-3.5 w-3.5" />
                                Gerenciar
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Modal / Dialog de Gerenciamento da Ocorrência */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-50 border-slate-200 shadow-2xl flex flex-col">
          <DialogHeader className="pb-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-bold text-slate-900">Gerir Ocorrência</DialogTitle>
              <Badge variant="outline" className="text-xs font-mono bg-white border-slate-300">
                {selectedOcorrencia?.protocol || selectedOcorrencia?.id}
              </Badge>
            </div>
            <DialogDescription className="text-slate-500 text-xs mt-1">
              Analise as informações fornecidas pelo morador e envie atualizações.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 py-4 space-y-6">
            {/* Detalhes do Relato */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-base text-slate-900">{selectedOcorrencia?.title || "Sem título"}</h3>
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 flex-wrap">
                    <span>Por: <strong className="text-slate-700">{selectedOcorrencia?.authorName || "Anônimo"}</strong></span>
                    {selectedOcorrencia?.unitName && (
                      <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded text-[11px]">
                        Unidade {selectedOcorrencia.unitName}
                      </span>
                    )}
                    {selectedOcorrencia?.relatedUnits && (
                      selectedOcorrencia.relatedUnits.split(",").map((ru, idx) => (
                        <span key={idx} className="font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded text-[11px]">
                          Relacionada: {ru.trim()}
                        </span>
                      ))
                    )}
                  </div>
                </div>
                <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-none uppercase text-[10px]">
                  {CATEGORIA_LABELS[selectedOcorrencia?.category || ""] || selectedOcorrencia?.category || "GERAL"}
                </Badge>
              </div>

              {selectedOcorrencia?.description && (
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs text-slate-700 leading-relaxed">
                  {selectedOcorrencia.description}
                </div>
              )}
            </div>

            {/* Ações do Síndico */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm text-slate-900 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-600" />
                Painel de Atendimento do Síndico
              </h4>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
                {/* Seleção de Status */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-700">Alterar Status da Ocorrência</Label>
                  <Select value={novoStatus} onValueChange={setNovoStatus}>
                    <SelectTrigger className="w-full bg-slate-50 border-slate-200 text-xs">
                      <SelectValue placeholder="Selecione o novo status" />
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
                          Concluído
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Histórico de Mensagens */}
                <div className="space-y-3">
                  <Label className="text-xs font-semibold text-slate-700">Histórico de Mensagens e Interações</Label>

                  {selectedOcorrencia?.messages && selectedOcorrencia.messages.length > 0 ? (
                    <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                      {selectedOcorrencia.messages.map((msg) => {
                        const isSindico = msg.senderRole === "ADMIN" || msg.senderRole === "SINDICO"
                        return (
                          <div key={msg.id} className="flex gap-2.5">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${isSindico ? "bg-blue-100" : "bg-slate-200"}`}>
                              {isSindico ? <Building className="h-3.5 w-3.5 text-blue-600" /> : <User className="h-3.5 w-3.5 text-slate-500" />}
                            </div>
                            <div className={`p-3 rounded-lg border text-xs text-slate-700 w-full ${isSindico ? "bg-blue-50/60 border-blue-100" : "bg-slate-50 border-slate-200"}`}>
                              <p className={`font-semibold text-[10px] mb-1 ${isSindico ? "text-blue-600" : "text-slate-500"}`}>
                                {msg.senderName} • {formatarData(msg.createdAt)}
                              </p>
                              <p className="whitespace-pre-wrap">{msg.content}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    !selectedOcorrencia?.response && (
                      <p className="text-xs text-slate-400 italic">Nenhuma mensagem registrada até o momento.</p>
                    )
                  )}

                  {/* Anexos */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <Label className="text-[11px] font-semibold text-slate-500 uppercase">
                      Anexos ({selectedOcorrencia?.attachments?.length || 0})
                    </Label>
                    {selectedOcorrencia?.attachments && selectedOcorrencia.attachments.length > 0 ? (
                      <div className="space-y-1.5">
                        {selectedOcorrencia.attachments.map((att) => (
                          <Button
                            key={att.id}
                            variant="outline"
                            className="w-full justify-start gap-2 text-xs h-auto py-1.5 bg-slate-50 border-slate-200 text-slate-700"
                            onClick={() => window.open(`http://localhost:8080/api/v1/occurrences/${selectedOcorrencia.id}/attachments/${att.id}`, "_blank")}
                          >
                            <Paperclip className="h-3 w-3 shrink-0 text-slate-500" />
                            <span className="truncate">{att.fileName}</span>
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400">Nenhum anexo salvo.</p>
                    )}
                  </div>

                  {/* Nova Mensagem */}
                  <Textarea
                    placeholder="Escreva uma nova resposta ou instrução para o morador..."
                    className="min-h-[90px] bg-slate-50 border-slate-200 text-xs focus:ring-emerald-500 resize-none mt-2"
                    value={novaResposta}
                    onChange={(e) => setNovaResposta(e.target.value)}
                  />
                </div>

                {/* Upload de Anexo */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <Label className="text-xs font-semibold text-slate-700">Anexar Novo Arquivo / Foto</Label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleUploadAttachment}
                  />
                  <div
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                    className={`border border-dashed rounded-lg p-4 flex flex-col items-center justify-center gap-2 transition-colors bg-slate-50/50 ${
                      isUploading ? "opacity-50 cursor-not-allowed" : "hover:bg-slate-50 cursor-pointer border-slate-300"
                    }`}
                  >
                    {isUploading ? (
                      <Loader2 className="h-5 w-5 text-slate-400 animate-spin" />
                    ) : (
                      <Camera className="h-5 w-5 text-slate-400" />
                    )}
                    <span className="text-xs text-slate-600 font-medium">
                      {isUploading ? "Enviando anexo..." : "Clique para anexar um comprovante ou imagem"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-slate-200 mt-auto flex-col sm:flex-row gap-2">
            <Button variant="outline" className="w-full sm:w-1/3 text-xs" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              className="w-full sm:w-2/3 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs shadow-sm"
              onClick={handleSalvarOcorrencia}
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
