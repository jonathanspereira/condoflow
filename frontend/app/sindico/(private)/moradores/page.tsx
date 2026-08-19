"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building, Loader2, User, KeySquare } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"

interface CondominiumOption {
  id: number
  name: string
}

interface UnitData {
  id: number
  unit: string
  condominiumId: number
  ownerId: string
  ownerName: string
  ownerEmail: string
  rented: boolean
  tenantId?: string
  tenantName?: string
  tenantEmail?: string
}

export default function MoradoresPage() {
  const [condominios, setCondominios] = useState<CondominiumOption[]>([])
  const [selectedCondoId, setSelectedCondoId] = useState<string>("")
  const [units, setUnits] = useState<UnitData[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const getToken = () => (typeof window !== "undefined" ? localStorage.getItem("condoflow_token") : "")

  // Carrega condomínios vinculados ao síndico
  useEffect(() => {
    async function loadCondominios() {
      try {
        const res = await fetch("http://localhost:8080/api/v1/condominiums/me", {
          headers: { Authorization: `Bearer ${getToken()}` },
        })
        if (res.ok) {
          const data = await res.json()
          setCondominios(data)
          if (data.length > 0) {
            setSelectedCondoId(String(data[0].id))
          }
        }
      } catch (err) {
        console.error("Erro ao carregar condomínios:", err)
      }
    }
    loadCondominios()
  }, [])

  // Carrega unidades e moradores do condomínio selecionado
  useEffect(() => {
    async function fetchMoradores() {
      if (!selectedCondoId) return
      setIsLoading(true)
      try {
        const res = await fetch(`http://localhost:8080/api/v1/units/condominium/${selectedCondoId}`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        })
        if (res.ok) {
          const data: UnitData[] = await res.json()
          setUnits(data)
        } else {
          toast.error("Erro ao carregar moradores do condomínio.")
        }
      } catch (error) {
        console.error("Erro de conexão ao buscar moradores:", error)
        toast.error("Erro de conexão ao buscar moradores.")
      } finally {
        setIsLoading(false)
      }
    }
    fetchMoradores()
  }, [selectedCondoId])

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Moradores e Unidades</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie os moradores, proprietários e inquilinos do condomínio.
          </p>
        </div>

        {condominios.length > 0 && (
          <div className="flex items-center gap-2 bg-white p-2 rounded-lg border shadow-sm">
            <Building className="h-4 w-4 text-slate-500" />
            <Select value={selectedCondoId} onValueChange={setSelectedCondoId}>
              <SelectTrigger className="w-[200px] h-8 text-xs border-none focus:ring-0">
                <SelectValue placeholder="Selecione o condomínio" />
              </SelectTrigger>
              <SelectContent>
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

      <Card className="shadow-sm">
        <CardHeader className="pb-4 border-b border-slate-100">
          <CardTitle className="text-lg">Lista de Moradores</CardTitle>
          <CardDescription>
            Visão geral de quem reside em cada unidade (Proprietários ou Inquilinos).
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 p-0 md:p-6">
          <div className="rounded-md border bg-white overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="w-[120px]">Unidade</TableHead>
                  <TableHead>Proprietário</TableHead>
                  <TableHead>Morador Atual (Inquilino)</TableHead>
                  <TableHead>Status da Unidade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                        <span>Carregando dados das unidades...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : units.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                      Nenhuma unidade encontrada para o condomínio selecionado.
                    </TableCell>
                  </TableRow>
                ) : (
                  units.map((u) => (
                    <TableRow key={u.id} className="hover:bg-slate-50/70">
                      <TableCell className="font-medium text-slate-900">
                        {u.unit}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm text-slate-800">{u.ownerName}</span>
                          <span className="text-xs text-muted-foreground">{u.ownerEmail}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {u.rented ? (
                          <div className="flex flex-col">
                            <span className="font-semibold text-sm text-blue-700">{u.tenantName}</span>
                            <span className="text-xs text-muted-foreground">{u.tenantEmail}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Mesmo que o proprietário</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {u.rented ? (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                            <User className="w-3 h-3 mr-1" />
                            Alugada
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                            <KeySquare className="w-3 h-3 mr-1" />
                            Própria
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
