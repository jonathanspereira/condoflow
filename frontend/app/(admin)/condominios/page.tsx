"use client"

import React, { useState, useRef } from "react"
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
  Home,
  FileUp,
  Download,
  AlertTriangle,
  Check,
  ChevronLeft,
  ChevronRight
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
import { Separator } from "@/components/ui/separator"

// --- COMPONENTE DE IMPORTAÇÃO EM MASSA ---
function ImportadorUnidades({ condoNome }: { condoNome: string }) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<any[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      // Simulação de parsing de CSV para Preview
      setPreview([
        { unidade: "101", proprietario: "João Silva", email: "joao@email.com" },
        { unidade: "102", proprietario: "Maria Souza", email: "maria@email.com" },
        { unidade: "201", proprietario: "Pedro Alcântara", email: "pedro@email.com" },
      ])
    }
  }

  const baixarModelo = () => {
    const csvContent = "unidade,proprietario,email\n101,João Silva,joao@email.com\n102,Maria Souza,maria@email.com"
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `modelo_importacao_${condoNome.toLowerCase().replace(/\s/g, '_')}.csv`
    a.click()
  }

  return (
    <div className="space-y-4 border-t pt-6 mt-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-slate-700 uppercase tracking-tight">Importação em Massa</h4>
        <Button variant="link" size="sm" className="text-emerald-600 h-auto p-0 gap-1" onClick={baixarModelo}>
          <Download size={14} /> Baixar Modelo .CSV
        </Button>
      </div>

      {!file ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <FileUp size={28} className="text-slate-400 mb-2" />
          <p className="text-xs font-medium text-slate-600">Clique para selecionar a planilha de moradores</p>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv" className="hidden" />
        </div>
      ) : (
        <div className="space-y-3">
          <div className="bg-emerald-50 border border-emerald-200 p-2 rounded flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-emerald-700 font-medium">
              <Check size={14} /> {file.name} pronto para processar
            </span>
            <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={() => {setFile(null); setPreview([])}}>Trocar</Button>
          </div>

          <div className="border rounded-md max-h-[150px] overflow-y-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow className="text-[10px] uppercase">
                  <TableHead className="h-8">Unidade</TableHead>
                  <TableHead className="h-8">Nome</TableHead>
                  <TableHead className="h-8">E-mail</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {preview.map((row, idx) => (
                  <TableRow key={idx} className="text-[11px]">
                    <TableCell className="py-2 font-bold">{row.unidade}</TableCell>
                    <TableCell className="py-2">{row.proprietario}</TableCell>
                    <TableCell className="py-2 text-slate-500">{row.email}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Button className="w-full bg-emerald-600 hover:bg-emerald-700 font-bold h-9 text-xs">
            Confirmar Importação de {preview.length} Unidades
          </Button>
        </div>
      )}
    </div>
  )
}

// --- PÁGINA PRINCIPAL ---
const CONDOMINIOS_MOCK = [
  { id: "1", nome: "Solar das Palmeiras", codigo: "SOLAR-123", sindico: "jonathan@email.com", cidade: "Recife - PE", status: "Ativo" },
  { id: "2", nome: "Residencial Vista Mar", codigo: "MAR-99", sindico: "marcos@sindico.com", cidade: "Jaboatão - PE", status: "Inativo" }
]

export default function GestaoCondominios() {
  const [busca, setBusca] = useState("")

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Gestão Global</h1>
          <p className="text-slate-500">Controle de instâncias e unidades do ecossistema CondoFlow.</p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2 font-bold shadow-lg shadow-emerald-600/20 uppercase text-xs tracking-widest">
              <Plus size={18} /> Novo Condomínio
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Cadastrar Nova Instância</DialogTitle>
              <DialogDescription>Defina as credenciais base para o novo cliente SaaS.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="nome">Nome do Condomínio</Label>
                <Input id="nome" placeholder="Ex: Edf. Mirante do Sol" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="codigo">Código Único (ID)</Label>
                  <Input id="codigo" placeholder="MIRANTE-01" className="uppercase font-mono" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="sindico">E-mail do Síndico</Label>
                  <Input id="sindico" type="email" placeholder="sindico@email.com" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button className="bg-emerald-600 w-full">Finalizar e Criar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Toolbar de Filtro */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-xl border shadow-sm">
        <Search className="ml-2 text-slate-400" size={18} />
        <Input 
          placeholder="Filtrar base por nome, código ou e-mail..." 
          className="border-none shadow-none focus-visible:ring-0 text-slate-600"
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
                <TableHead className="font-bold text-slate-700">Condomínio</TableHead>
                <TableHead className="font-bold text-slate-700 text-center">Código de Acesso</TableHead>
                <TableHead className="font-bold text-slate-700">Síndico Responsável</TableHead>
                <TableHead className="font-bold text-slate-700">Status</TableHead>
                <TableHead className="text-right font-bold text-slate-700 pr-6">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {CONDOMINIOS_MOCK.map((condo) => (
                <TableRow key={condo.id} className="hover:bg-slate-50/30 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="bg-slate-900 p-2.5 rounded-lg text-emerald-500 shadow-inner">
                        <Building2 size={18}/>
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 leading-tight">{condo.nome}</p>
                        <p className="text-[10px] text-slate-400 flex items-center gap-1 uppercase tracking-tighter">
                          <MapPin size={10} /> {condo.cidade}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="font-mono text-[10px] border-slate-300 px-3 bg-slate-50 shadow-sm">
                       <Key size={10} className="mr-2 text-emerald-600" /> {condo.codigo}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600 font-medium">
                    <div className="flex items-center gap-2">
                       <User size={14} className="text-slate-400" /> {condo.sindico}
                    </div>
                  </TableCell>
                  <TableCell>
                    {condo.status === "Ativo" 
                      ? <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none px-3">Ativo</Badge>
                      : <Badge variant="secondary" className="text-slate-400 bg-slate-100 opacity-60">Inativo</Badge>
                    }
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex justify-end gap-1">
                      {/* MODAL GESTÃO DE UNIDADES */}
                      <Dialog>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-emerald-600 hover:bg-emerald-50">
                                <Users size={18} />
                              </Button>
                            </DialogTrigger>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">Gerenciar Proprietários</TooltipContent>
                        </Tooltip>
                        <DialogContent className="sm:max-w-[650px]">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-xl">
                               <Home className="text-emerald-600" /> Unidades: {condo.nome}
                            </DialogTitle>
                            <DialogDescription>Cadastre as unidades manualmente ou via planilha.</DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-6 py-4">
                            {/* Cadastro Individual */}
                            <div className="grid grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-inner">
                               <div className="space-y-1.5">
                                 <Label className="text-[10px] uppercase font-black text-slate-500">Unidade</Label>
                                 <Input placeholder="Apto 101" className="h-9 text-sm" />
                               </div>
                               <div className="space-y-1.5 col-span-2">
                                 <Label className="text-[10px] uppercase font-black text-slate-500">Proprietário (Nome e E-mail)</Label>
                                 <div className="space-y-1">
                                    <Input placeholder="Nome Completo" className="h-9 text-sm" />
                                    <Input placeholder="E-mail" type="email" className="h-9 text-sm" />
                                 </div>
                               </div>
                               <div className="flex items-end">
                                 <Button className="bg-slate-900 text-white w-full h-19 gap-2 font-bold text-xs uppercase">
                                   <Plus size={16}/> Add
                                 </Button>
                               </div>
                            </div>

                            {/* Importador em Massa */}
                            <ImportadorUnidades condoNome={condo.nome} />
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-blue-600 hover:bg-blue-50">
                            <Edit3 size={18} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">Editar Instância</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-600 hover:bg-red-50">
                            <Trash2 size={18} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">Excluir Permanente</TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TooltipProvider>
      </div>

      <div className="flex justify-between items-center text-xs font-medium text-slate-400 px-2">
        <p>Total de {CONDOMINIOS_MOCK.length} registros encontrados.</p>
        <div className="flex items-center gap-1">
           <Button variant="ghost" size="icon" className="h-8 w-8" disabled><ChevronLeft size={16}/></Button>
           <span className="px-3">Página 1</span>
           <Button variant="ghost" size="icon" className="h-8 w-8" disabled><ChevronRight size={16}/></Button>
        </div>
      </div>
    </div>
  )
}