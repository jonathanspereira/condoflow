"use client"

import React, { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, RefreshCw, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

interface SystemLog {
  id: number
  type: string
  action: string
  message: string
  status: string
  details: string
  target: string
  createdAt: string
}

export default function LogsPage() {
  const [logs, setLogs] = useState<SystemLog[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("todos")
  const [selectedLog, setSelectedLog] = useState<SystemLog | null>(null)

  const fetchLogs = async (type?: string) => {
    setIsLoading(true)
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("condoflow_token") : ""
      let url = `${process.env.NEXT_PUBLIC_API_URL}/logs`
      if (type) {
        url += `?type=${type}`
      }
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setLogs(data)
      }
    } catch (error) {
      console.error("Erro ao buscar logs:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === "todos") {
      fetchLogs()
    } else if (activeTab === "email") {
      fetchLogs("EMAIL")
    }
  }, [activeTab])

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      }).format(date)
    } catch {
      return dateString
    }
  }

  const renderTable = () => (
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow className="text-xs uppercase">
            <TableHead>Data/Hora</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Ação</TableHead>
            <TableHead>Alvo (Quem)</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Detalhes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                Carregando logs...
              </TableCell>
            </TableRow>
          ) : logs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-slate-500 font-medium text-sm">
                Nenhum log encontrado.
              </TableCell>
            </TableRow>
          ) : (
            logs.map(log => (
              <TableRow key={log.id} className="text-sm">
                <TableCell className="font-medium text-slate-600 whitespace-nowrap">
                  {formatDate(log.createdAt)}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[10px] uppercase font-bold text-slate-500">
                    {log.type}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">{log.action}</TableCell>
                <TableCell className="text-slate-600">{log.target || "-"}</TableCell>
                <TableCell>
                  {log.status === "SUCCESS" ? (
                    <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-none font-bold text-[10px]">SUCESSO</Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-none font-bold text-[10px]">ERRO</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-start gap-2 max-w-[300px]">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 truncate">{log.message}</p>
                      {log.details && (
                        <p className="text-xs text-red-500 truncate mt-1">
                          {log.details}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0 text-slate-400 hover:text-slate-700"
                      onClick={() => setSelectedLog(log)}
                      title="Ver mensagem completa"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Logs do Sistema</h1>
          <p className="text-slate-500">Acompanhamento e auditoria de ações no CondoFlow.</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => activeTab === "todos" ? fetchLogs() : fetchLogs("EMAIL")}
          className="gap-2"
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> Atualizar
        </Button>
      </div>

      <Card className="shadow-sm border-slate-200">
        <CardHeader className="pb-4">
          <CardTitle>Histórico de Atividades</CardTitle>
          <CardDescription>
            Visualize logs de envio de e-mail e outras ações críticas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="todos" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="mb-6 grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="todos">Todos os Logs</TabsTrigger>
              <TabsTrigger value="email">Apenas E-mail</TabsTrigger>
            </TabsList>
            
            <TabsContent value="todos" className="mt-0">
              {renderTable()}
            </TabsContent>
            
            <TabsContent value="email" className="mt-0">
              {renderTable()}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Modal de detalhes completos do log */}
      <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-800">
              Detalhes do Log
              {selectedLog && (
                <Badge
                  className={`ml-1 text-[10px] font-bold border-none ${
                    selectedLog.status === "SUCCESS"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {selectedLog.status === "SUCCESS" ? "SUCESSO" : "ERRO"}
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              {selectedLog && formatDate(selectedLog.createdAt)}
              {selectedLog?.target && ` • ${selectedLog.target}`}
            </DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4 pt-2">
              <div className="flex gap-2 flex-wrap">
                <Badge variant="outline" className="text-[10px] uppercase font-bold text-slate-500">
                  {selectedLog.type}
                </Badge>
                <span className="text-xs font-semibold text-slate-600">{selectedLog.action}</span>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Mensagem</p>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <p className="text-sm text-slate-800 whitespace-pre-wrap break-words leading-relaxed">
                    {selectedLog.message || "—"}
                  </p>
                </div>
              </div>

              {selectedLog.details && (
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-red-500 uppercase tracking-wide">Detalhes do Erro</p>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 max-h-48 overflow-y-auto">
                    <p className="text-xs text-red-700 font-mono whitespace-pre-wrap break-words leading-relaxed">
                      {selectedLog.details}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
