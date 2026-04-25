"use client"

import React, { useState } from "react"
import { 
  Plus, 
  Search, 
  Building2, 
  Key, 
  MapPin, 
  User,
  CheckCircle2,
  XCircle,
  Edit3,
  Trash2,
  Users,
  Mail,
  Home
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const CONDOMINIOS_SaaS = [
  { id: "1", nome: "Solar das Palmeiras", codigo: "SOLAR-123", sindico: "jonathan@email.com", cidade: "Recife - PE", status: "Ativo" },
  { id: "2", nome: "Residencial Vista Mar", codigo: "MAR-99", sindico: "marcos@sindico.com", cidade: "Jaboatão - PE", status: "Inativo" }
]

export default function GestaoCondominios() {
  const [busca, setBusca] = useState("")

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gestão Global</h1>
          <p className="text-slate-500 text-sm">Controle de instâncias e unidades do ecossistema.</p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2 font-bold uppercase text-xs tracking-wider">
              <Plus size={16} /> Novo Condomínio
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Condomínio</DialogTitle>
              <DialogDescription>Cadastre a base do cliente no SaaS.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Nome do Condomínio</Label>
                <Input placeholder="Ex: Edf. Alpha" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Código Único (IDs)</Label>
                  <Input placeholder="ALPHA-01" className="uppercase font-mono" />
                </div>
                <div className="grid gap-2">
                  <Label>Síndico (E-mail)</Label>
                  <Input type="email" placeholder="admin@condo.com" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button className="bg-emerald-600 w-full">Finalizar Cadastro</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-lg border shadow-sm">
        <Search className="ml-2 text-slate-400" size={18} />
        <Input 
          placeholder="Filtrar base de dados..." 
          className="border-none shadow-none focus-visible:ring-0"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {/* Tabela Principal */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <TooltipProvider>
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="font-bold text-slate-700">Condomínio / Local</TableHead>
                <TableHead className="font-bold text-slate-700">Código</TableHead>
                <TableHead className="font-bold text-slate-700">Responsável</TableHead>
                <TableHead className="font-bold text-slate-700">Status</TableHead>
                <TableHead className="text-right font-bold text-slate-700">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {CONDOMINIOS_SaaS.map((condo) => (
                <TableRow key={condo.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="bg-slate-900 p-2 rounded text-emerald-500"><Building2 size={16}/></div>
                      <div>
                        <p className="font-bold text-slate-900 leading-tight">{condo.nome}</p>
                        <p className="text-[10px] text-slate-500 uppercase">{condo.cidade}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-[10px] border-slate-300">{condo.codigo}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">{condo.sindico}</TableCell>
                  <TableCell>
                    {condo.status === "Ativo" 
                      ? <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none">Ativo</Badge>
                      : <Badge variant="secondary" className="text-slate-400 opacity-50">Inativo</Badge>
                    }
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {/* MODAL DE UNIDADES */}
                      <Dialog>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-emerald-600">
                                <Users size={18} />
                              </Button>
                            </DialogTrigger>
                          </TooltipTrigger>
                          <TooltipContent>Gerenciar Unidades/Proprietários</TooltipContent>
                        </Tooltip>
                        <DialogContent className="sm:max-w-[600px]">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                               <Home className="text-emerald-600" /> Unidades: {condo.nome}
                            </DialogTitle>
                            <DialogDescription>Vincule proprietários às unidades deste condomínio.</DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4 py-4">
                            <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-lg border border-dashed border-slate-300">
                               <div className="space-y-1">
                                 <Label className="text-[10px] uppercase font-bold text-slate-500">Unidade</Label>
                                 <Input placeholder="Ex: 402" className="h-8" />
                               </div>
                               <div className="space-y-1 col-span-2">
                                 <Label className="text-[10px] uppercase font-bold text-slate-500">Nome do Proprietário</Label>
                                 <div className="flex gap-2">
                                    <Input placeholder="Nome Completo" className="h-8" />
                                    <Button size="sm" className="bg-emerald-600 h-8 px-2"><Plus size={14}/></Button>
                                 </div>
                               </div>
                               <div className="col-span-3 space-y-1">
                                 <Label className="text-[10px] uppercase font-bold text-slate-500">E-mail do Proprietário</Label>
                                 <Input type="email" placeholder="proprietario@email.com" className="h-8" />
                               </div>
                            </div>

                            <div className="max-h-[200px] overflow-y-auto border rounded-md">
                               <Table>
                                 <TableBody>
                                    <TableRow className="text-xs">
                                      <TableCell className="font-bold">Apto 101</TableCell>
                                      <TableCell>Ricardo Oliveira</TableCell>
                                      <TableCell className="text-slate-400 italic">ricardo@email.com</TableCell>
                                      <TableCell className="text-right"><Button variant="ghost" size="sm" className="text-red-500 h-6 w-6 p-0"><Trash2 size={12}/></Button></TableCell>
                                    </TableRow>
                                 </TableBody>
                               </Table>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-blue-600">
                            <Edit3 size={18} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Editar Condomínio</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-600">
                            <Trash2 size={18} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Excluir Instância</TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TooltipProvider>
      </div>
    </div>
  )
}