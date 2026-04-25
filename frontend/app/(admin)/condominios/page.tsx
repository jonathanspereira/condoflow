"use client"

import React, { useState } from "react"
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Building2, 
  Key, 
  MapPin, 
  User,
  CheckCircle2,
  XCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"

// MOCK INICIAL DE CONDOMÍNIOS NO SISTEMA
const CONDOMINIOS_SaaS = [
  {
    id: "1",
    nome: "Solar das Palmeiras",
    codigo: "SOLAR-123",
    sindico: "jonathan@email.com",
    cidade: "Recife - PE",
    status: "Ativo",
  },
  {
    id: "2",
    nome: "Residencial Vista Mar",
    codigo: "MAR-99",
    sindico: "marcos@sindico.com",
    cidade: "Jaboatão - PE",
    status: "Inativo",
  }
]

export default function GestaoCondominios() {
  const [busca, setBusca] = useState("")

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Gestão de Condomínios</h1>
          <p className="text-slate-500">Cadastre e gerencie as instâncias de clientes do sistema.</p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2 shadow-lg shadow-emerald-600/20">
              <Plus size={18} /> Novo Condomínio
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Cliente</DialogTitle>
              <DialogDescription>
                Insira os dados do prédio e gere o código de acesso para os moradores.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="nome">Nome do Condomínio</Label>
                <Input id="nome" placeholder="Ex: Edifício Horizonte" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="codigo">Código de Acesso</Label>
                  <Input id="codigo" placeholder="HORIZ-10" className="font-mono uppercase" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cidade">Cidade/UF</Label>
                  <Input id="cidade" placeholder="Recife - PE" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sindico">E-mail do Síndico Responsável</Label>
                <Input id="sindico" type="email" placeholder="sindico@email.com" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline">Cancelar</Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700">Criar Instância</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Toolbar de Busca */}
      <div className="flex items-center gap-2 bg-white p-4 rounded-xl border shadow-sm">
        <Search className="text-slate-400" size={20} />
        <Input 
          placeholder="Buscar por nome, código ou síndico..." 
          className="border-none shadow-none focus-visible:ring-0 text-base"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {/* Tabela de Dados */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[300px]">Condomínio</TableHead>
              <TableHead>Código ID</TableHead>
              <TableHead>Síndico Responsável</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {CONDOMINIOS_SaaS.map((condo) => (
              <TableRow key={condo.id} className="hover:bg-slate-50/50 transition-colors">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-100 p-2 rounded-lg">
                      <Building2 size={18} className="text-slate-600" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{condo.nome}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <MapPin size={10} /> {condo.cidade}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-mono bg-slate-50 text-slate-700 border-slate-200">
                    <Key size={12} className="mr-1" /> {condo.codigo}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <User size={14} /> {condo.sindico}
                  </div>
                </TableCell>
                <TableCell>
                  {condo.status === "Ativo" ? (
                    <div className="flex items-center gap-1.5 text-emerald-600 font-medium text-sm">
                      <CheckCircle2 size={16} /> Ativo
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-slate-400 font-medium text-sm">
                      <XCircle size={16} /> Inativo
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal size={18} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex justify-between items-center text-sm text-slate-500 px-2">
        <p>Mostrando {CONDOMINIOS_SaaS.length} condomínios ativos na plataforma.</p>
        <div className="flex gap-2">
           <Button variant="outline" size="sm" disabled>Anterior</Button>
           <Button variant="outline" size="sm" disabled>Próximo</Button>
        </div>
      </div>
    </div>
  )
}