"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Building,
  Loader2,
  Shield,
  Plus,
  Trash2,
  Pencil,
  UserPlus,
  AlertTriangle,
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

interface ConciergeData {
  id: string
  name: string
  email: string
}

export default function PortariaPage() {
  const [condominios, setCondominios] = useState<CondominiumOption[]>([])
  const [selectedCondoId, setSelectedCondoId] = useState<string>("")
  const [concierges, setConcierges] = useState<ConciergeData[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Modal de Adicionar/Editar
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingConciergeId, setEditingConciergeId] = useState<string | null>(null)
  const [formName, setFormName] = useState("")
  const [formEmail, setFormEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Modal de Confirmação de Exclusão
  const [deletingConcierge, setDeletingConcierge] = useState<ConciergeData | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const getToken = () => (typeof window !== "undefined" ? localStorage.getItem("condoflow_token") : "")

  // Carrega condomínios vinculados ao síndico
  useEffect(() => {
    async function loadCondominios() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/condominiums/me`, {
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

  // Carrega porteiros do condomínio selecionado
  const fetchConcierges = async () => {
    if (!selectedCondoId) return
    setIsLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/condominiums/${selectedCondoId}/concierges`, {
        headers: { 
          Authorization: `Bearer ${getToken()}`,
        },
      })
      if (res.ok) {
        const data: ConciergeData[] = await res.json()
        setConcierges(data)
      } else {
        toast.error("Erro ao carregar equipe de portaria.")
      }
    } catch (error) {
      console.error("Erro de conexão ao buscar porteiros:", error)
      toast.error("Erro de conexão ao buscar porteiros.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchConcierges()
  }, [selectedCondoId])

  const handleOpenAddModal = () => {
    setEditingConciergeId(null)
    setFormName("")
    setFormEmail("")
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (c: ConciergeData) => {
    setEditingConciergeId(c.id)
    setFormName(c.name || "")
    setFormEmail(c.email || "")
    setIsModalOpen(true)
  }

  const handleSaveConcierge = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formName.trim() || !formEmail.trim()) {
      toast.error("Preencha o nome e e-mail do porteiro.")
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        name: formName.trim(),
        email: formEmail.trim(),
        password: "123456",
      }

      const isEditing = editingConciergeId !== null
      const url = isEditing
        ? `${process.env.NEXT_PUBLIC_API_URL}/condominiums/${selectedCondoId}/concierges/${editingConciergeId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/condominiums/${selectedCondoId}/concierges`
      
      const method = isEditing ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        toast.success(isEditing ? "Porteiro atualizado com sucesso!" : "Porteiro cadastrado com sucesso!")
        setIsModalOpen(false)
        fetchConcierges()
      } else {
        const errorData = await res.json().catch(() => null)
        const msg = errorData?.message || "Erro ao salvar porteiro."
        toast.error(msg)
      }
    } catch (err) {
      console.error("Erro ao salvar porteiro:", err)
      toast.error("Erro de conexão ao salvar porteiro.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteConcierge = async () => {
    if (!deletingConcierge) return
    setIsDeleting(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/condominiums/${selectedCondoId}/concierges/${deletingConcierge.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      })
      if (res.ok) {
        toast.success(`Porteiro removido com sucesso.`)
        setDeletingConcierge(null)
        fetchConcierges()
      } else {
        toast.error("Erro ao remover porteiro.")
      }
    } catch (err) {
      console.error("Erro ao excluir porteiro:", err)
      toast.error("Erro de conexão ao excluir porteiro.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Equipe de Portaria</h1>
          <p className="text-sm text-muted-foreground">
            Adicione, edite e remova os porteiros que terão acesso ao aplicativo do condomínio.
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

          <Button onClick={handleOpenAddModal} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2">
            <Plus className="h-4 w-4" />
            Adicionar Porteiro
          </Button>
        </div>
      </div>

      <Card className="shadow-sm border-slate-200">
        <CardHeader className="pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-slate-800">Lista de Porteiros</CardTitle>
            <CardDescription>
              Gerencie a equipe que controla o acesso e recebimento de encomendas.
            </CardDescription>
          </div>
          <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 font-bold">
            Total: {concierges.length}
          </Badge>
        </CardHeader>
        <CardContent className="pt-4 p-0 md:p-6">
          <div className="rounded-md border bg-white overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Nome</TableHead>
                  <TableHead>E-mail de Acesso</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                        <span>Carregando porteiros...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : concierges.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                      Nenhum porteiro cadastrado ainda neste condomínio.
                    </TableCell>
                  </TableRow>
                ) : (
                  concierges.map((c) => (
                    <TableRow key={c.id} className="hover:bg-slate-50/70 transition-colors">
                      <TableCell className="font-bold text-slate-900">
                        {c.name}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-slate-600">{c.email}</span>
                      </TableCell>
                      <TableCell>
                         <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                           <Shield className="w-3 h-3 mr-1" />
                           Ativo
                         </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" title="Editar Porteiro" onClick={() => handleOpenEditModal(c)}>
                            <Pencil className="h-4 w-4 text-slate-500 hover:text-emerald-600" />
                          </Button>
                          <Button variant="ghost" size="icon" title="Remover Porteiro" onClick={() => setDeletingConcierge(c)}>
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

      {/* Modal Adicionar / Editar Porteiro */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg bg-white">
          <form onSubmit={handleSaveConcierge}>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-emerald-600" />
                {editingConciergeId ? "Editar Porteiro" : "Adicionar Porteiro"}
              </DialogTitle>
              <DialogDescription>
                Informe os dados do porteiro. A senha padrão gerada será <strong>123456</strong> e ele deverá alterá-la no primeiro acesso.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-1.5">
                <Label htmlFor="name" className="text-xs">Nome Completo</Label>
                <Input
                  id="name"
                  placeholder="Nome do Porteiro"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="email" className="text-xs">E-mail de Acesso</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="porteiro@exemplo.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar Porteiro"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação de Exclusão */}
      <Dialog open={deletingConcierge !== null} onOpenChange={(open) => !open && setDeletingConcierge(null)}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Remover Porteiro
            </DialogTitle>
            <DialogDescription className="text-slate-600 mt-2">
              Tem certeza que deseja remover o porteiro <strong className="text-slate-900">{deletingConcierge?.name}</strong>? Ele perderá o acesso à portaria deste condomínio.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeletingConcierge(null)} disabled={isDeleting}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteConcierge} disabled={isDeleting} className="bg-red-600 hover:bg-red-700 text-white font-bold">
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sim, Remover"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
