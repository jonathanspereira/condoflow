"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, AlertCircle, LayoutDashboard, CheckCircle2, Clock } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts"

interface DashboardStats {
  totalOccurrences: number
  openOccurrences: number
  resolvedOccurrences: number
  occurrencesByCategory: { name: string; value: number }[]
  occurrencesByStatus: { name: string; value: number }[]
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

const COLORS = ["#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]
const STATUS_COLORS: Record<string, string> = {
  OPEN: "#f59e0b",
  IN_PROGRESS: "#0ea5e9",
  RESOLVED: "#10b981",
  CLOSED: "#64748b"
}

export default function PainelSindico() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [days, setDays] = useState<string>('all')
  const [error, setError] = useState("")

  const getToken = () => (typeof window !== "undefined" ? localStorage.getItem("condoflow_token") : "")

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true)
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/syndic${days !== 'all' ? `?days=${days}` : ''}`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        })

        if (!res.ok) {
          throw new Error("Erro ao carregar dados do dashboard")
        }

        const data = await res.json()
        setStats(data)
      } catch (err: any) {
        setError(err.message || "Erro desconhecido")
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [days])

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p>Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-red-500">
          <AlertCircle className="h-8 w-8" />
          <p>{error}</p>
        </div>
      </div>
    )
  }

  // Preparando dados para os gráficos
  const chartDataCategory = stats.occurrencesByCategory.map(item => ({
    name: CATEGORIA_LABELS[item.name] || item.name,
    Quantidade: item.value
  }))

  const chartDataStatus = stats.occurrencesByStatus.map(item => ({
    name: STATUS_LABELS[item.name] || item.name,
    value: item.value,
    originalName: item.name
  }))

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <LayoutDashboard className="h-6 w-6 text-slate-700" />
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Visão Geral</h1>
      </div>
      <p className="text-muted-foreground">Bem-vindo ao painel gerencial do condomínio.</p>

      {/* Cards de Topo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-slate-800">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-bold text-slate-500 flex items-center gap-1">
              Total de Ocorrências
            </CardDescription>
            <CardTitle className="text-4xl font-black">{stats.totalOccurrences}</CardTitle>
          </CardHeader>
        </Card>
        
        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-bold text-amber-600 flex items-center gap-1">
              <Clock className="h-3 w-3" /> Em Aberto / Execução
            </CardDescription>
            <CardTitle className="text-4xl font-black">{stats.openOccurrences}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-bold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Resolvidas / Concluídas
            </CardDescription>
            <CardTitle className="text-4xl font-black">{stats.resolvedOccurrences}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Gráfico de Barras - Categorias */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ocorrências por Categoria</CardTitle>
            <CardDescription>Distribuição dos relatos reportados pelos moradores</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              {chartDataCategory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartDataCategory} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} allowDecimals={false} />
                    <RechartsTooltip 
                      cursor={{fill: '#f1f5f9'}}
                      contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                    />
                    <Bar dataKey="Quantidade" fill="#0f172a" radius={[4, 4, 0, 0]} barSize={40}>
                      {chartDataCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-slate-400 text-sm">
                  Nenhum dado disponível.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Pizza - Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ocorrências por Status</CardTitle>
            <CardDescription>Cenário atual do fluxo de atendimento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              {chartDataStatus.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartDataStatus}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      labelLine={false}
                    >
                      {chartDataStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.originalName] || COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-slate-400 text-sm">
                  Nenhum dado disponível.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
