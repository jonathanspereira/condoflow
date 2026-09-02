"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, UserCog, Loader2 } from "lucide-react"

const transferSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres."),
  email: z.string().email("E-mail inválido."),
  confirmation: z.string().refine((val) => val === "TRANSFERIR", {
    message: "Digite TRANSFERIR para confirmar.",
  }),
})

type TransferFormValues = z.infer<typeof transferSchema>

export default function ConfiguracoesPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [successData, setSuccessData] = useState<{ email: string; password?: string } | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      name: "",
      email: "",
      confirmation: "",
    }
  })

  async function onSubmit(data: TransferFormValues) {
    setIsLoading(true)
    const token = localStorage.getItem("condoflow_token")
    const selectedCondoId = localStorage.getItem("condoflow_selected_condo_id") || "1"

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/condominiums/${selectedCondoId}/sindico`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "X-Tenant-ID": selectedCondoId,
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setSuccessData({
          email: data.email,
          password: result.temporaryPassword, // Only present if it's a new user
        })
        toast.success("Titularidade transferida com sucesso!")
        
        // Log out the current user since they are no longer the sindico for this condo
        setTimeout(() => {
            localStorage.removeItem("condoflow_token")
            localStorage.removeItem("condoflow_selected_condo_id")
            router.push("/sindico/login")
        }, 15000)

      } else {
        const errorData = await response.json().catch(() => null)
        toast.error(errorData?.message || "Erro ao transferir a titularidade.")
      }
    } catch (error) {
      console.error("Erro na transferência:", error)
      toast.error("Erro de conexão com o servidor.")
    } finally {
      setIsLoading(false)
    }
  }

  if (successData) {
    return (
      <div className="p-8 max-w-2xl mx-auto mt-10">
        <div className="bg-emerald-50 border border-emerald-200 p-8 rounded-xl text-center shadow-sm">
          <UserCog className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-emerald-900 mb-2">Titularidade Transferida!</h2>
          <p className="text-emerald-700 mb-6">
            O acesso administrativo principal agora pertence a <strong>{successData.email}</strong>.
          </p>

          {successData.password && (
            <div className="bg-white p-4 rounded-lg border border-emerald-100 mb-6 inline-block text-left shadow-sm">
              <p className="text-sm text-slate-500 mb-1">Como é um novo usuário, envie a senha temporária abaixo:</p>
              <p className="text-xl font-mono font-bold text-slate-800 tracking-wider text-center">
                {successData.password}
              </p>
            </div>
          )}

          <p className="text-sm text-emerald-600/80 mb-4 font-medium">
            O seu acesso foi revogado. Você será desconectado automaticamente em instantes...
          </p>
          <Button onClick={() => {
              localStorage.removeItem("condoflow_token")
              localStorage.removeItem("condoflow_selected_condo_id")
              router.push("/sindico/login")
          }} variant="outline" className="mt-2 border-emerald-200 text-emerald-700 hover:bg-emerald-100">
            Sair Agora
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Configurações</h1>
        <p className="text-slate-500 mt-1">Gerencie configurações avançadas e a titularidade do condomínio.</p>
      </div>

      <Card className="border-red-100 shadow-sm overflow-hidden">
        <CardHeader className="bg-red-50/50 border-b border-red-100">
          <CardTitle className="text-red-700 flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5" />
            Transferência de Titularidade (Síndico)
          </CardTitle>
          <CardDescription className="text-red-700/70">
            Atenção: Ao transferir a titularidade, você perderá <strong>imediatamente</strong> o acesso a este condomínio. Esta ação não pode ser desfeita por você.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form id="transfer-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Novo Síndico</Label>
                <Input
                  id="name"
                  placeholder="Nome completo"
                  {...register("name")}
                  className={errors.name ? "border-red-500 focus-visible:ring-red-500" : "bg-slate-50"}
                />
                {errors.name && <p className="text-xs text-red-500 font-medium">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail do Novo Síndico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@exemplo.com"
                  {...register("email")}
                  className={errors.email ? "border-red-500 focus-visible:ring-red-500" : "bg-slate-50"}
                />
                {errors.email && <p className="text-xs text-red-500 font-medium">{errors.email.message}</p>}
              </div>
            </div>

            <Alert variant="destructive" className="bg-red-50/50 border-red-200">
              <AlertTitle className="font-bold flex items-center gap-2">
                Confirmação de Segurança
              </AlertTitle>
              <AlertDescription className="mt-3">
                <div className="space-y-3">
                  <p className="text-sm">Para continuar, digite a palavra <strong className="bg-red-100 px-1 rounded">TRANSFERIR</strong> no campo abaixo.</p>
                  <Input
                    placeholder="TRANSFERIR"
                    {...register("confirmation")}
                    className={errors.confirmation ? "border-red-500 bg-white" : "bg-white"}
                  />
                  {errors.confirmation && <p className="text-xs text-red-500 font-medium">{errors.confirmation.message}</p>}
                </div>
              </AlertDescription>
            </Alert>
          </form>
        </CardContent>
        <CardFooter className="border-t bg-slate-50 py-4 flex justify-end">
          <Button type="submit" form="transfer-form" variant="destructive" disabled={isLoading} className="font-bold">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Transferir Acesso Administrativo
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
