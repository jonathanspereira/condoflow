"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Ticket, Clock, CheckCircle2, MessageSquare, ArrowLeft, Loader2 } from "lucide-react"
import { toast } from "sonner"

type StatusOcorrencia = "ABERTO" | "EM_ANALISE" | "EM_EXECUCAO" | "CONCLUIDO"

const STATUS_ORDER: StatusOcorrencia[] = ["ABERTO", "EM_ANALISE", "EM_EXECUCAO", "CONCLUIDO"]

const statusLabel: Record<StatusOcorrencia, string> = {
  ABERTO: "Aberto",
  EM_ANALISE: "Em Análise",
  EM_EXECUCAO: "Em Execução",
  CONCLUIDO: "Concluído",
}

type EtapaHistorico = {
  status: string
  data: string
  active: boolean
}

type ResultadoConsulta = {
  protocol: string
  status: StatusOcorrencia
  title: string
  description: string
  response: string | null
  category: string | null
  condominiumName: string
  unitName: string | null
  authorName: string | null
  createdAt: string
  updatedAt: string
  historico: EtapaHistorico[]
}

function formatDateTime(iso: string): string {
  const date = new Date(iso)
  return date.toLocaleDateString("pt-BR") + " " + date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR")
}

function buildHistorico(status: StatusOcorrencia, createdAt: string, updatedAt: string): EtapaHistorico[] {
  const currentIndex = STATUS_ORDER.indexOf(status)

  return STATUS_ORDER.map((s, i) => ({
    status: statusLabel[s],
    data: i === 0 ? formatDateTime(createdAt) : i <= currentIndex ? formatDateTime(updatedAt) : "-",
    active: i <= currentIndex,
  }))
}

export default function ConsultaProtocolo() {
  const [protocolo, setProtocolo] = useState("")
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState<ResultadoConsulta | null>(null)

  const buscarProtocolo = async (e: { preventDefault: () => void }) => {
    e.preventDefault()
    if (!protocolo.trim()) {
      toast.error("Informe um protocolo para consultar.")
      return
    }

    setLoading(true)
    setResultado(null)

    try {
      const res = await fetch(`http://localhost:8080/api/v1/occurrences/protocol/${encodeURIComponent(protocolo.trim())}`)

      if (!res.ok) {
        if (res.status === 404) {
          toast.error("Protocolo não encontrado.", {
            description: "Verifique o código informado e tente novamente.",
          })
        } else {
          toast.error("Erro ao consultar protocolo.", {
            description: "Tente novamente mais tarde.",
          })
        }
        return
      }

      const data = await res.json()
      const status = data.status as StatusOcorrencia

      setResultado({
        protocol: data.protocol,
        status,
        title: data.title,
        description: data.description,
        response: data.response,
        category: data.category,
        condominiumName: data.condominiumName,
        unitName: data.unitName,
        authorName: data.authorName,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        historico: buildHistorico(status, data.createdAt, data.updatedAt),
      })

      toast.success("Ocorrência localizada com sucesso.")
    } catch {
      toast.error("Erro de conexão.", {
        description: "Não foi possível conectar ao servidor. Tente novamente.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-slate-50 px-4 py-12">
      <Link
        href="/"
        className="absolute left-4 top-4 md:left-8 md:top-8 flex items-center text-sm font-medium text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar
      </Link>

      <div className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-3xl flex-col justify-center">

      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Consultar Ocorrência</h1>
        <p className="text-muted-foreground">
          Insira o código de protocolo gerado no momento do seu relato.
        </p>
      </div>

      <Card className="mb-8 border-primary/20 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Buscar protocolo</CardTitle>
          <CardDescription>Exemplo: CF-2026-A1B2C3</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={buscarProtocolo} className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Ticket className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Ex: CF-2026-A1B2C3" 
                className="pl-10"
                value={protocolo}
                onChange={(e) => setProtocolo(e.target.value.toUpperCase().replaceAll(/\s+/g, ""))}
                required
              />
            </div>
            <Button type="submit" disabled={loading || protocolo.trim().length < 4}>
              {loading ? (
                <>
                  Buscando...
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                </>
              ) : (
                <>
                  Consultar
                  <Search className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {resultado && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card>
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-xl">{resultado.title}</CardTitle>
                <CardDescription>Protocolo: {resultado.protocol}</CardDescription>
              </div>
              <Badge variant={resultado.status === "CONCLUIDO" ? "default" : "secondary"} className="text-sm">
                {statusLabel[resultado.status]}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Timeline de Status */}
              <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="absolute top-4 left-0 hidden h-0.5 w-full bg-slate-100 -z-10 sm:block" />
                {resultado.historico.map((step) => (
                  <div key={step.status} className="flex flex-col items-center text-center">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center border-2 bg-white ${step.active ? 'border-primary text-primary' : 'border-slate-200 text-slate-300'}`}>
                      {step.status === "Concluído" ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                    </div>
                    <span className={`text-[10px] mt-2 font-bold uppercase ${step.active ? 'text-primary' : 'text-slate-400'}`}>
                      {step.status}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{step.data}</span>
                  </div>
                ))}
              </div>

              {resultado.response && (
                <div className="bg-slate-50 p-4 rounded-lg border">
                  <h4 className="flex items-center gap-2 font-semibold text-sm mb-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    Resposta da Administração
                  </h4>
                  <p className="text-sm text-slate-600 italic">
                    &ldquo;{resultado.response}&rdquo;
                  </p>
                </div>
              )}

              {!resultado.response && (
                <div className="bg-slate-50 p-4 rounded-lg border">
                  <h4 className="flex items-center gap-2 font-semibold text-sm mb-2 text-muted-foreground">
                    <MessageSquare className="h-4 w-4" />
                    Resposta da Administração
                  </h4>
                  <p className="text-sm text-muted-foreground italic">
                    Ainda não há resposta da administração.
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="text-xs text-muted-foreground border-t pt-4">
              Última atualização em: {formatDateTime(resultado.updatedAt)}
            </CardFooter>
          </Card>
        </div>
      )}
      </div>
    </div>
  )
}