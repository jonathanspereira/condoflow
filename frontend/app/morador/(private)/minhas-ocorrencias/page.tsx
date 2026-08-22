"use client"

import React, { useState, useEffect, useRef } from "react"
import Link from "next/link"
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
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Search,
  Eye,
  MessageSquare,
  Filter,
  Upload,
  X,
  FileVideo,
  FileImage,
  Loader2,
  CheckCircle2,
  AlertCircle
} from "lucide-react"

interface Occurrence {
  id: string
  protocol: string
  title: string
  description: string
  category: string
  status: string
  condominiumName: string
  unitName?: string
  createdAt: string
}

const CATEGORIA_LABELS: Record<string, string> = {
  MANUTENCAO: "Manutenção",
  CONVIVENCIA: "Convivência",
  LIMPEZA: "Limpeza",
  SEGURANCA: "Segurança",
  OUTROS: "Outros",
}

const STATUS_LABELS: Record<string, string> = {
  OPEN: "Aberto",
  IN_PROGRESS: "Em Andamento",
  RESOLVED: "Resolvido",
  CLOSED: "Concluído",
}

const STATUS_CONCLUIDOS = ["RESOLVED", "CLOSED"]

type RelatedUnitStatus = "idle" | "checking" | "valid" | "not_found" | "same_unit" | "error" | "forbidden"

export default function MinhasOcorrencias() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [categoria, setCategoria] = useState("")
  const [titulo, setTitulo] = useState("")
  const [descricao, setDescricao] = useState("")
  const [arquivos, setArquivos] = useState<File[]>([])

  const [occurrences, setOccurrences] = useState<Occurrence[]>([])
  const [isLoadingList, setIsLoadingList] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [unitLabel, setUnitLabel] = useState("") // unidade do próprio morador logado
  const [formError, setFormError] = useState("")

  // --- Unidade relacionada (deve ser DIFERENTE da unidade do morador) ---
  const [hasRelatedUnit, setHasRelatedUnit] = useState(false)
  const [relatedUnit, setRelatedUnit] = useState("")
  const [relatedUnitsList, setRelatedUnitsList] = useState<string[]>([])
  const [relatedUnitId, setRelatedUnitId] = useState<string | null>(null)
  const [relatedUnitStatus, setRelatedUnitStatus] = useState<RelatedUnitStatus>("idle")
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const getToken = () => typeof window !== "undefined" ? localStorage.getItem("condoflow_token") : ""

  const traduzirCategoria = (cat: string) => CATEGORIA_LABELS[cat] || cat
  const traduzirStatus = (status: string) => STATUS_LABELS[status] || status

  const formatarData = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("pt-BR")
    } catch {
      return iso
    }
  }

  const fetchOccurrences = async () => {
    setIsLoadingList(true)
    try {
      const response = await fetch("http://localhost:8080/api/v1/occurrences/me", {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      if (response.ok) {
        const data = await response.json()
        setOccurrences(data)
      }
    } catch (error) {
      console.error("Erro ao carregar ocorrências:", error)
    } finally {
      setIsLoadingList(false)
    }
  }

  const fetchUnitLabel = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/v1/users/me", {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      if (response.ok) {
        const data = await response.json()
        setUnitLabel(data.unitName || "")
      }
    } catch (error) {
      console.error("Erro ao carregar unidade do usuário:", error)
    }
  }

  useEffect(() => {
    fetchOccurrences()
    fetchUnitLabel()
  }, [])

  // Normaliza para comparar (ex: "Apto 101" === "apto 101")
  const normalizar = (valor: string) => valor.trim().toLowerCase()

  // Verifica existência da unidade relacionada no backend, com debounce.
  // Só roda quando o checkbox "Existe unidade relacionada?" está marcado.
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!hasRelatedUnit) {
      setRelatedUnitStatus("idle")
      setRelatedUnitId(null)
      return
    }

    const valor = relatedUnit.trim()

    if (!valor) {
      setRelatedUnitStatus("idle")
      setRelatedUnitId(null)
      return
    }

    // Regra: não pode ser a própria unidade do morador
    if (unitLabel && normalizar(valor) === normalizar(unitLabel)) {
      setRelatedUnitStatus("same_unit")
      setRelatedUnitId(null)
      return
    }

    setRelatedUnitStatus("checking")

    debounceRef.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/api/v1/units/check?name=${encodeURIComponent(valor)}`,
          { headers: { Authorization: `Bearer ${getToken()}` } }
        )

        if (response.ok) {
          const data = await response.json()
          // Backend retorna { exists: boolean, id: number, unit: string }
          if (data?.exists) {
            // dupla checagem: unidade encontrada não pode ser a mesma do morador logado
            if (unitLabel && normalizar(data.unit || valor) === normalizar(unitLabel)) {
              setRelatedUnitStatus("same_unit")
              setRelatedUnitId(null)
            } else {
              setRelatedUnitStatus("valid")
              setRelatedUnitId(data.id != null ? String(data.id) : null)
            }
          } else {
            setRelatedUnitStatus("not_found")
            setRelatedUnitId(null)
          }
        } else if (response.status === 403) {
          // Backend recusou o acesso à rota (rota não mapeada ou role sem permissão)
          setRelatedUnitStatus("forbidden")
          setRelatedUnitId(null)
        } else if (response.status === 404) {
          setRelatedUnitStatus("not_found")
          setRelatedUnitId(null)
        } else {
          setRelatedUnitStatus("error")
          setRelatedUnitId(null)
        }
      } catch (error) {
        console.error("Erro ao verificar unidade relacionada:", error)
        setRelatedUnitStatus("error")
        setRelatedUnitId(null)
      }
    }, 500)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [relatedUnit, unitLabel, hasRelatedUnit])

  const relatedUnitMessage: Record<RelatedUnitStatus, string | null> = {
    idle: null,
    checking: "Verificando unidade...",
    valid: "Unidade encontrada.",
    not_found: "Nenhuma unidade encontrada com esse nome/número.",
    same_unit: "A unidade relacionada não pode ser a sua própria unidade.",
    error: "Não foi possível verificar a unidade agora. Tente novamente.",
    forbidden: "Sem permissão para consultar unidades. Fale com o suporte/administrador do sistema.",
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const novosArquivos = Array.from(e.target.files)
      setArquivos((prev) => [...prev, ...novosArquivos])
    }
  }

  const removerArquivo = (index: number) => {
    setArquivos((prev) => prev.filter((_, i) => i !== index))
  }

  const resetForm = () => {
    setCategoria("")
    setTitulo("")
    setDescricao("")
    setArquivos([])
    setHasRelatedUnit(false)
    setRelatedUnit("")
    setRelatedUnitsList([])
    setRelatedUnitId(null)
    setRelatedUnitStatus("idle")
  }

  const handleToggleHasRelatedUnit = (checked: boolean) => {
    setHasRelatedUnit(checked)
    if (!checked) {
      setRelatedUnit("")
      setRelatedUnitsList([])
      setRelatedUnitId(null)
      setRelatedUnitStatus("idle")
    }
  }

  const handleAddRelatedUnitBadge = () => {
    if (relatedUnit.trim() && !relatedUnitsList.includes(relatedUnit.trim())) {
      setRelatedUnitsList((prev) => [...prev, relatedUnit.trim()])
      setRelatedUnit("")
      setRelatedUnitStatus("valid")
    }
  }

  const handleRemoveRelatedUnitBadge = (unitToRemove: string) => {
    setRelatedUnitsList((prev) => prev.filter((u) => u !== unitToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError("")

    if (hasRelatedUnit && relatedUnitsList.length === 0 && relatedUnitStatus !== "valid") {
      setFormError("Informe uma unidade relacionada válida (diferente da sua) antes de enviar.")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("http://localhost:8080/api/v1/occurrences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          title: titulo,
          description: descricao,
          category: categoria,
          unitId: localStorage.getItem("condoflow_unit_id") ? Number(localStorage.getItem("condoflow_unit_id")) : undefined,
          relatedUnits: hasRelatedUnit && relatedUnitsList.length > 0 ? relatedUnitsList.join(", ") : (hasRelatedUnit ? relatedUnit : null),
        })
      })

      if (response.ok) {
        const occData = await response.json()
        
        // Upload arquivos se houver
        if (arquivos && arquivos.length > 0) {
          for (const arquivo of arquivos) {
            const formData = new FormData();
            formData.append("file", arquivo);
            
            try {
              await fetch(`http://localhost:8080/api/v1/occurrences/${occData.id}/attachments`, {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${getToken()}`
                },
                body: formData
              });
            } catch (err) {
              console.error("Erro ao fazer upload do anexo:", err);
              toast.error(`Falha ao anexar o arquivo ${arquivo.name}`);
            }
          }
        }

        resetForm()
        setIsModalOpen(false)
        fetchOccurrences()
      } else {
        const errData = await response.json().catch(() => null)
        setFormError(errData?.message || "Não foi possível registrar o relato.")
      }
    } catch (error) {
      console.error("Erro ao registrar ocorrência:", error)
      setFormError("Erro de conexão com o servidor.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const filtered = occurrences.filter((o) =>
    o.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const total = occurrences.length
  const emResolucao = occurrences.filter((o) => !STATUS_CONCLUIDOS.includes(o.status)).length
  const resolvidos = occurrences.filter((o) => STATUS_CONCLUIDOS.includes(o.status)).length

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Minhas Ocorrências</h1>
          <p className="text-muted-foreground text-sm">Acompanhe o progresso dos seus relatos.</p>
        </div>

        {/* MODAL DE NOVO RELATO */}
        <Dialog open={isModalOpen} onOpenChange={(open) => {
          setIsModalOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Novo Relato
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Registrar Novo Relato</DialogTitle>
                <DialogDescription>
                  Preencha as informações abaixo para abrir uma nova ocorrência ou relato.
                </DialogDescription>
              </DialogHeader>

              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-md font-medium mt-2">
                  {formError}
                </div>
              )}

              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="categoria">Categoria</Label>
                  <Select value={categoria} onValueChange={setCategoria} required>
                    <SelectTrigger id="categoria">
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MANUTENCAO">Manutenção</SelectItem>
                      <SelectItem value="CONVIVENCIA">Convivência</SelectItem>
                      <SelectItem value="LIMPEZA">Limpeza</SelectItem>
                      <SelectItem value="SEGURANCA">Segurança</SelectItem>
                      <SelectItem value="OUTROS">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="tem-unidade-relacionada"
                      checked={hasRelatedUnit}
                      onCheckedChange={(checked) => handleToggleHasRelatedUnit(checked === true)}
                    />
                    <Label htmlFor="tem-unidade-relacionada" className="cursor-pointer font-normal">
                      Este relato está relacionado a outra unidade
                    </Label>
                  </div>

                  {hasRelatedUnit && (
                    <div className="space-y-2">
                      <Label htmlFor="unidade-relacionada">Unidades Relacionadas</Label>

                      {/* Lista de Badges Selecionadas */}
                      {relatedUnitsList.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 border rounded-md">
                          {relatedUnitsList.map((unitName, i) => (
                            <Badge key={i} className="bg-emerald-100 text-emerald-800 border-emerald-200 text-xs gap-1">
                              {unitName}
                              <X
                                className="h-3 w-3 cursor-pointer text-emerald-600 hover:text-emerald-900"
                                onClick={() => handleRemoveRelatedUnitBadge(unitName)}
                              />
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Input
                            id="unidade-relacionada"
                            placeholder="Digite a unidade relacionada (ex: Apto 302) e clique +"
                            value={relatedUnit}
                            onChange={(e) => setRelatedUnit(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault()
                                handleAddRelatedUnitBadge()
                              }
                            }}
                            required={hasRelatedUnit && relatedUnitsList.length === 0}
                            className="pr-9"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleAddRelatedUnitBadge}
                          disabled={!relatedUnit.trim()}
                          className="shrink-0 border-emerald-600 text-emerald-700 hover:bg-emerald-50"
                        >
                          + Adicionar
                        </Button>
                      </div>

                      {unitLabel && (
                        <p className="text-[11px] text-muted-foreground">
                          Sua unidade: <span className="font-medium">{unitLabel}</span> (não pode ser usada como relacionada)
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="titulo">O que está acontecendo?</Label>
                  <Input
                    id="titulo"
                    placeholder="Resumo curto do problema (ex: Vazamento na garagem)"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="descricao">Descrição Detalhada</Label>
                  <Textarea
                    id="descricao"
                    placeholder="Forneça o máximo de detalhes possível (local exato, horários, etc.)..."
                    rows={4}
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    required
                  />
                </div>

                {/* CAMPO DE ANEXOS (IMAGENS E VÍDEOS) */}
                <div className="grid gap-2">
                  <Label>Anexos (Imagens e Vídeos)</Label>
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-lg p-6 hover:bg-slate-50/50 transition-colors cursor-pointer relative">
                    <input
                      type="file"
                      id="file-upload"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      accept="image/*,video/*"
                      multiple
                      onChange={handleFileChange}
                    />
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm font-medium text-slate-700">Clique para enviar ou arraste arquivos</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG, MP4, MOV (máx. por arquivo)</p>
                  </div>

                  {arquivos.length > 0 && (
                    <div className="space-y-2 mt-2">
                      <span className="text-xs font-semibold text-slate-500">Arquivos anexados ({arquivos.length}):</span>
                      <div className="max-h-32 overflow-y-auto space-y-2 pr-1">
                        {arquivos.map((file, index) => {
                          const isVideo = file.type.startsWith("video/")
                          return (
                            <div key={index} className="flex items-center justify-between bg-slate-100 p-2 rounded-md text-sm">
                              <div className="flex items-center gap-2 overflow-hidden">
                                {isVideo ? <FileVideo className="h-4 w-4 text-blue-500 shrink-0" /> : <FileImage className="h-4 w-4 text-green-500 shrink-0" />}
                                <span className="truncate text-xs font-medium text-slate-800">{file.name}</span>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-slate-500 hover:text-red-600"
                                onClick={() => removerArquivo(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || (hasRelatedUnit && relatedUnitStatus !== "valid")}
                  className="gap-2"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Enviar Relato
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-bold text-slate-500">Total Enviado</CardDescription>
            <CardTitle className="text-2xl font-bold">{String(total).padStart(2, "0")}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-bold text-blue-500">Em Resolução</CardDescription>
            <CardTitle className="text-2xl font-bold">{String(emResolucao).padStart(2, "0")}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-bold text-green-500">Resolvidos</CardDescription>
            <CardTitle className="text-2xl font-bold">{String(resolvidos).padStart(2, "0")}</CardTitle>
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
                  <TableHead className="w-[140px]">Protocolo</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingList ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-8">
                      Carregando ocorrências...
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-8">
                      Nenhuma ocorrência encontrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((item) => (
                    <TableRow key={item.protocol} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="font-mono text-xs font-bold text-primary">{item.protocol}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-900">{item.title}</span>
                          <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                            {traduzirCategoria(item.category)} · {formatarData(item.createdAt)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={STATUS_CONCLUIDOS.includes(item.status) ? "default" : "secondary"} className="text-[10px]">
                          {traduzirStatus(item.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/morador/minhas-ocorrencias/${item.protocol}`}>
                          <Button variant="ghost" size="icon" className="hover:text-primary">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
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