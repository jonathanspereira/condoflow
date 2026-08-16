"use client"

import React, { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"

export default function AdminDashboard() {
  const [stats, setStats] = useState<{ totalCondominiums: number; totalUsers: number; totalOccurrences: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const token = localStorage.getItem("condoflow_token")
        const response = await fetch("http://localhost:8080/api/v1/dashboard/stats", {
          headers: {
            Authorization: `Bearer ${token}`
          }
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
      }
    }

    fetchStats()
  }, [])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <Loader2 className="animate-spin text-emerald-600" size={32} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard Global</h1>
        <p className="text-slate-500">Bem-vindo à central de controle do CondoFlow SaaS.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Condomínios", value: stats?.totalCondominiums || "0", sub: "Cadastrados na plataforma" },
          { label: "Usuários Ativos", value: stats?.totalUsers || "0", sub: "Moradores e síndicos" },
          { label: "Ocorrências Totais", value: stats?.totalOccurrences || "0", sub: "Registradas em toda a rede" },
          { label: "MRR (Receita)", value: "R$ 0,00", sub: "Módulo financeiro pendente" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border shadow-sm">
            <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
            <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
            <p className="text-[10px] text-emerald-600 font-bold mt-1">{stat.sub}</p>
          </div>
        ))}
      </div>
      
      <div className="h-[300px] bg-slate-200/50 rounded-xl border-2 border-dashed flex items-center justify-center text-slate-400">
        Gráfico de Crescimento do SaaS (Pendente)
      </div>
    </div>
  )
}