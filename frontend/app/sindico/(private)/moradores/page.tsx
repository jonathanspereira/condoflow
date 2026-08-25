"use client"

import React, { useState, useEffect, useRef } from "react"
import * as XLSX from "xlsx"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Building,
  Loader2,
  User,
  KeySquare,
  Plus,
  Trash2,
  Pencil,
  UserPlus,
  AlertTriangle,
  FileSpreadsheet,
  CheckCircle2,
  HelpCircle,
  Upload
} from "lucide-react"
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
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

interface BulkUnitItem {
  unit: string
  ownerName: string
  ownerEmail: string
  rented: boolean
  tenantName?: string
  tenantEmail?: string
  isValid: boolean
  error?: string
}

export default function MoradoresPage() {
  const [condominios, setCondominios] = useState<CondominiumOption[]>([])
  const [selectedCondoId, setSelectedCondoId] = useState<string>("")
  const [units, setUnits] = useState<UnitData[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Modal de Adicionar/Editar
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUnitId, setEditingUnitId] = useState<number | null>(null)
  const [formUnit, setFormUnit] = useState("")
  const [formOwnerName, setFormOwnerName] = useState("")
  const [formOwnerEmail, setFormOwnerEmail] = useState("")
  const [formIsRented, setFormIsRented] = useState(false)
  const [formTenantName, setFormTenantName] = useState("")
  const [formTenantEmail, setFormTenantEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Modal de Confirmação de Exclusão
  const [deletingUnit, setDeletingUnit] = useState<UnitData | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Modal de Cadastro em Massa
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false)
  const [bulkText, setBulkText] = useState("")
  const [parsedBulkUnits, setParsedBulkUnits] = useState<BulkUnitItem[]>([])
  const [isSubmittingBulk, setIsSubmittingBulk] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("condominiumId", selectedCondoId);

    setIsSubmittingBulk(true);
    try {
      const res = await fetch(`http://localhost:8080/api/v1/units/import`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "X-Tenant-ID": selectedCondoId
        },
        body: formData,
      });

      if (res.ok) {
        const createdList = await res.json();
        toast.success(`${createdList.length} moradores importados com sucesso!`);
        setIsBulkModalOpen(false);
        fetchMoradores();
      } else {
        const err = await res.json().catch(() => null);
        toast.error(err?.message || "Erro ao importar a planilha.");
      }
    } catch (error) {
      toast.error("Erro de conexão ao enviar o arquivo.");
    } finally {
      setIsSubmittingBulk(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };


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
  const fetchMoradores = async () => {
    if (!selectedCondoId) return
    setIsLoading(true)
    try {
      const res = await fetch(`http://localhost:8080/api/v1/units/condominium/${selectedCondoId}`, {
        headers: { 
          Authorization: `Bearer ${getToken()}`,
          "X-Tenant-ID": selectedCondoId
        },
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

  useEffect(() => {
    fetchMoradores()
  }, [selectedCondoId])

  const handleOpenAddModal = () => {
    setEditingUnitId(null)
    setFormUnit("")
    setFormOwnerName("")
    setFormOwnerEmail("")
    setFormIsRented(false)
    setFormTenantName("")
    setFormTenantEmail("")
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (u: UnitData) => {
    setEditingUnitId(u.id)
    setFormUnit(u.unit)
    setFormOwnerName(u.ownerName || "")
    setFormOwnerEmail(u.ownerEmail || "")
    setFormIsRented(u.rented || false)
    setFormTenantName(u.tenantName || "")
    setFormTenantEmail(u.tenantEmail || "")
    setIsModalOpen(true)
  }

  const handleSaveUnit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formUnit.trim() || !formOwnerName.trim() || !formOwnerEmail.trim()) {
      toast.error("Preencha a unidade, nome e e-mail do proprietário.")
      return
    }

    if (formIsRented && (!formTenantName.trim() || !formTenantEmail.trim())) {
      toast.error("Preencha o nome e e-mail do inquilino para unidades alugadas.")
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        unit: formUnit.trim(),
        ownerName: formOwnerName.trim(),
        ownerEmail: formOwnerEmail.trim(),
        rented: formIsRented,
        tenantName: formIsRented ? formTenantName.trim() : null,
        tenantEmail: formIsRented ? formTenantEmail.trim() : null,
      }

      const isEditing = editingUnitId !== null
      const url = isEditing
        ? `http://localhost:8080/api/v1/units/${editingUnitId}`
        : `http://localhost:8080/api/v1/units?condominiumId=${selectedCondoId}`
      
      const method = isEditing ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
          "X-Tenant-ID": selectedCondoId
        },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        toast.success(isEditing ? "Morador / Unidade atualizado com sucesso!" : "Morador / Unidade cadastrado com sucesso!")
        setIsModalOpen(false)
        fetchMoradores()
      } else {
        const errorData = await res.json().catch(() => null)
        const msg = errorData?.message || "Erro ao salvar morador."
        toast.error(msg)
      }
    } catch (err) {
      console.error("Erro ao salvar morador:", err)
      toast.error("Erro de conexão ao salvar morador.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteUnit = async () => {
    if (!deletingUnit) return
    setIsDeleting(true)
    try {
      const res = await fetch(`http://localhost:8080/api/v1/units/${deletingUnit.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "X-Tenant-ID": selectedCondoId
        },
      })
      if (res.ok) {
        toast.success(`Unidade ${deletingUnit.unit} removida com sucesso.`)
        setDeletingUnit(null)
        fetchMoradores()
      } else {
        toast.error("Erro ao remover morador / unidade.")
      }
    } catch (err) {
      console.error("Erro ao excluir unidade:", err)
      toast.error("Erro de conexão ao excluir morador.")
    } finally {
      setIsDeleting(false)
    }
  }

  // --- LÓGICA DE CADASTRO EM MASSA ---
  const parseBulkText = (text: string) => {
    const lines = text.split("\n").map((l) => l.trim()).filter((l) => l.length > 0)
    const items: BulkUnitItem[] = []

    for (const line of lines) {
      // Formato: Unidade, Nome Proprietário, Email Proprietário [, Nome Inquilino, Email Inquilino]
      const parts = line.split(",").map((p) => p.trim())
      if (parts.length < 3) {
        items.push({
          unit: parts[0] || "",
          ownerName: parts[1] || "",
          ownerEmail: parts[2] || "",
          rented: false,
          isValid: false,
          error: "Campos insuficientes. Requer: Unidade, Nome Proprietário, Email Proprietário",
        })
        continue
      }

      const unit = parts[0]
      const ownerName = parts[1]
      const ownerEmail = parts[2]
      const tenantName = parts[3] || ""
      const tenantEmail = parts[4] || ""
      const rented = tenantName.length > 0 && tenantEmail.length > 0

      const isEmailValid = (e: string) => /\S+@\S+\.\S+/.test(e)

      if (!unit || !ownerName || !ownerEmail) {
        items.push({
          unit, ownerName, ownerEmail, rented, tenantName, tenantEmail,
          isValid: false, error: "Unidade, Nome ou E-mail do proprietário em branco."
        })
      } else if (!isEmailValid(ownerEmail)) {
        items.push({
          unit, ownerName, ownerEmail, rented, tenantName, tenantEmail,
          isValid: false, error: `E-mail do proprietário inválido: ${ownerEmail}`
        })
      } else if (tenantEmail && !isEmailValid(tenantEmail)) {
        items.push({
          unit, ownerName, ownerEmail, rented, tenantName, tenantEmail,
          isValid: false, error: `E-mail do inquilino inválido: ${tenantEmail}`
        })
      } else {
        items.push({
          unit, ownerName, ownerEmail, rented, tenantName, tenantEmail,
          isValid: true
        })
      }
    }
    setParsedBulkUnits(items)
  }

  const handleBulkTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    setBulkText(text)
    parseBulkText(text)
  }

  const insertBulkExample = () => {
    const example = `101, Carlos Andrade, carlos@email.com
102, Mariana Lima, mariana@email.com, João Silva, joao.inquilino@email.com
201, Roberto Souza, roberto@email.com
202, Fernanda Costa, fernanda@email.com`
    setBulkText(example)
    parseBulkText(example)
  }

  const handleSaveBulk = async () => {
    const validItems = parsedBulkUnits.filter((item) => item.isValid)
    if (validItems.length === 0) {
      toast.error("Nenhum morador válido para cadastrar.")
      return
    }

    setIsSubmittingBulk(true)

    try {
      const payload = validItems.map((item) => ({
        unit: item.unit,
        ownerName: item.ownerName,
        ownerEmail: item.ownerEmail,
        rented: item.rented,
        tenantName: item.tenantName || null,
        tenantEmail: item.tenantEmail || null,
      }))

      const res = await fetch(`http://localhost:8080/api/v1/units/batch?condominiumId=${selectedCondoId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
          "X-Tenant-ID": selectedCondoId
        },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        const createdList = await res.json()
        toast.success(`${createdList.length} moradores cadastrados com sucesso em massa!`)
        setIsBulkModalOpen(false)
        setBulkText("")
        setParsedBulkUnits([])
        fetchMoradores()
      } else {
        const err = await res.json().catch(() => null)
        toast.error(err?.message || "Erro ao efetuar cadastro em massa.")
      }
    } catch (err) {
      console.error("Erro no cadastro em massa:", err)
      toast.error("Erro de conexão ao enviar dados em massa.")
    } finally {
      setIsSubmittingBulk(false)
    }
  }

  const validCount = parsedBulkUnits.filter((i) => i.isValid).length
  const invalidCount = parsedBulkUnits.filter((i) => !i.isValid).length

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Moradores e Unidades</h1>
          <p className="text-sm text-muted-foreground">
            Adicione, edite e remova os moradores e unidades do seu condomínio.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
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

          <Button
            onClick={() => setIsBulkModalOpen(true)}
            variant="outline"
            className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-bold gap-2"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            Cadastro em Massa
          </Button>

          <Button onClick={handleOpenAddModal} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2">
            <Plus className="h-4 w-4" />
            Adicionar Morador
          </Button>
        </div>
      </div>

      <Card className="shadow-sm border-slate-200">
        <CardHeader className="pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-slate-800">Lista de Moradores</CardTitle>
            <CardDescription>
              Gerenciamento ativo de unidades, proprietários e inquilinos.
            </CardDescription>
          </div>
          <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 font-bold">
            Total: {units.length}
          </Badge>
        </CardHeader>
        <CardContent className="pt-4 p-0 md:p-6">
          <div className="rounded-md border bg-white overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="w-[140px]">Unidade</TableHead>
                  <TableHead>Proprietário</TableHead>
                  <TableHead>Morador Atual (Inquilino)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                        <span>Carregando moradores do condomínio...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : units.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                      Nenhum morador / unidade cadastrado ainda neste condomínio.
                    </TableCell>
                  </TableRow>
                ) : (
                  units.map((u) => (
                    <TableRow key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      <TableCell className="font-bold text-slate-900">
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
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" title="Editar Morador" onClick={() => handleOpenEditModal(u)}>
                            <Pencil className="h-4 w-4 text-slate-500 hover:text-emerald-600" />
                          </Button>
                          <Button variant="ghost" size="icon" title="Remover Morador" onClick={() => setDeletingUnit(u)}>
                            <Trash2 className="h-4 w-4 text-slate-400 hover:text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal Cadastro em Massa */}
      <Dialog open={isBulkModalOpen} onOpenChange={setIsBulkModalOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
                Cadastro de Moradores em Massa
              </DialogTitle>
              <Button variant="ghost" size="sm" onClick={insertBulkExample} className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold">
                <HelpCircle className="h-3.5 w-3.5 mr-1" />
                Carregar Exemplo
              </Button>
            </div>
            <DialogDescription className="text-xs text-slate-500">
              Cole abaixo uma lista de moradores (um por linha) ou arquivo CSV separado por vírgula no formato:
              <br />
              <code className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-mono text-slate-800 font-semibold">
                Unidade, Nome do Proprietário, Email Proprietário [, Nome Inquilino, Email Inquilino]
              </code>
            </DialogDescription>
          </DialogHeader>

          
            <div className="space-y-4 py-3">
              <div className="flex items-center gap-4">
                <Button variant="outline" className="flex items-center gap-2" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-4 w-4" />
                  Selecionar Planilha (XLS/XLSX)
                </Button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept=".xls,.xlsx" 
                  className="hidden" 
                />
              </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Linhas de Moradores</Label>
              <Textarea
                placeholder="Exemplo:&#10;101, Carlos Silva, carlos@email.com&#10;102, Maria Souza, maria@email.com, Roberto Lima, roberto@email.com"
                rows={5}
                className="font-mono text-xs bg-slate-50 border-slate-200 resize-y"
                value={bulkText}
                onChange={handleBulkTextChange}
              />
            </div>

            {/* Pré-visualização com Tabela */}
            {parsedBulkUnits.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase">
                    Pré-visualização do Processamento ({parsedBulkUnits.length} linhas)
                  </span>
                  <div className="flex gap-2 text-xs font-semibold">
                    {validCount > 0 && <span className="text-emerald-600">{validCount} válidos</span>}
                    {invalidCount > 0 && <span className="text-red-600">{invalidCount} com erro</span>}
                  </div>
                </div>

                <div className="rounded-md border bg-slate-50/50 max-h-56 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-100 text-xs">
                        <TableHead>Unidade</TableHead>
                        <TableHead>Proprietário</TableHead>
                        <TableHead>Inquilino</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parsedBulkUnits.map((item, idx) => (
                        <TableRow key={idx} className={item.isValid ? "hover:bg-emerald-50/30" : "bg-red-50/40"}>
                          <TableCell className="font-bold text-xs">{item.unit || "-"}</TableCell>
                          <TableCell className="text-xs">
                            <div>{item.ownerName || "-"}</div>
                            <div className="text-[10px] text-muted-foreground">{item.ownerEmail}</div>
                          </TableCell>
                          <TableCell className="text-xs">
                            {item.rented ? (
                              <div>
                                <div>{item.tenantName}</div>
                                <div className="text-[10px] text-muted-foreground">{item.tenantEmail}</div>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic text-[11px]">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-xs">
                            {item.isValid ? (
                              <Badge className="bg-emerald-100 text-emerald-800 text-[10px] font-semibold border-none">
                                <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-600" />
                                Válido
                              </Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-800 text-[10px] font-semibold border-none" title={item.error}>
                                <AlertTriangle className="h-3 w-3 mr-1 text-red-600" />
                                Erro
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="pt-2 border-t">
            <Button variant="outline" onClick={() => setIsBulkModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSaveBulk}
              disabled={isSubmittingBulk || validCount === 0}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2"
            >
              {isSubmittingBulk ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Cadastrar {validCount} Morador{validCount !== 1 ? "es" : ""}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Adicionar / Editar Morador Individual */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg bg-white">
          <form onSubmit={handleSaveUnit}>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-emerald-600" />
                {editingUnitId ? "Editar Morador / Unidade" : "Adicionar Novo Morador"}
              </DialogTitle>
              <DialogDescription>
                Informe os dados da unidade e as credenciais de acesso do morador.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="unit">Unidade / Apartamento</Label>
                <Input
                  id="unit"
                  placeholder="Ex: Apto 101, Bloco A - 204"
                  value={formUnit}
                  onChange={(e) => setFormUnit(e.target.value)}
                  required
                />
              </div>

              <div className="border-t border-slate-100 pt-3 space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Dados do Proprietário</h4>
                <div className="grid gap-3">
                  <div className="grid gap-1.5">
                    <Label htmlFor="ownerName" className="text-xs">Nome Completo</Label>
                    <Input
                      id="ownerName"
                      placeholder="Nome do Proprietário"
                      value={formOwnerName}
                      onChange={(e) => setFormOwnerName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="ownerEmail" className="text-xs">E-mail de Acesso</Label>
                    <Input
                      id="ownerEmail"
                      type="email"
                      placeholder="email@exemplo.com"
                      value={formOwnerEmail}
                      onChange={(e) => setFormOwnerEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3 space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="isRented" className="font-semibold text-slate-800 cursor-pointer">
                    A unidade está alugada?
                  </Label>
                  <input
                    type="checkbox"
                    id="isRented"
                    checked={formIsRented}
                    onChange={(e) => setFormIsRented(e.target.checked)}
                    className="h-4 w-4 accent-emerald-600 rounded cursor-pointer"
                  />
                </div>

                {formIsRented && (
                  <div className="bg-blue-50/60 p-3 rounded-lg border border-blue-100 grid gap-3 animate-in fade-in">
                    <h5 className="text-xs font-bold text-blue-700 uppercase">Dados do Inquilino</h5>
                    <div className="grid gap-1.5">
                      <Label htmlFor="tenantName" className="text-xs">Nome do Inquilino</Label>
                      <Input
                        id="tenantName"
                        placeholder="Nome do Inquilino"
                        value={formTenantName}
                        onChange={(e) => setFormTenantName(e.target.value)}
                        required={formIsRented}
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="tenantEmail" className="text-xs">E-mail do Inquilino</Label>
                      <Input
                        id="tenantEmail"
                        type="email"
                        placeholder="inquilino@exemplo.com"
                        value={formTenantEmail}
                        onChange={(e) => setFormTenantEmail(e.target.value)}
                        required={formIsRented}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar Morador"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação de Exclusão */}
      <Dialog open={deletingUnit !== null} onOpenChange={(open) => !open && setDeletingUnit(null)}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Remover Morador / Unidade
            </DialogTitle>
            <DialogDescription className="text-slate-600 mt-2">
              Tem certeza que deseja remover a unidade <strong className="text-slate-900">{deletingUnit?.unit}</strong> ({deletingUnit?.ownerName})? Esta ação desvinculará o morador da lista do condomínio.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeletingUnit(null)} disabled={isDeleting}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteUnit} disabled={isDeleting} className="bg-red-600 hover:bg-red-700 text-white font-bold">
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sim, Remover"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
