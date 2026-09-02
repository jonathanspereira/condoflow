"use client"

import React, { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  MessageSquare,
  Paperclip,
  User,
  Building,
  Loader2,
  AlertTriangle,
  Send
} from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { useRef } from "react"

interface OccurrenceDetail {
  id: string
  protocol: string
  title: string
  description: string
  category: string
  status: string
  condominiumName?: string
  unitName?: string
  relatedUnitName?: string
  relatedUnits?: string
  authorName?: string
  createdAt: string
  updatedAt?: string
  response?: string
  messages?: {
    id: number
    content: string
    senderName: string
    senderRole: string
    createdAt: string
  }[]
  attachments?: {
    id: number
    fileName: string
    fileType: string
    createdAt: string
  }[]
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

// Ordem canônica do fluxo de status, usada para montar a timeline
const STATUS_FLOW: { key: string; label: string; icon: typeof Clock }[] = [
  { key: "OPEN", label: "Aberto", icon: Clock },
  { key: "IN_PROGRESS", label: "Em Andamento", icon: MessageSquare },
  { key: "RESOLVED", label: "Resolvido", icon: CheckCircle2 },
  { key: "CLOSED", label: "Concluído", icon: CheckCircle2 },
]

export default function DetalheOcorrencia({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  // Desembrulhando params para compatibilidade com Next.js 16
  const { id } = use(params)

  const [occurrence, setOccurrence] = useState<OccurrenceDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [newMessage, setNewMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getToken = () => (typeof window !== "undefined" ? localStorage.getItem("condoflow_token") : "")

  const traduzirCategoria = (cat: string) => CATEGORIA_LABELS[cat] || cat
  const traduzirStatus = (status: string) => STATUS_LABELS[status] || status

  const formatarData = (iso?: string) => {
    if (!iso) return "-"
    try {
      // Como o backend roda localmente, a data já vem no fuso correto (sem o Z)
      const date = new Date(iso)
      return date.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }).replace(",", " às")
    } catch {
      return iso
    }
  }

  useEffect(() => {
    const fetchOccurrence = async () => {
      setIsLoading(true)
      setError("")
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/occurrences/protocol/${id}`, {
          headers: { Authorization: `Bearer ${getToken()}` }
        })

        if (response.ok) {
          const data = await response.json()
          setOccurrence(data)
        } else if (response.status === 404) {
          setError("Ocorrência não encontrada.")
        } else {
          setError("Não foi possível carregar a ocorrência.")
        }
      } catch (err) {
        console.error("Erro ao carregar ocorrência:", err)
        setError("Erro de conexão com o servidor.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchOccurrence()
  }, [id])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !occurrence) return
    setIsSending(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/occurrences/${occurrence.id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({ content: newMessage })
      })

      if (response.ok) {
        const updated = await response.json()
        setOccurrence(updated)
        setNewMessage("")
        toast.success("Mensagem enviada com sucesso!")
      } else {
        toast.error("Erro ao enviar mensagem.")
      }
    } catch (err) {
      toast.error("Erro de conexão com o servidor.")
    } finally {
      setIsSending(false)
    }
  }

  const handleUploadAttachment = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !occurrence) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/occurrences/${occurrence.id}/attachments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getToken()}`
        },
        body: formData
      })

      if (response.ok) {
        const updated = await response.json()
        setOccurrence(updated)
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

  // Monta a timeline com base no status atual, marcando os passos já concluídos
  const buildTimeline = (status: string) => {
    const currentIndex = STATUS_FLOW.findIndex((s) => s.key === status)
    const idx = currentIndex === -1 ? 0 : currentIndex
    return STATUS_FLOW.slice(0, idx + 1).map((step, i) => ({
      ...step,
      current: i === idx,
    }))
  }

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        <span className="ml-2 text-sm text-muted-foreground">Carregando ocorrência...</span>
      </div>
    )
  }

  if (error || !occurrence) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
          <AlertTriangle className="h-8 w-8 text-red-400" />
          <p className="text-sm text-muted-foreground">{error || "Ocorrência não encontrada."}</p>
        </div>
      </div>
    )
  }

  const timeline = buildTimeline(occurrence.status)

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight font-mono">{occurrence.protocol}</h1>
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              {traduzirStatus(occurrence.status)}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">{occurrence.title}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-lg">Relato Original e Histórico</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                  <User className="h-4 w-4 text-slate-500" />
                </div>
                <div className="bg-slate-50 p-4 rounded-xl rounded-tl-none border border-slate-200 text-sm text-slate-700 w-full">
                  <p className="font-semibold text-xs text-slate-500 mb-2">Morador (Abertura) • {formatarData(occurrence.createdAt)}</p>
                  <p className="whitespace-pre-wrap">{occurrence.description}</p>
                </div>
              </div>

              {/* Se a ocorrência anterior tinha o campo response, mostra como primeira msg do síndico */}
              {occurrence.response && (!occurrence.messages || occurrence.messages.length === 0) && (
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <Building className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="bg-blue-50/50 p-4 rounded-xl rounded-tl-none border border-blue-100 text-sm text-slate-700 w-full">
                    <p className="font-semibold text-xs text-blue-600 mb-2">Síndico / Administração</p>
                    <p className="whitespace-pre-wrap">{occurrence.response}</p>
                  </div>
                </div>
              )}

              {/* Novas Mensagens do Histórico */}
              {occurrence.messages?.map((msg) => {
                const isSindico = msg.senderRole === "ADMIN" || msg.senderRole === "SINDICO"
                return (
                  <div key={msg.id} className="flex gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isSindico ? 'bg-blue-100' : 'bg-slate-200'}`}>
                      {isSindico ? <Building className="h-4 w-4 text-blue-600" /> : <User className="h-4 w-4 text-slate-500" />}
                    </div>
                    <div className={`p-4 rounded-xl rounded-tl-none border text-sm text-slate-700 w-full ${isSindico ? 'bg-blue-50/50 border-blue-100' : 'bg-slate-50 border-slate-200'}`}>
                      <p className={`font-semibold text-xs mb-2 ${isSindico ? 'text-blue-600' : 'text-slate-500'}`}>
                        {msg.senderName} • {formatarData(msg.createdAt)}
                      </p>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                )
              })}

              {/* Área de Resposta e Upload */}
              {occurrence.status !== "CLOSED" && (
                <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
                  <Textarea 
                    placeholder="Adicionar um novo comentário ou resposta..."
                    className="min-h-[100px] resize-none"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                  <div className="flex justify-between items-center">
                    <div>
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        className="hidden" 
                        onChange={handleUploadAttachment}
                      />
                      <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                        {isUploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Paperclip className="h-4 w-4 mr-2" />}
                        Anexar arquivo
                      </Button>
                    </div>
                    <Button onClick={handleSendMessage} disabled={isSending || !newMessage.trim()} className="gap-2 bg-slate-900">
                      {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      Enviar
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status do Atendimento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-slate-200">
                {timeline.map((step, index) => (
                  <div key={index} className="relative flex items-start gap-6">
                    <div className={`absolute left-0 w-10 h-10 rounded-full border-4 border-white flex items-center justify-center shadow-sm z-10 ${step.current ? "bg-primary text-white" : "bg-slate-100 text-slate-400"}`}>
                      <step.icon className="h-4 w-4" />
                    </div>
                    <div className="ml-12 pt-1">
                      <div className="flex items-center gap-2">
                        <h4 className={`font-bold text-sm ${step.current ? "text-primary" : "text-slate-900"}`}>{step.label}</h4>
                        {step.current && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            {formatarData(occurrence.updatedAt || occurrence.createdAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-sm">Dados</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Building className="h-4 w-4 text-slate-400" />
                <span className="text-slate-600">Categoria: <strong>{traduzirCategoria(occurrence.category)}</strong></span>
              </div>
              {occurrence.unitName && (
                <div className="flex items-center gap-3 text-sm">
                  <Building className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-600">Unidade: <strong>{occurrence.unitName}</strong></span>
                </div>
              )}
              {occurrence.relatedUnits && (
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-600">Unidade relacionada: <strong>{occurrence.relatedUnits}</strong></span>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm">
                <User className="h-4 w-4 text-slate-400" />
                <span className="text-slate-600">Autor: <strong>{occurrence.authorName || "-"}</strong></span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock className="h-4 w-4 text-slate-400" />
                <span className="text-slate-600">Registrado em: <strong>{formatarData(occurrence.createdAt)}</strong></span>
              </div>
              <Separator />
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-500 uppercase">Anexos ({occurrence.attachments?.length || 0})</h4>
                {occurrence.attachments && occurrence.attachments.length > 0 ? (
                  <div className="space-y-2">
                    {occurrence.attachments.map((att) => (
                      <Button key={att.id} variant="ghost" className="w-full justify-start gap-2 text-xs h-auto py-2" onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL}/occurrences/${occurrence.id}/attachments/${att.id}`, "_blank")}>
                        <Paperclip className="h-3 w-3 shrink-0" /> 
                        <span className="truncate">{att.fileName}</span>
                      </Button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">Nenhum anexo.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}