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

const formSchema = z.object({
  codigoCondominio: z.string().min(1, "O código do condomínio é obrigatório"),
  unidadeEnvolvida: z.string().optional(),
  titulo: z.string().min(5, "Título deve ter pelo menos 5 caracteres"),
  categoria: z.string().min(1, "Selecione uma categoria"),
  descricao: z.string().min(10, "Descreva o problema com mais detalhes"),
  emailNotificacao: z.string().email({ message: "E-mail inválido" }).optional().or(z.literal("")),
  ocultarIdentidade: z.boolean().default(false),
})

type FormValuesInput = z.input<typeof formSchema>
type FormValuesOutput = z.output<typeof formSchema>

export default function RegistrarOcorrencia({ isAnonimo = false }) {
  const router = useRouter()
  const form = useForm<FormValuesInput, unknown, FormValuesOutput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      codigoCondominio: "",
      unidadeEnvolvida: "",
      titulo: "",
      categoria: "",
      descricao: "",
      emailNotificacao: "",
      ocultarIdentidade: false,
    },
  })

  function onSubmit(values: FormValuesOutput) {
    console.log("Dados da ocorrência:", values)
    if (isAnonimo) {
      router.push("/ocorrencia/sucesso")
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
              
              {/* Seção Destaque: Código do Condomínio */}
              <div className="p-4 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50/50">
                <FormField
                  control={form.control}
                  name="codigoCondominio"
                  render={({ field, fieldState }) => (
                    <FormItem data-invalid={fieldState.invalid}>
                      <FormLabel className="font-bold">Código do Condomínio</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: SOLAR-123"
                          className="uppercase font-mono bg-white"
                          aria-invalid={fieldState.invalid}
                          {...field}
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        />
                      </FormControl>
                      <FormDescription>
                        Código de identificação do condominio.
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
                          <SelectItem value="manutencao">Manutenção</SelectItem>
                          <SelectItem value="barulho">Barulho / Convivência</SelectItem>
                          <SelectItem value="seguranca">Segurança</SelectItem>
                          <SelectItem value="outros">Sugestão ou Outros</SelectItem>
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

              <Button type="submit" className="w-full h-12 font-bold text-lg">
                {isAnonimo ? "Gerar Protocolo e Enviar" : "Registrar Ocorrência"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}