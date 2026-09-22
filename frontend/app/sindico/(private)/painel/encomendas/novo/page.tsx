"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Package, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

const formSchema = z.object({
  unitId: z.string().min(1, "Selecione uma unidade"),
  description: z.string().min(3, "Descrição muito curta"),
  recipientName: z.string().min(3, "Nome do destinatário muito curto"),
  trackingCode: z.string().optional(),
})

export default function RegistrarEncomendaPage() {
  const router = useRouter()
  const [units, setUnits] = useState<{ id: number; name: string }[]>([])
  const [loadingUnits, setLoadingUnits] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      unitId: "",
      description: "",
      recipientName: "",
      trackingCode: "",
    },
  })

  useEffect(() => {
    const fetchUnits = async () => {
      const token = localStorage.getItem("condoflow_token")
      const condoId = localStorage.getItem("condoflow_selected_condo_id") || "1"

      if (!token) return

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/units/condominium/${condoId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          setUnits(data)
        }
      } catch (error) {
        toast.error("Erro ao carregar unidades")
      } finally {
        setLoadingUnits(false)
      }
    }
    fetchUnits()
  }, [])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    try {
      const token = localStorage.getItem("condoflow_token")
      const condoId = localStorage.getItem("condoflow_selected_condo_id") || "1"

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/parcels`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "X-Tenant-ID": condoId,
        },
        body: JSON.stringify({
          unitId: parseInt(values.unitId),
          description: values.description,
          recipientName: values.recipientName,
          trackingCode: values.trackingCode || null,
        }),
      })

      if (!res.ok) throw new Error("Erro ao registrar encomenda")

      toast.success("Encomenda registrada com sucesso! E-mail enviado ao morador.")
      router.push("/sindico/painel/encomendas")
    } catch (error) {
      toast.error("Erro ao registrar a encomenda. Tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/sindico/painel/encomendas")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Registrar Encomenda</h1>
          <p className="text-sm text-slate-500 mt-1">Dê entrada em um novo pacote na portaria.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Dados do Pacote
          </CardTitle>
          <CardDescription>O morador será notificado automaticamente com o QR Code de liberação.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="unitId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unidade de Destino *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger disabled={loadingUnits}>
                            <SelectValue placeholder={loadingUnits ? "Carregando..." : "Selecione a unidade"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {units.map((unit) => (
                            <SelectItem key={unit.id} value={unit.id.toString()}>
                              {unit.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="recipientName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome no Pacote (Destinatário) *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: João da Silva" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição da Encomenda *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Caixa pequena da Amazon" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="trackingCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código de Rastreio (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: NL123456789BR" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  "Registrar Encomenda"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
