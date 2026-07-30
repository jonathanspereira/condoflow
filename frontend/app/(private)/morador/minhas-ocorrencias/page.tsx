"use client"

import React, { useState } from "react"
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
  FileImage
} from "lucide-react"

// MOCK DE DADOS
const MOCK_DATA = [
  {
    id: "CF-2026-A12",
    titulo: "Lâmpada queimada no corredor",
    status: "CONCLUIDO",
    data: "20/04/2026",
    categoria: "Manutenção"
  },
  {
    id: "CF-2026-B05",
    titulo: "Barulho excessivo apto 502",
    status: "EM_EXECUCAO",
    data: "22/04/2026",
    categoria: "Convivência"
  }
]

export default function MinhasOcorrencias() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [categoria, setCategoria] = useState("")
  const [unidadeRelacionada, setUnidadeRelacionada] = useState("")
  const [titulo, setTitulo] = useState("")
  const [descricao, setDescricao] = useState("")
  const [arquivos, setArquivos] = useState<File[]>([])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const novosArquivos = Array.from(e.target.files)
      setArquivos((prev) => [...prev, ...novosArquivos])
    }
  }

  const removerArquivo = (index: number) => {
    setArquivos((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Aqui você adicionaria a lógica para enviar os dados para o backend (incluindo arquivos via FormData se necessário)
    console.log({ categoria, unidadeRelacionada, titulo, descricao, arquivos })
    
    // Limpa e fecha o modal
    setCategoria("")
    setUnidadeRelacionada("")
    setTitulo("")
    setDescricao("")
    setArquivos([])
    setIsModalOpen(false)
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Minhas Ocorrências</h1>
          <p className="text-muted-foreground text-sm">Acompanhe o progresso dos seus relatos.</p>
        </div>

        {/* MODAL DE NOVO RELATO */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
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
                  <Label htmlFor="unidade">Unidade Relacionada</Label>
                  <Input 
                    id="unidade"
                    placeholder="Ex: Apto 102, Bloco B" 
                    value={unidadeRelacionada}
                    onChange={(e) => setUnidadeRelacionada(e.target.value)}
                    required
                  />
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

                  {/* LISTA DE ARQUIVOS SELECIONADOS */}
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
                <Button type="submit">Enviar Relato</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-bold text-slate-500">Total Enviado</CardDescription>
            <CardTitle className="text-2xl font-bold">02</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-bold text-blue-500">Em Resolução</CardDescription>
            <CardTitle className="text-2xl font-bold">01</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-bold text-green-500">Resolvidos</CardDescription>
            <CardTitle className="text-2xl font-bold">01</CardTitle>
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
                  <TableHead className="w-[120px]">Protocolo</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_DATA.map((item) => (
                  <TableRow key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="font-mono text-xs font-bold text-primary">{item.id}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-900">{item.titulo}</span>
                        <span className="text-[10px] text-muted-foreground uppercase font-semibold">{item.categoria}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.status === "CONCLUIDO" ? "default" : "secondary"} className="text-[10px]">
                        {item.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {/* LINK PARA A TELA DINÂMICA [ID] */}
                      <Link href={`/morador/minhas-ocorrencias/${item.id}`}>
                        <Button variant="ghost" size="icon" className="hover:text-primary">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}