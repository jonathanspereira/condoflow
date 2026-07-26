"use client"

import React, { useState, useRef, useEffect } from "react"
import { 
  Plus, 
  Search, 
  Building2, 
  Key, 
  MapPin, 
  User,
  Edit3,
  Trash2,
  Users,
  Home,
  FileUp,
  Download,
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

interface Condominium {
  id: number
  name: string
  cnpj: string
  address: string
}

// --- COMPONENTE DE IMPORTAÇÃO EM MASSA DE UNIDADES ---
function ImportadorUnidades({ condoNome }: { condoNome: string }) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<any[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
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
          <p className="text-xs font-medium text-slate-600">Clique para selecionar a planilha de moradores (.csv)</p>
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
export default function GestaoCondominios() {
  const [condominiums, setCondominiums] = useState<Condominium[]>([])
  const [busca, setBusca] = useState("")
  
  // Modais de Cadastro / Edição
  const [isNewOpen, setIsNewOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [selectedCondo, setSelectedCondo] = useState<Condominium | null>(null)

  // Campos do Formulário
  const [name, setName] = useState("")
  const [cnpj, setCnpj] = useState("")
  const [address, setAddress] = useState("")

  // Campos para cadastro manual de unidade dentro do modal de gerenciar proprietários
  const [ unidadeInput, setUnidadeInput ] = useState("")
  const [ nomeProprietario, setNomeProprietario ] = useState("")
  const [ emailProprietario, setEmailProprietario ] = useState("")

  const getToken = () => typeof window !== "undefined" ? localStorage.getItem("condoflow_token") : ""

  const fetchCondominiums = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/v1/condominiums", {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setCondominiums(data)
      }
    } catch (error) {
      console.error("Erro ao buscar condomínios:", error)
    }
  }

  useEffect(() => {
    fetchCondominiums()
  }, [])

  // Criar Condomínio
  const handleCreateCondominium = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("http://localhost:8080/api/v1/condominiums", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({ name, cnpj, address })
      })

      if (response.ok) {
        setIsNewOpen(false)
        setName("")
        setCnpj("")
        setAddress("")
        fetchCondominiums()
      }
    } catch (error) {
      console.error("Erro ao criar condomínio:", error)
    }
  }

  // Abrir Modal de Edição com os dados preenchidos
  const handleOpenEdit = (condo: Condominium) => {
    setSelectedCondo(condo)
    setName(condo.name)
    setCnpj(condo.cnpj)
    setAddress(condo.address)
    setIsEditOpen(true)
  }

  // Salvar Edição
  const handleUpdateCondominium = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCondo) return

    try {
      const response = await fetch(`http://localhost:8080/api/v1/condominiums/${selectedCondo.id}`, {
        method: "PUT", // ou PATCH dependendo do seu backend
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({ name, cnpj, address })
      })

      if (response.ok) {
        setIsEditOpen(false)
        setSelectedCondo(null)
        setName("")
        setCnpj("")
        setAddress("")
        fetchCondominiums()
      }
    } catch (error) {
      console.error("Erro ao atualizar condomínio:", error)
    }
  }

  // Excluir Condomínio
  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este condomínio permanentemente?")) return
    try {
      const response = await fetch(`http://localhost:8080/api/v1/condominiums/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      })
      if (response.ok) {
        fetchCondominiums()
      }
    } catch (error) {
      console.error("Erro ao excluir condomínio:", error)
    }
  }

  // Cadastrar Unidade Manualmente
  const handleAddUnidadeManual = () => {
    if (!unidadeInput || !nomeProprietario) {
      alert("Preencha os campos da unidade e do proprietário.")
      return
    }
    alert(`Unidade ${unidadeInput} de ${nomeProprietario} adicionada com sucesso!`)
    setUnidadeInput("")
    setNomeProprietario("")
    setEmailProprietario("")
  }

  const filteredCondominiums = condominiums.filter(condo => 
    condo.name.toLowerCase().includes(busca.toLowerCase()) || 
    condo.cnpj.includes(busca) ||
    condo.address.toLowerCase().includes(busca.toLowerCase())
  )

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Gestão Global</h1>
          <p className="text-slate-500">Controle de instâncias e unidades do ecossistema CondoFlow.</p>
        </div>

        {/* Botão Novo Condomínio */}
        <Dialog open={isNewOpen} onOpenChange={setIsNewOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => { setName(""); setCnpj(""); setAddress(""); setIsNewOpen(true); }}
              className="bg-emerald-600 hover:bg-emerald-700 gap-2 font-bold shadow-lg shadow-emerald-600/20 uppercase text-xs tracking-widest"
            >
              <Plus size={18} /> Novo Condomínio
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Cadastrar Nova Instância</DialogTitle>
              <DialogDescription>Defina as informações base para o novo condomínio.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateCondominium} className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="nome">Nome do Condomínio</Label>
                <Input 
                  id="nome" 
                  placeholder="Ex: Edf. Mirante do Sol" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input 
                    id="cnpj" 
                    placeholder="00.000.000/0001-00" 
                    value={cnpj} 
                    onChange={(e) => setCnpj(e.target.value)} 
                    required 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="address">Endereço</Label>
                  <Input 
                    id="address" 
                    placeholder="Rua Exemplo, 123" 
                    value={address} 
                    onChange={(e) => setAddress(e.target.value)} 
                    required 
                  />
                </div>
              </div>
              <DialogFooter className="pt-4">
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 w-full font-bold">
                  Finalizar e Criar
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Modal de Editar Condomínio */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Instância</DialogTitle>
            <DialogDescription>Atualize os dados cadastrais do condomínio.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateCondominium} className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-nome">Nome do Condomínio</Label>
              <Input 
                id="edit-nome" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-cnpj">CNPJ</Label>
                <Input 
                  id="edit-cnpj" 
                  value={cnpj} 
                  onChange={(e) => setCnpj(e.target.value)} 
                  required 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-address">Endereço</Label>
                <Input 
                  id="edit-address" 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)} 
                  required 
                />
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 w-full font-bold text-white">
                Salvar Alterações
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Toolbar de Busca */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-xl border shadow-sm">
        <Search className="ml-2 text-slate-400" size={18} />
        <Input 
          placeholder="Filtrar base por nome, CNPJ ou endereço..." 
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
                <TableHead className="font-bold text-slate-700 text-center">CNPJ</TableHead>
                <TableHead className="font-bold text-slate-700">Endereço</TableHead>
                <TableHead className="font-bold text-slate-700">Status</TableHead>
                <TableHead className="text-right font-bold text-slate-700 pr-6">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCondominiums.length > 0 ? (
                filteredCondominiums.map((condo) => (
                  <TableRow key={condo.id} className="hover:bg-slate-50/30 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="bg-slate-900 p-2.5 rounded-lg text-emerald-500 shadow-inner">
                          <Building2 size={18}/>
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-tight">{condo.name}</p>
                          <p className="text-[10px] text-slate-400 flex items-center gap-1 uppercase tracking-tighter">
                            <MapPin size={10} /> ID: {condo.id}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="font-mono text-[10px] border-slate-300 px-3 bg-slate-50 shadow-sm">
                         <Key size={10} className="mr-2 text-emerald-600" /> {condo.cnpj}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600 font-medium">
                      <div className="flex items-center gap-2">
                         <User size={14} className="text-slate-400" /> {condo.address}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none px-3">Ativo</Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end gap-1">
                        
                        {/* MODAL GESTÃO DE UNIDADES (Manual e Planilha) */}
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
                                 <Home className="text-emerald-600" /> Unidades: {condo.name}
                              </DialogTitle>
                              <DialogDescription>Cadastre as unidades manualmente ou via planilha.</DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-6 py-4">
                              {/* Cadastro Manual de Unidade */}
                              <div className="grid grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-inner">
                                 <div className="space-y-1.5">
                                   <Label className="text-[10px] uppercase font-black text-slate-500">Unidade</Label>
                                   <Input 
                                     placeholder="Apto 101" 
                                     className="h-9 text-sm bg-white" 
                                     value={unidadeInput}
                                     onChange={(e) => setUnidadeInput(e.target.value)}
                                   />
                                 </div>
                                 <div className="space-y-1.5 col-span-2">
                                   <Label className="text-[10px] uppercase font-black text-slate-500">Proprietário (Nome e E-mail)</Label>
                                   <div className="space-y-1">
                                      <Input 
                                        placeholder="Nome Completo" 
                                        className="h-9 text-sm bg-white" 
                                        value={nomeProprietario}
                                        onChange={(e) => setNomeProprietario(e.target.value)}
                                      />
                                      <Input 
                                        placeholder="E-mail" 
                                        type="email" 
                                        className="h-9 text-sm bg-white" 
                                        value={emailProprietario}
                                        onChange={(e) => setEmailProprietario(e.target.value)}
                                      />
                                   </div>
                                 </div>
                                 <div className="flex items-end">
                                   <Button 
                                     onClick={handleAddUnidadeManual}
                                     className="bg-slate-900 text-white w-full h-[72px] gap-2 font-bold text-xs uppercase hover:bg-slate-800"
                                   >
                                     <Plus size={16}/> Add
                                   </Button>
                                 </div>
                              </div>

                              {/* Importador em Massa (Planilha) */}
                              <ImportadorUnidades condoNome={condo.name} />
                            </div>
                          </DialogContent>
                        </Dialog>

                        {/* Botão de Editar Instância */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                              onClick={() => handleOpenEdit(condo)}
                            >
                              <Edit3 size={18} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">Editar Instância</TooltipContent>
                        </Tooltip>

                        {/* Botão de Excluir */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-slate-400 hover:text-red-600 hover:bg-red-50"
                              onClick={() => handleDelete(condo.id)}
                            >
                              <Trash2 size={18} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">Excluir Permanente</TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-slate-400">
                    Nenhum condomínio encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TooltipProvider>
      </div>

      <div className="flex justify-between items-center text-xs font-medium text-slate-400 px-2">
        <p>Total de {filteredCondominiums.length} registros encontrados.</p>
        <div className="flex items-center gap-1">
           <Button variant="ghost" size="icon" className="h-8 w-8" disabled><ChevronLeft size={16}/></Button>
           <span className="px-3">Página 1</span>
           <Button variant="ghost" size="icon" className="h-8 w-8" disabled><ChevronRight size={16}/></Button>
        </div>
      </div>
    </div>
  )
}