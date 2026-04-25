"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle2, 
  MessageSquare, 
  Paperclip,
  User,
  Building
} from "lucide-react"

// --- MOCK DE DETALHES ---
const MOCK_DETALHE = {
  id: "CF-2026-B05",
  titulo: "Barulho excessivo apto 502",
  descricao: "O morador do 502 está a realizar obras com furadeira após as 20h. Já tentei contacto direto mas não fui atendido.",
  status: "EM_EXECUCAO",
  dataAbertura: "22/04/2026 às 20:15",
  categoria: "Convivência",
  urgente: false,
  timeline: [
    { status: "Aberto", data: "22/04 20:15", desc: "Ocorrência registada pelo morador.", icon: Clock, current: false },
    { status: "Em Análise", data: "23/04 09:00", desc: "O síndico visualizou o relato e está a verificar o regulamento.", icon: MessageSquare, current: false },
    { status: "Em Execução", data: "23/04 10:30", desc: "Notificação enviada ao proprietário da unidade 502.", icon: CheckCircle2, current: true },
  ]
}

export default function DetalheOcorrencia() {
  const router = useRouter()
  
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header com Voltar */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">{MOCK_DETALHE.id}</h1>
            <Badge variant="outline" className="bg-blue-50 text-blue-700">{MOCK_DETALHE.status}</Badge>
          </div>
          <p className="text-muted-foreground text-sm">{MOCK_DETALHE.titulo}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Coluna Principal: Conteúdo e Timeline */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Descrição do Relato</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-md border border-dashed">
                "{MOCK_DETALHE.descricao}"
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Linha do Tempo</CardTitle>
              <CardDescription>Acompanhe as etapas de resolução.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                {MOCK_DETALHE.timeline.map((step, index) => (
                  <div key={index} className="relative flex items-start gap-6">
                    <div className={`absolute left-0 w-10 h-10 rounded-full border-4 border-white flex items-center justify-center shadow-sm z-10 ${step.current ? "bg-primary text-white" : "bg-slate-100 text-slate-400"}`}>
                      <step.icon className="h-4 w-4" />
                    </div>
                    <div className="ml-12 pt-1">
                      <div className="flex items-center gap-2">
                        <h4 className={`font-bold text-sm ${step.current ? "text-primary" : "text-slate-900"}`}>{step.status}</h4>
                        <span className="text-[10px] text-slate-400 font-mono">{step.data}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coluna Lateral: Detalhes Técnicos */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Informações de Apoio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Building className="h-4 w-4 text-slate-400" />
                <span className="text-slate-600">Categoria: <strong>{MOCK_DETALHE.categoria}</strong></span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock className="h-4 w-4 text-slate-400" />
                <span className="text-slate-600">Aberto em: <strong>22/04/26</strong></span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <User className="h-4 w-4 text-slate-400" />
                <span className="text-slate-600">Relator: <strong>Jonathan (Apto 402)</strong></span>
              </div>
              <Separator />
              <Button variant="ghost" className="w-full justify-start gap-2 text-xs" size="sm">
                <Paperclip className="h-3 w-3" /> Ver anexos/fotos
              </Button>
            </CardContent>
          </Card>

          <Button className="w-full gap-2" variant="outline">
            <MessageSquare className="h-4 w-4" /> Enviar Mensagem
          </Button>
        </div>
      </div>
    </div>
  )
}