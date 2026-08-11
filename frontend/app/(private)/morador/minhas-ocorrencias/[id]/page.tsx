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
  AlertTriangle
} from "lucide-react"

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
  authorName?: string
  createdAt: string
  updatedAt?: string
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
  IN_PROGRESS: "Em Execução",
  RESOLVED: "Resolvido",
  CLOSED: "Concluído",
}

// Ordem canônica do fluxo de status, usada para montar a timeline
const STATUS_FLOW: { key: string; label: string; icon: typeof Clock }[] = [
  { key: "OPEN", label: "Aberto", icon: Clock },
  { key: "IN_PROGRESS", label: "Em Execução", icon: MessageSquare },
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

  const getToken = () => (typeof window !== "undefined" ? localStorage.getItem("condoflow_token") : "")

  const traduzirCategoria = (cat: string) => CATEGORIA_LABELS[cat] || cat
  const traduzirStatus = (status: string) => STATUS_LABELS[status] || status

  const formatarData = (iso?: string) => {
    if (!iso) return "-"
    try {
      return new Date(iso).toLocaleString("pt-BR")
    } catch {
      return iso
    }
  }

  useEffect(() => {
    const fetchOccurrence = async () => {
      setIsLoading(true)
      setError("")
      try {
        const response = await fetch(`http://localhost:8080/api/v1/occurrences/protocol/${id}`, {
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
            <CardHeader><CardTitle className="text-lg">Relato Original</CardTitle></CardHeader>
            <CardContent>
              <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-md border border-dashed text-sm">
                "{occurrence.description}"
              </p>
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
              {occurrence.relatedUnitName && (
                <div className="flex items-center gap-3 text-sm">
                  <Building className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-600">Unidade relacionada: <strong>{occurrence.relatedUnitName}</strong></span>
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
              <Button variant="ghost" className="w-full justify-start gap-2 text-xs" size="sm">
                <Paperclip className="h-3 w-3" /> Ver anexos
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}