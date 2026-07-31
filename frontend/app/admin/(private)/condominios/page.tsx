"use client"

import React, { useState, useRef, useEffect } from "react"
import { 
  Plus, 
  Search, 
  Building2, 
  Key, 
  MapPin, 
  Edit3,
  Trash2,
  Users,
  Home,
  FileUp,
  Download,
  Check,
  ChevronLeft,
  ChevronRight,
  Mail,
  Loader2
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
import { TooltipProvider } from "@/components/ui/tooltip"

interface Condominium {
  id: number
  name: string
  cnpj: string
  address: string
}

interface UnidadeProprietario {
  id?: number
  unidade: string
  proprietario: string
  email: string
  role?: string
  condominiumId?: number
}

// --- COMPONENTE DE IMPORTAÇÃO EM MASSA (CSV REAL) ---
function ImportadorUnidades({ condoId, condoNome, onImport }: { condoId: number, condoNome: string, onImport: () => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<UnidadeProprietario[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getToken = () => typeof window !== "undefined" ? localStorage.getItem("condoflow_token") : ""

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      
      const reader = new FileReader()
      reader.onload = (event) => {
        const text = event.target?.result as string
        if (!text) return

        const linhas = text.split("\n")
        const parsedData: UnidadeProprietario[] = []

        for (let i = 1; i < linhas.length; i++) {
          const linha = linhas[i].trim()
          if (!linha) continue
          const colunas = linha.split(",")
          if (colunas.length >= 3) {
            parsedData.push({
              unidade: colunas[0].trim(),
              proprietario: colunas[1].trim(),
              email: colunas[2].trim(),
              role: "PROPRIETARY",
              condominiumId: condoId
            })
          }
        }
        setPreview(parsedData)
      }
      reader.readAsText(selectedFile)
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

  const handleConfirmImport = async () => {
    setIsUploading(true)
    try {
      for (const item of preview) {
        await fetch(`http://localhost:8080/api/v1/units`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`
          },
          body: JSON.stringify({
            unit: item.unidade,
            name: item.proprietario,
            email: item.email,
            role: "PROPRIETARY",
            condominiumId: condoId
          })
        })
      }
      onImport()
      setFile(null)
      setPreview([])
    } catch (error) {
      console.error("Erro ao importar unidades em massa:", error)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-4 border-t pt-6 mt-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-slate-700 uppercase tracking-tight">Importação em Massa (CSV)</h4>
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
          <p className="text-xs font-medium text-slate-600">Clique para selecionar o arquivo .csv de proprietários</p>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv" className="hidden" />
        </div>
      ) : (
        <div className="space-y-3">
          <div className="bg-emerald-50 border border-emerald-200 p-2 rounded flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-emerald-700 font-medium">
              <Check size={14} /> {file.name} lido com sucesso ({preview.length} registros)
            </span>
            <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={() => {setFile(null); setPreview([])}}>Trocar</Button>
          </div>

          {preview.length > 0 && (
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
          )}

          <Button 
            onClick={handleConfirmImport}
            disabled={isUploading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 font-bold h-9 text-xs gap-2"
          >
            {isUploading && <Loader2 className="h-4 w-4 animate-spin" />}
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
  
  const [isNewOpen, setIsNewOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isSindicoOpen, setIsSindicoOpen] = useState(false)
  const [selectedCondo, setSelectedCondo] = useState<Condominium | null>(null)

  const [name, setName] = useState("")
  const [cnpj, setCnpj] = useState("")
  const [address, setAddress] = useState("")
  const [emailSindico, setEmailSindico] = useState("")

  const [unidadesList, setUnidadesList] = useState<UnidadeProprietario[]>([])
  const [buscaProprietario, setBuscaProprietario] = useState("")
  const [unidadeInput, setUnidadeInput] = useState("")
  const [nomeProprietario, setNomeProprietario] = useState("")
  const [emailProprietario, setEmailProprietario] = useState("")
  const [isSavingUnit, setIsSavingUnit] = useState(false)
  
  const [editIdUnidade, setEditIdUnidade] = useState<number | null>(null)

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

  const fetchUnitsForCondo = async (condoId: number) => {
    try {
      // Rota corrigida para bater no UnitController isolado
      const response = await fetch(`http://localhost:8080/api/v1/units/condominium/${condoId}`, {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setUnidadesList(data)
      }
    } catch (error) {
      console.error("Erro ao buscar unidades:", error)
    }
  }

  useEffect(() => {
    fetchCondominiums()
  }, [])

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

  const handleOpenEdit = (condo: Condominium) => {
    setSelectedCondo(condo)
    setName(condo.name)
    setCnpj(condo.cnpj)
    setAddress(condo.address)
    setIsEditOpen(true)
  }

  const handleOpenSindico = (condo: Condominium) => {
    setSelectedCondo(condo)
    setEmailSindico("")
    setIsSindicoOpen(true)
  }

  const handleVincularSindico = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCondo || !emailSindico) return

    alert(`Síndico com e-mail ${emailSindico} vinculado ao condomínio ${selectedCondo.name} com sucesso!`)
    setIsSindicoOpen(false)
    setEmailSindico("")
    setSelectedCondo(null)
  }

  const handleUpdateCondominium = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCondo) return

    try {
      const response = await fetch(`http://localhost:8080/api/v1/condominiums/${selectedCondo.id}`, {
        method: "PUT",
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

  const handleSaveUnidade = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!unidadeInput || !nomeProprietario || !selectedCondo) {
      alert("Preencha a unidade e o nome do proprietário.")
      return
    }

    setIsSavingUnit(true)
    try {
      const payload = {
        unit: unidadeInput,
        name: nomeProprietario,
        email: emailProprietario || "N/D",
        role: "PROPRIETARY",
        condominiumId: selectedCondo.id
      }

      const url = editIdUnidade !== null 
        ? `http://localhost:8080/api/v1/units/${editIdUnidade}`
        : `http://localhost:8080/api/v1/units`

      const method = editIdUnidade !== null ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        fetchUnitsForCondo(selectedCondo.id)
        setUnidadeInput("")
        setNomeProprietario("")
        setEmailProprietario("")
        setEditIdUnidade(null)
      }
    } catch (error) {
      console.error("Erro ao salvar proprietário:", error)
    } finally {
      setIsSavingUnit(false)
    }
  }

  const handleEditUnidade = (item: UnidadeProprietario) => {
    if (item.id) {
      setEditIdUnidade(item.id)
      setUnidadeInput(item.unidade)
      setNomeProprietario(item.proprietario)
      setEmailProprietario(item.email)
    }
  }

  const handleRemoveUnidade = async (item: UnidadeProprietario) => {
    if (!selectedCondo || !item.id) return
    if (!confirm("Tem certeza que deseja excluir esta unidade?")) return

    try {
      const response = await fetch(`http://localhost:8080/api/v1/units/${item.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      })
      if (response.ok) {
        fetchUnitsForCondo(selectedCondo.id)
      }
    } catch (error) {
      console.error("Erro ao excluir unidade:", error)
    }
  }

  const filteredCondominiums = condominiums.filter(condo => 
    condo.name.toLowerCase().includes(busca.toLowerCase()) || 
    condo.cnpj.includes(busca) ||
    condo.address.toLowerCase().includes(busca.toLowerCase())
  )

  const unidadesFiltradas = unidadesList.filter(item =>
    item.proprietario?.toLowerCase().includes(buscaProprietario.toLowerCase()) ||
    item.unidade?.toLowerCase().includes(buscaProprietario.toLowerCase()) ||
    item.email?.toLowerCase().includes(buscaProprietario.toLowerCase())
  )

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Gestão Global</h1>
          <p className="text-slate-500">Controle de instâncias e unidades do ecossistema CondoFlow.</p>
        </div>

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

      {/* Modal para Vincular Síndico por E-mail */}
      <Dialog open={isSindicoOpen} onOpenChange={setIsSindicoOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Vincular Síndico</DialogTitle>
            <DialogDescription>Informe o e-mail do síndico responsável para associar a este condomínio.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleVincularSindico} className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email-sindico">E-mail do Síndico</Label>
              <Input 
                id="email-sindico" 
                type="email"
                placeholder="sindico@condominio.com" 
                value={emailSindico} 
                onChange={(e) => setEmailSindico(e.target.value)} 
                required 
              />
            </div>
            <DialogFooter className="pt-4">
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 w-full font-bold text-white">
                Vincular Síndico
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="flex items-center gap-2 bg-white p-2 rounded-xl border shadow-sm">
        <Search className="ml-2 text-slate-400" size={18} />
        <Input 
          placeholder="Filtrar base por nome, CNPJ ou endereço..." 
          className="border-none shadow-none focus-visible:ring-0 text-slate-600"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

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
                            ID: {condo.id}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                       <Badge variant="outline" className="inline-flex items-center gap-2 font-mono text-[10px] border-slate-300 px-3 bg-slate-50 shadow-sm whitespace-nowrap">
                         <Key size={10} className="shrink-0 text-emerald-600" /> <span>{condo.cnpj}</span>
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600 font-medium">
                      <div className="flex items-center gap-2">
                         <MapPin size={14} className="text-slate-400" /> {condo.address}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none px-3">Ativo</Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end gap-1">
                        
                        {/* MODAL GESTÃO DE UNIDADES E PROPRIETÁRIOS */}
                        <Dialog onOpenChange={(open) => {
                          if (open) {
                            setSelectedCondo(condo)
                            fetchUnitsForCondo(condo.id)
                          }
                        }}>
                          <TooltipProvider>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-emerald-600 hover:bg-emerald-50">
                                <Users size={18} />
                              </Button>
                            </DialogTrigger>
                          </TooltipProvider>
                          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2 text-xl">
                                 <Home className="text-emerald-600" /> Unidades e Proprietários: {condo.name}
                              </DialogTitle>
                              <DialogDescription>Cadastre proprietários com perfil PROPRIETARY, importe via planilha CSV ou filtre.</DialogDescription>
                            </DialogHeader>
                             
                            <div className="space-y-6 py-4">
                              <form onSubmit={handleSaveUnidade} className="grid grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-inner">
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
                                    type="submit"
                                    disabled={isSavingUnit}
                                    className={`w-full h-[72px] gap-2 font-bold text-xs uppercase ${editIdUnidade !== null ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                                  >
                                    {isSavingUnit && <Loader2 size={16} className="animate-spin" />}
                                    <Plus size={16}/> {editIdUnidade !== null ? 'Salvar' : 'Add'}
                                  </Button>
                                 </div>
                              </form>

                              <div className="space-y-3">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-tight">
                                    Unidades Vinculadas ({unidadesFiltradas.length})
                                  </h4>
                                   
                                  <div className="relative w-full sm:w-64">
                                    <Search className="absolute left-2.5 top-2.5 text-slate-400" size={14} />
                                    <Input 
                                      placeholder="Buscar por nome ou unidade..." 
                                      className="pl-8 h-8 text-xs bg-slate-50"
                                      value={buscaProprietario}
                                      onChange={(e) => setBuscaProprietario(e.target.value)}
                                    />
                                  </div>
                                </div>

                                <div className="border rounded-md max-h-[180px] overflow-y-auto bg-white">
                                  <Table>
                                    <TableHeader className="bg-slate-50 sticky top-0">
                                      <TableRow className="text-[10px] uppercase">
                                        <TableHead className="h-8">Unidade</TableHead>
                                        <TableHead className="h-8">Proprietário</TableHead>
                                        <TableHead className="h-8">E-mail</TableHead>
                                        <TableHead className="h-8 text-right">Ações</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {unidadesFiltradas.length > 0 ? (
                                        unidadesFiltradas.map((item, idx) => (
                                          <TableRow key={idx} className="text-xs">
                                            <TableCell className="font-bold">{item.unidade}</TableCell>
                                            <TableCell>{item.proprietario}</TableCell>
                                            <TableCell className="text-slate-500">{item.email}</TableCell>
                                            <TableCell className="text-right space-x-1">
                                              <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-7 w-7 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                                                onClick={() => handleEditUnidade(item)}
                                              >
                                                <Edit3 size={14} />
                                              </Button>
                                              <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-7 w-7 text-slate-400 hover:text-red-600 hover:bg-red-50"
                                                onClick={() => handleRemoveUnidade(item)}
                                              >
                                                <Trash2 size={14} />
                                              </Button>
                                            </TableCell>
                                          </TableRow>
                                        ))
                                      ) : (
                                        <TableRow>
                                          <TableCell colSpan={4} className="text-center py-4 text-slate-400 text-xs">
                                            Nenhum proprietário encontrado com esse termo.
                                          </TableCell>
                                        </TableRow>
                                      )}
                                    </TableBody>
                                  </Table>
                                </div>
                              </div>

                              <ImportadorUnidades 
                                condoId={condo.id}
                                condoNome={condo.name} 
                                onImport={() => fetchUnitsForCondo(condo.id)} 
                              />
                            </div>
                          </DialogContent>
                        </Dialog>

                        {/* Botão para Vincular Síndico por E-mail */}
                        <TooltipProvider>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                            onClick={() => handleOpenSindico(condo)}
                            title="Vincular Síndico por E-mail"
                          >
                            <Mail size={18} />
                          </Button>
                        </TooltipProvider>

                        {/* Botão de Editar Instância */}
                        <TooltipProvider>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                            onClick={() => handleOpenEdit(condo)}
                          >
                            <Edit3 size={18} />
                          </Button>
                        </TooltipProvider>

                        {/* Botão de Excluir */}
                        <TooltipProvider>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-slate-400 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleDelete(condo.id)}
                          >
                            <Trash2 size={18} />
                          </Button>
                        </TooltipProvider>
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