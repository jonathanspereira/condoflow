"use client"

import React, { useState } from "react"
import Link from "next/link" // Importante para a navegação
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  Eye, 
  MessageSquare,
  Filter
} from "lucide-react"

// MOCK DE DADOS
const MOCK_DATA = [
  {
    id: "CF-2026-A12",
    titulo: "Lâmpada queimada no corredor",
    status: "CONCLUIDO",
    data: "20/04/2026",
    categoria: "Manutenção"
  },
  {
    id: "CF-2026-B05",
    titulo: "Barulho excessivo apto 502",
    status: "EM_EXECUCAO",
    data: "22/04/2026",
    categoria: "Convivência"
  }
]

export default function MinhasOcorrencias() {
  const [searchTerm, setSearchTerm] = useState("")

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Minhas Ocorrências</h1>
          <p className="text-muted-foreground text-sm">Acompanhe o progresso dos seus relatos.</p>
        </div>
        <Button className="gap-2">
          <MessageSquare className="h-4 w-4" />
          Novo Relato
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-bold text-slate-500">Total Enviado</CardDescription>
            <CardTitle className="text-2xl font-bold">02</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-bold text-blue-500">Em Resolução</CardDescription>
            <CardTitle className="text-2xl font-bold">01</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-bold text-green-500">Resolvidos</CardDescription>
            <CardTitle className="text-2xl font-bold">01</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar ocorrência..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border bg-white">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50">
                  <TableHead className="w-[120px]">Protocolo</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_DATA.map((item) => (
                  <TableRow key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="font-mono text-xs font-bold text-primary">{item.id}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-900">{item.titulo}</span>
                        <span className="text-[10px] text-muted-foreground uppercase font-semibold">{item.categoria}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.status === "CONCLUIDO" ? "default" : "secondary"} className="text-[10px]">
                        {item.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {/* LINK PARA A TELA DINÂMICA [ID] */}
                      <Link href={`/minhas-ocorrencias/${item.id}`}>
                        <Button variant="ghost" size="icon" className="hover:text-primary">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}