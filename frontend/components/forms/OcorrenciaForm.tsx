"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Upload, X, FileVideo, FileImage, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useState } from "react"

const formSchema = z.object({
  condominiumId: z.string().min(1, "O ID do condomínio é obrigatório"),
  unidadeEnvolvida: z.string().optional(),
  titulo: z.string().min(5, "Título deve ter pelo menos 5 caracteres"),
  categoria: z.string().min(1, "Selecione uma categoria"),
  descricao: z.string().min(10, "Descreva o problema com mais detalhes"),
  emailNotificacao: z.string().email({ message: "E-mail inválido" }).optional().or(z.literal("")),
  ocultarIdentidade: z.boolean().default(false),
  midias: z.custom<File[]>().optional(),
})

type FormValuesInput = z.input<typeof formSchema>
type FormValuesOutput = z.output<typeof formSchema>

export default function RegistrarOcorrencia({ isAnonimo = false }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const form = useForm<FormValuesInput, unknown, FormValuesOutput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      condominiumId: "",
      unidadeEnvolvida: "",
      titulo: "",
      categoria: "",
      descricao: "",
      emailNotificacao: "",
      ocultarIdentidade: false,
      midias: [],
    },
  })

  async function onSubmit(values: FormValuesOutput) {
    setIsSubmitting(true)

    try {
      const token = localStorage.getItem("condoflow_token")

      let response: Response;

      if (isAnonimo) {
        // Envio anônimo — não precisa de autenticação, usa multipart/form-data
        const formData = new FormData()
        formData.append("data", new Blob([JSON.stringify({
          condominiumId: Number(values.condominiumId),
          relatedUnits: values.unidadeEnvolvida || null,
          title: values.titulo,
          description: values.descricao,
          category: values.categoria,
        })], { type: "application/json" }))

        if (values.midias && values.midias.length > 0) {
          formData.append("file", values.midias[0])
        }

        response = await fetch("http://localhost:8080/api/v1/occurrences/anonymous", {
          method: "POST",
          body: formData,
        })
      } else {
        // Envio autenticado
        response = await fetch("http://localhost:8080/api/v1/occurrences", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            title: values.titulo,
            description: values.descricao,
            category: values.categoria,
            relatedUnits: values.unidadeEnvolvida || null,
          }),
        })
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        const msg = errorData?.message || "Erro ao enviar ocorrência."
        toast.error(msg)
        setIsSubmitting(false)
        return
      }

      const data = await response.json()
      
      // Enviar os anexos se existirem
      if (values.midias && values.midias.length > 0) {
        for (const file of values.midias) {
          const formData = new FormData()
          formData.append("file", file)

          await fetch(`http://localhost:8080/api/v1/occurrences/${data.id}/attachments`, {
            method: "POST",
            headers: {
              ...(token && !isAnonimo ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: formData,
          })
        }
      }

      router.push(`/ocorrencia/sucesso?protocolo=${encodeURIComponent(data.protocol)}`)
    } catch {
      toast.error("Não foi possível conectar ao servidor. Tente novamente.")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <Card>
        <CardHeader>
          <CardTitle>{isAnonimo ? "Relato Anônimo" : "Nova Ocorrência"}</CardTitle>
          <CardDescription>
            {isAnonimo 
              ? "Sua identidade não será vinculada a este registro." 
              : "Este registro ficará salvo no seu histórico."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Seção Destaque: ID do Condomínio */}
              <div className="p-4 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50/50">
                <FormField
                  control={form.control}
                  name="condominiumId"
                  render={({ field, fieldState }) => (
                    <FormItem data-invalid={fieldState.invalid}>
                      <FormLabel className="font-bold">ID do Condomínio</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: 1"
                          className="font-mono bg-white"
                          aria-invalid={fieldState.invalid}
                          {...field}
                          onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ""))}
                        />
                      </FormControl>
                      <FormDescription>
                        Código numérico de identificação do condomínio.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Grid com largura idêntica para Categoria e Unidade */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="categoria"
                  render={({ field, fieldState }) => (
                    <FormItem data-invalid={fieldState.invalid}>
                      <FormLabel>Categoria</FormLabel>
                      <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger aria-invalid={fieldState.invalid}>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="MANUTENCAO">Manutenção</SelectItem>
                            <SelectItem value="CONVIVENCIA">Convivência</SelectItem>
                            <SelectItem value="LIMPEZA">Limpeza</SelectItem>
                            <SelectItem value="SEGURANCA">Segurança</SelectItem>
                            <SelectItem value="SUGESTAO">Sugestão</SelectItem>
                            <SelectItem value="OUTROS">Outros</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="unidadeEnvolvida"
                  render={({ field, fieldState }) => (
                    <FormItem data-invalid={fieldState.invalid}>
                      <FormLabel>Unidade Relacionada</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: Apto 64"
                          aria-invalid={fieldState.invalid}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="titulo"
                render={({ field, fieldState }) => (
                  <FormItem data-invalid={fieldState.invalid}>
                    <FormLabel>O que está acontecendo?</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Vazamento no teto da garagem"
                        aria-invalid={fieldState.invalid}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="descricao"
                render={({ field, fieldState }) => (
                  <FormItem data-invalid={fieldState.invalid}>
                    <FormLabel>Descrição Detalhada</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Conte-nos mais detalhes para ajudarmos a resolver..."
                        aria-invalid={fieldState.invalid}
                        className="resize-none h-32"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* CAMPO DE ANEXOS (IMAGENS E VÍDEOS) */}
              <FormField
                control={form.control}
                name="midias"
                render={({ field }) => {
                  const arquivos = (field.value as File[]) || []

                  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                    if (e.target.files) {
                      const novosArquivos = Array.from(e.target.files)
                      field.onChange([...arquivos, ...novosArquivos])
                    }
                  }

                  const removerArquivo = (index: number) => {
                    const novosArquivos = arquivos.filter((_, i) => i !== index)
                    field.onChange(novosArquivos)
                  }

                  return (
                    <FormItem>
                      <FormLabel>Anexos (Imagens e Vídeos)</FormLabel>
                      <FormControl>
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
                          <p className="text-xs text-muted-foreground">PNG, JPG, MP4, MOV</p>
                        </div>
                      </FormControl>
                      
                      {arquivos.length > 0 && (
                        <div className="space-y-2 mt-3">
                          <span className="text-xs font-semibold text-slate-500">Arquivos anexados ({arquivos.length}):</span>
                          <div className="max-h-36 overflow-y-auto space-y-2 pr-1">
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
                      <FormMessage />
                    </FormItem>
                  )
                }}
              />

              {!isAnonimo && (
                <FormField
                  control={form.control}
                  name="ocultarIdentidade"
                  render={({ field, fieldState }) => (
                    <FormItem data-invalid={fieldState.invalid} className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Privacidade de Vizinho</FormLabel>
                        <FormDescription>
                          O síndico saberá quem você é, mas o vizinho reclamado não.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          aria-invalid={fieldState.invalid}
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}

              {isAnonimo && (
                <FormField
                  control={form.control}
                  name="emailNotificacao"
                  render={({ field, fieldState }) => (
                    <FormItem data-invalid={fieldState.invalid}>
                      <FormLabel>E-mail para Notificação (Opcional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="seu@email.com"
                          type="email"
                          autoComplete="email"
                          aria-invalid={fieldState.invalid}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Apenas para avisar quando o síndico responder.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <Button type="submit" className="w-full h-12 font-bold text-lg" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                {isAnonimo ? "Gerar Protocolo e Enviar" : "Registrar Ocorrência"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}