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
  Loader2,
  KeyRound
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
import { Checkbox } from "@/components/ui/checkbox"
import { TooltipProvider } from "@/components/ui/tooltip"

interface Condominium {
  id: number
  name: string
  cnpj: string
  address: string
}

// Bate com o UnitResponseDTO do backend
interface UnidadeProprietario {
  id?: number
  unit: string
  condominiumId?: number
  ownerId?: string
  ownerName: string
  ownerEmail: string
  rented: boolean
  tenantId?: string
  tenantName?: string
  tenantEmail?: string
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
              unit: colunas[0].trim(),
              ownerName: colunas[1].trim(),
              ownerEmail: colunas[2].trim(),
              rented: false,
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
        await fetch(`http://localhost:8080/api/v1/units?condominiumId=${condoId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`
          },
          body: JSON.stringify({
            unit: item.unit,
            ownerName: item.ownerName,
            ownerEmail: item.ownerEmail,
            rented: false
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
                    <TableRow key={idx} className="text-xs">
                      <TableCell className="py-2 font-bold">{row.unit}</TableCell>
                      <TableCell className="py-2">{row.ownerName}</TableCell>
                      <TableCell className="py-2 text-slate-500">{row.ownerEmail}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
             </Table>
          </div>
          )}

          <p className="text-[10px] text-slate-400 leading-relaxed">
            Novos proprietários recebem uma senha temporária de acesso automaticamente. E-mails já cadastrados no sistema são apenas vinculados à unidade.
          </p>

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
  const [sindicosVinculados, setSindicosVinculados] = useState<any[]>([])
  const [isLoadingSindicos, setIsLoadingSindicos] = useState(false)
  const [selectedCondo, setSelectedCondo] = useState<Condominium | null>(null)

  const [name, setName] = useState("")
  const [cnpj, setCnpj] = useState("")
  const [address, setAddress] = useState("")

  const [emailSindico, setEmailSindico] = useState("")
  const [nomeSindico, setNomeSindico] = useState("")
  const [isSavingSindico, setIsSavingSindico] = useState(false)
  const [sindicoError, setSindicoError] = useState("")
  
  const [editingSindicoId, setEditingSindicoId] = useState<string | null>(null)
  const [editSindicoName, setEditSindicoName] = useState("")
  const [editSindicoEmail, setEditSindicoEmail] = useState("")
  const [isSavingEditSindico, setIsSavingEditSindico] = useState(false)
  const [sindicoSuccess, setSindicoSuccess] = useState<{ message: string; tempPassword?: string } | null>(null)

  const [unidadesList, setUnidadesList] = useState<UnidadeProprietario[]>([])
  const [buscaProprietario, setBuscaProprietario] = useState("")

  // Campos do formulário de unidade
  const [unidadeInput, setUnidadeInput] = useState("")
  const [nomeProprietario, setNomeProprietario] = useState("")
  const [emailProprietario, setEmailProprietario] = useState("")
  const [isAlugado, setIsAlugado] = useState(false)
  const [nomeInquilino, setNomeInquilino] = useState("")
  const [emailInquilino, setEmailInquilino] = useState("")
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

  const fetchSindicosVinculados = async (condoId: number) => {
    setIsLoadingSindicos(true)
    try {
      const response = await fetch(`http://localhost:8080/api/v1/condominiums/${condoId}/sindicos`, {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setSindicosVinculados(data)
      }
    } catch (error) {
      console.error("Erro ao buscar síndicos vinculados:", error)
    } finally {
      setIsLoadingSindicos(false)
    }
  }

  const handleOpenSindico = async (condo: Condominium) => {
    setSelectedCondo(condo)
    setEmailSindico("")
    setNomeSindico("")
    setSindicoError("")
    setSindicoSuccess(null)
    setIsSindicoOpen(true)
    setSindicosVinculados([])
    
    await fetchSindicosVinculados(condo.id)
  }

  const handleVincularSindico = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCondo || !emailSindico) return

    setIsSavingSindico(true)
    setSindicoError("")
    setSindicoSuccess(null)

    try {
      const response = await fetch(`http://localhost:8080/api/v1/condominiums/${selectedCondo.id}/sindico`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({ email: emailSindico, name: nomeSindico || undefined })
      })

      if (response.ok) {
        const data = await response.json()
        setSindicoSuccess({
          message: `${data.user.name} foi vinculado como síndico de ${selectedCondo.name}.`,
          tempPassword: data.temporaryPassword || undefined
        })
        setEmailSindico("")
        setNomeSindico("")
        // Fetch sindicos again to update the list without resetting success state
        fetchSindicosVinculados(selectedCondo.id)
      } else {
        const errData = await response.json().catch(() => null)
        setSindicoError(errData?.message || "Não foi possível vincular o síndico.")
      }
    } catch (error) {
      console.error("Erro ao vincular síndico:", error)
      setSindicoError("Erro de conexão com o servidor.")
    } finally {
      setIsSavingSindico(false)
    }
  }

  const handleRemoveSindico = async (sindicoId: string) => {
    if (!selectedCondo) return
    setIsLoadingSindicos(true)
    setSindicoError("")
    try {
      const response = await fetch(`http://localhost:8080/api/v1/condominiums/${selectedCondo.id}/sindicos/${sindicoId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      })
      if (response.ok) {
        fetchSindicosVinculados(selectedCondo.id)
        setSindicoSuccess(null) // clear any previous success
      } else {
        setSindicoError("Erro ao remover o síndico.")
      }
    } catch (error) {
      console.error("Erro ao remover síndico:", error)
      setSindicoError("Erro de conexão ao remover o síndico.")
    } finally {
      setIsLoadingSindicos(false)
    }
  }

  const handleEditSindicoSubmit = async (sindicoId: string) => {
    if (!selectedCondo) return
    setIsSavingEditSindico(true)
    setSindicoError("")
    try {
      const response = await fetch(`http://localhost:8080/api/v1/condominiums/${selectedCondo.id}/sindicos/${sindicoId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({ email: editSindicoEmail, name: editSindicoName || undefined })
      })
      if (response.ok) {
        fetchSindicosVinculados(selectedCondo.id)
        setEditingSindicoId(null)
        setSindicoSuccess(null)
      } else {
        const errData = await response.json().catch(() => null)
        setSindicoError(errData?.message || "Erro ao atualizar o síndico.")
      }
    } catch (error) {
      console.error("Erro ao atualizar síndico:", error)
      setSindicoError("Erro de conexão ao atualizar o síndico.")
    } finally {
      setIsSavingEditSindico(false)
    }
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

  const resetFormUnidade = () => {
    setUnidadeInput("")
    setNomeProprietario("")
    setEmailProprietario("")
    setIsAlugado(false)
    setNomeInquilino("")
    setEmailInquilino("")
    setEditIdUnidade(null)
  }

  const handleSaveUnidade = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!unidadeInput || !nomeProprietario || !emailProprietario || !selectedCondo) {
      alert("Preencha unidade, nome e e-mail do proprietário.")
      return
    }
    if (isAlugado && (!nomeInquilino || !emailInquilino)) {
      alert("Preencha nome e e-mail do inquilino, já que a unidade está marcada como alugada.")
      return
    }

    setIsSavingUnit(true)
    try {
      const payload = {
        unit: unidadeInput,
        ownerName: nomeProprietario,
        ownerEmail: emailProprietario,
        rented: isAlugado,
        tenantName: isAlugado ? nomeInquilino : undefined,
        tenantEmail: isAlugado ? emailInquilino : undefined,
      }

      const url = editIdUnidade !== null 
        ? `http://localhost:8080/api/v1/units/${editIdUnidade}`
        : `http://localhost:8080/api/v1/units?condominiumId=${selectedCondo.id}`

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
        resetFormUnidade()
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
      setUnidadeInput(item.unit)
      setNomeProprietario(item.ownerName)
      setEmailProprietario(item.ownerEmail)
      setIsAlugado(item.rented)
      setNomeInquilino(item.tenantName || "")
      setEmailInquilino(item.tenantEmail || "")
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
    item.ownerName?.toLowerCase().includes(buscaProprietario.toLowerCase()) ||
    item.unit?.toLowerCase().includes(buscaProprietario.toLowerCase()) ||
    item.ownerEmail?.toLowerCase().includes(buscaProprietario.toLowerCase()) ||
    item.tenantName?.toLowerCase().includes(buscaProprietario.toLowerCase())
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
            <DialogDescription>
              Informe o e-mail do síndico responsável. Apenas um síndico pode estar vinculado por vez (o antigo será substituído). Se o e-mail não tiver conta, uma nova será criada.
            </DialogDescription>
          </DialogHeader>

          <div className="bg-slate-50 border border-slate-100 rounded-md p-3 mb-1">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-tight mb-2">Síndicos Atuais</h4>
            {isLoadingSindicos ? (
              <p className="text-xs text-slate-500 flex items-center gap-2"><Loader2 className="h-3 w-3 animate-spin" /> Carregando...</p>
            ) : sindicosVinculados.length > 0 ? (
              <ul className="space-y-2">
                {sindicosVinculados.map((s, i) => (
                  <li key={i} className="text-xs flex flex-col gap-2 bg-white p-2 border rounded">
                    {editingSindicoId === s.id ? (
                      <div className="flex flex-col gap-2 w-full">
                        <Input
                          value={editSindicoName}
                          onChange={(e) => setEditSindicoName(e.target.value)}
                          placeholder="Nome do Síndico"
                          className="h-8 text-xs"
                        />
                        <Input
                          value={editSindicoEmail}
                          onChange={(e) => setEditSindicoEmail(e.target.value)}
                          placeholder="E-mail do Síndico"
                          className="h-8 text-xs"
                        />
                        <div className="flex justify-end gap-2 mt-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => setEditingSindicoId(null)}
                            disabled={isSavingEditSindico}
                          >
                            Cancelar
                          </Button>
                          <Button
                            size="sm"
                            className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={() => handleEditSindicoSubmit(s.id)}
                            disabled={isSavingEditSindico}
                          >
                            {isSavingEditSindico ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                            Salvar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between w-full">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">{s.name}</span>
                          <span className="text-slate-500">{s.email}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-slate-500 hover:text-slate-700 h-7 px-2"
                            onClick={() => {
                              setEditingSindicoId(s.id)
                              setEditSindicoName(s.name)
                              setEditSindicoEmail(s.email)
                            }}
                            disabled={isLoadingSindicos}
                          >
                            Editar
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-500 hover:text-red-700 h-7 px-2"
                            onClick={() => handleRemoveSindico(s.id)}
                            disabled={isLoadingSindicos}
                          >
                            Remover
                          </Button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-500 italic">Nenhum síndico vinculado no momento.</p>
            )}
          </div>

          {sindicoError && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-md font-medium">
              {sindicoError}
            </div>
          )}

          {sindicoSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm p-3 rounded-md font-medium space-y-1">
              <p>{sindicoSuccess.message}</p>
              {sindicoSuccess.tempPassword && (
                <p className="font-mono text-xs bg-white border border-emerald-200 rounded px-2 py-1 inline-block">
                  Senha temporária: <strong>{sindicoSuccess.tempPassword}</strong>
                </p>
              )}
            </div>
          )}
          {sindicosVinculados.length === 0 ? (
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
            <div className="grid gap-2">
              <Label htmlFor="nome-sindico">Nome do Síndico</Label>
              <Input 
                id="nome-sindico" 
                placeholder="Necessário apenas se ainda não tiver conta" 
                value={nomeSindico} 
                onChange={(e) => setNomeSindico(e.target.value)} 
              />
            </div>
            <DialogFooter className="pt-4">
              <Button type="submit" disabled={isSavingSindico} className="bg-emerald-600 hover:bg-emerald-700 w-full font-bold text-white gap-2">
                {isSavingSindico && <Loader2 className="h-4 w-4 animate-spin" />}
                Vincular Síndico
              </Button>
            </DialogFooter>
            </form>
          ) : (
            <div className="py-4 text-center border border-slate-100 bg-slate-50 rounded-md mt-4">
              <p className="text-sm text-slate-500 px-4">
                Este condomínio já possui um síndico vinculado. Remova o síndico atual para vincular um novo.
              </p>
            </div>
          )}
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
                            resetFormUnidade()
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
                          <DialogContent className="sm:max-w-[760px] max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2 text-xl">
                                 <Home className="text-emerald-600" /> Unidades e Proprietários: {condo.name}
                              </DialogTitle>
                              <DialogDescription>Cadastre proprietários e, se a unidade estiver alugada, o inquilino responsável. Contas de acesso são criadas automaticamente.</DialogDescription>
                            </DialogHeader>
                             
                            <div className="space-y-6 py-4">
                              <form onSubmit={handleSaveUnidade} className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-inner">
                                <div className="grid grid-cols-4 gap-3">
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
                                </div>

                                <div className="flex items-center gap-2 pt-1">
                                  <Checkbox 
                                    id="alugado" 
                                    checked={isAlugado}
                                    onCheckedChange={(checked) => setIsAlugado(checked === true)}
                                  />
                                  <Label htmlFor="alugado" className="text-xs font-bold text-slate-600 cursor-pointer">
                                    Unidade está alugada
                                  </Label>
                                </div>

                                {isAlugado && (
                                  <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-200 mt-1">
                                    <div className="space-y-1.5 pt-2">
                                      <Label className="text-[10px] uppercase font-black text-slate-500">Inquilino (Nome)</Label>
                                      <Input 
                                        placeholder="Nome Completo" 
                                        className="h-9 text-sm bg-white" 
                                        value={nomeInquilino}
                                        onChange={(e) => setNomeInquilino(e.target.value)}
                                      />
                                    </div>
                                    <div className="space-y-1.5 pt-2">
                                      <Label className="text-[10px] uppercase font-black text-slate-500">Inquilino (E-mail)</Label>
                                      <Input 
                                        placeholder="E-mail" 
                                        type="email" 
                                        className="h-9 text-sm bg-white" 
                                        value={emailInquilino}
                                        onChange={(e) => setEmailInquilino(e.target.value)}
                                      />
                                    </div>
                                  </div>
                                )}

                                {editIdUnidade !== null && (
                                  <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-[10px] h-7 text-slate-400"
                                    onClick={resetFormUnidade}
                                  >
                                    Cancelar edição
                                  </Button>
                                )}
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

                                <div className="border rounded-md max-h-[220px] overflow-y-auto bg-white">
                                  <Table>
                                    <TableHeader className="bg-slate-50 sticky top-0">
                                      <TableRow className="text-[10px] uppercase">
                                        <TableHead className="h-8">Unidade</TableHead>
                                        <TableHead className="h-8">Proprietário</TableHead>
                                        <TableHead className="h-8">Alugado</TableHead>
                                        <TableHead className="h-8">Inquilino</TableHead>
                                        <TableHead className="h-8 text-right">Ações</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {unidadesFiltradas.length > 0 ? (
                                        unidadesFiltradas.map((item, idx) => (
                                          <TableRow key={idx} className="text-xs">
                                            <TableCell className="font-bold">{item.unit}</TableCell>
                                            <TableCell>
                                              <div className="flex flex-col">
                                                <span>{item.ownerName}</span>
                                                <span className="text-slate-400 text-[10px]">{item.ownerEmail}</span>
                                              </div>
                                            </TableCell>
                                            <TableCell>
                                              {item.rented ? (
                                                <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-none px-2 text-[10px]">
                                                  <KeyRound size={10} className="mr-1" /> Sim
                                                </Badge>
                                              ) : (
                                                <Badge variant="outline" className="text-[10px] text-slate-400 border-slate-200">Não</Badge>
                                              )}
                                            </TableCell>
                                            <TableCell>
                                              {item.rented && item.tenantName ? (
                                                <div className="flex flex-col">
                                                  <span>{item.tenantName}</span>
                                                  <span className="text-slate-400 text-[10px]">{item.tenantEmail}</span>
                                                </div>
                                              ) : (
                                                <span className="text-slate-300">—</span>
                                              )}
                                            </TableCell>
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
                                          <TableCell colSpan={5} className="text-center py-4 text-slate-400 text-xs">
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