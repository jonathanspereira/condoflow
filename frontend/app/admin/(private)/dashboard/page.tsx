"use client"

import React, { useState, useEffect, useCallback } from "react"
import {
  Building2,
  Users,
  AlertCircle,
  CheckCircle2,
  Filter,
  RefreshCw,
  TrendingUp,
  BarChart3,
  PieChart as PieIcon,
  Calendar,
  Loader2,
  Layers,
  ArrowUpRight,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts"

interface CategoryStat {
  category: string
  label: string
  count: number
}

interface StatusStat {
  status: string
  label: string
  count: number
}

interface CondominiumStat {
  id: number
  name: string
  totalUsers: number
  totalOccurrences: number
}

interface MonthlyTrend {
  month: string
  total: number
  resolved: number
}

interface DashboardStats {
  totalCondominiums: number
  totalUsers: number
  totalOccurrences: number
  openOccurrences: number
  inProgressOccurrences: number
  resolvedOccurrences: number
  resolutionRate: number
  categoryStats: CategoryStat[]
  statusStats: StatusStat[]
  condominiumStats: CondominiumStat[]
  monthlyTrends: MonthlyTrend[]
}

const CATEGORY_COLORS: Record<string, string> = {
  MANUTENCAO: "#059669", // Emerald
  CONVIVENCIA: "#2563eb", // Blue
  LIMPEZA: "#d97706",    // Amber
  SEGURANCA: "#dc2626",  // Red
  OUTROS: "#8b5cf6",     // Purple
}

const STATUS_COLORS: Record<string, string> = {
  OPEN: "#f59e0b",       // Amber
  IN_PROGRESS: "#3b82f6",// Blue
  RESOLVED: "#10b981",   // Emerald
  CLOSED: "#64748b",     // Slate
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [days, setDays] = useState<string>('all')
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Filtros
  const [selectedCondo, setSelectedCondo] = useState<string>("all")
  const [selectedPeriod, setSelectedPeriod] = useState<string>("all")

  const fetchStats = useCallback(async () => {
    try {
      setIsRefreshing(true)
      const token = localStorage.getItem("condoflow_token")
      
      const queryParams = new URLSearchParams()
      if (selectedCondo !== "all") queryParams.append("condominiumId", selectedCondo)
      if (selectedPeriod !== "all") queryParams.append("days", selectedPeriod)

      const url = `${process.env.NEXT_PUBLIC_API_URL}/dashboard/stats?${queryParams.toString()}`

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        console.error("Erro ao buscar estatísticas", response.status)
      }
    } catch (error) {
      console.error("Erro de conexão com servidor", error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [selectedCondo, selectedPeriod])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  if (isLoading && !stats) {
    return (
      <div className="flex flex-col justify-center items-center h-[70vh] space-y-4">
        <Loader2 className="animate-spin text-emerald-600" size={40} />
        <p className="text-sm font-medium text-slate-500">Carregando métricas do painel...</p>
      </div>
    )
  }

  // Prepara dados de gráficos com fallbacks seguros
  const categoryData = (stats?.categoryStats || []).map((cat) => ({
    name: cat.label,
    value: Number(cat.count),
    color: CATEGORY_COLORS[cat.category] || "#94a3b8",
  }))

  const statusData = (stats?.statusStats || []).map((st) => ({
    name: st.label,
    count: Number(st.count),
    fill: STATUS_COLORS[st.status] || "#64748b",
  }))

  const trendData = stats?.monthlyTrends || []
  const condoData = (stats?.condominiumStats || []).map((c) => ({
    name: c.name,
    "Usuários": Number(c.totalUsers),
    "Ocorrências": Number(c.totalOccurrences),
  }))

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* CABEÇALHO E TOOLBAR DE FILTROS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard Global SaaS</h1>
            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 text-[10px] uppercase font-bold">
              Live Metrics
            </Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Visão consolidada de condomínios, moradores, relatos e indicadores da plataforma.
          </p>
        </div>

        {/* BARRA DE FILTROS */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Filtro por Condomínio */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1">
            <Building2 className="w-3.5 h-3.5 text-slate-500" />
            <Select value={selectedCondo} onValueChange={setSelectedCondo}>
              <SelectTrigger className="border-none bg-transparent shadow-none h-8 text-xs font-medium focus:ring-0">
                <SelectValue placeholder="Selecione o Condomínio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Condomínios</SelectItem>
                {(stats?.condominiumStats || []).map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por Período */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="border-none bg-transparent shadow-none h-8 text-xs font-medium focus:ring-0">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todo o histórico</SelectItem>
                <SelectItem value="7">Últimos 7 dias</SelectItem>
                <SelectItem value="30">Últimos 30 dias</SelectItem>
                <SelectItem value="90">Últimos 90 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Botão de Atualizar */}
          <Button
            variant="outline"
            size="sm"
            onClick={fetchStats}
            disabled={isRefreshing}
            className="h-10 gap-2 border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Atualizar</span>
          </Button>
        </div>
      </div>

      {/* CARDS DE KPIS E MÉTRICAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Condomínios
            </CardTitle>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-slate-900">{stats?.totalCondominiums || 0}</div>
            <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Ativos na rede
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Usuários Ativos
            </CardTitle>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-slate-900">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-blue-600 font-semibold mt-1 flex items-center gap-1">
              <Users className="w-3 h-3" /> Moradores & Síndicos
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Ocorrências Totais
            </CardTitle>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-slate-900">{stats?.totalOccurrences || 0}</div>
            <p className="text-xs text-amber-600 font-semibold mt-1 flex items-center gap-1">
              {stats?.openOccurrences || 0} abertas · {stats?.inProgressOccurrences || 0} em andamento
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Taxa de Resolução
            </CardTitle>
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-slate-900">
              {stats?.resolutionRate || 0}%
            </div>
            {/* Barra de Progresso */}
            <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, stats?.resolutionRate || 0)}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SEÇÃO DE GRÁFICOS PRINCIPAIS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* GRÁFICO 1: EVOLUÇÃO TEMPORAL */}
        <Card className="lg:col-span-2 border-slate-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  Evolução Mensal de Ocorrências
                </CardTitle>
                <CardDescription className="text-xs">
                  Volume total e quantidade de ocorrências resolvidas nos últimos meses.
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono">
                Tendência Recente
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                  />
                  <Legend wrapperStyle={{ paddingTop: 10, fontSize: 12 }} />
                  <Area type="monotone" dataKey="total" name="Total Ocorrências" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
                  <Area type="monotone" dataKey="resolved" name="Resolvidas" stroke="#059669" strokeWidth={2} fillOpacity={1} fill="url(#colorResolved)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* GRÁFICO 2: DISTRIBUIÇÃO POR CATEGORIA (PIE / DONUT) */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-emerald-600" />
              Por Categoria
            </CardTitle>
            <CardDescription className="text-xs">
              Proporção dos tipos de ocorrências registradas.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2 flex flex-col items-center justify-center">
            {categoryData.length > 0 ? (
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-slate-400 text-xs italic">
                Nenhum dado de categoria disponível.
              </div>
            )}

            {/* Legenda customizada */}
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {categoryData.map((item, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}: <strong>{item.value}</strong></span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SEÇÃO SECUNDÁRIA DE GRÁFICOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GRÁFICO 3: STATUS OPERACIONAL */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              Distribuição por Status
            </CardTitle>
            <CardDescription className="text-xs">
              Situação atual das solicitações no fluxo de atendimento.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                  <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#334155" }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0" }}
                  />
                  <Bar dataKey="count" name="Quantidade" radius={[0, 8, 8, 0]}>
                    {statusData.map((entry, index) => (
                      <Cell key={`status-cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* GRÁFICO 4: RANKING DE CONDOMÍNIOS */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              Condomínios: Usuários vs Ocorrências
            </CardTitle>
            <CardDescription className="text-xs">
              Comparativo de população e chamados entre os condomínios cadastrados.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={condoData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#64748b" }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0" }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="Usuários" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Ocorrências" fill="#059669" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* TABELA RESUMO DE CONDOMÍNIOS DA REDE */}
      <Card className="border-slate-200 shadow-sm bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                Resumo Geral dos Condomínios
              </CardTitle>
              <CardDescription className="text-xs">
                Métricas detalhadas por condomínio ativo na plataforma.
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs font-semibold">
              {stats?.condominiumStats?.length || 0} Condomínios Registrados
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-y border-slate-200 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Condomínio</th>
                  <th className="py-3 px-4 text-center">Usuários</th>
                  <th className="py-3 px-4 text-center">Ocorrências Totais</th>
                  <th className="py-3 px-4 text-right">Status do SaaS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(stats?.condominiumStats || []).map((condo) => (
                  <tr key={condo.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      {condo.name}
                    </td>
                    <td className="py-3.5 px-4 text-center text-slate-700 font-medium">
                      {condo.totalUsers}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Badge variant="secondary" className="font-semibold text-slate-800">
                        {condo.totalOccurrences} relatos
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-[11px] font-medium">
                        Ativo
                      </Badge>
                    </td>
                  </tr>
                ))}
                {(!stats?.condominiumStats || stats.condominiumStats.length === 0) && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400 text-xs italic">
                      Nenhum condomínio cadastrado até o momento.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}