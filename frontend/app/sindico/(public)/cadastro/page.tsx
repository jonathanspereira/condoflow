"use client"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Loader2, Building2 } from "lucide-react"
import { toast } from "sonner"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

const registerSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
  email: z.string().min(1, "O e-mail é obrigatório.").email("Digite um formato de e-mail válido."),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
  condominiumName: z.string().min(3, "O nome do condomínio deve ter pelo menos 3 caracteres."),
  condominiumCnpj: z.string().min(14, "O CNPJ deve ter 14 dígitos (apenas números).").max(18, "CNPJ inválido"),
  condominiumAddress: z.string().min(5, "O endereço deve ter pelo menos 5 caracteres."),
})

type RegisterFormValues = z.infer<typeof registerSchema>

export default function RegisterSindicoPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", condominiumName: "", condominiumCnpj: "", condominiumAddress: "" },
  })

  async function onSubmit(data: RegisterFormValues) {
    setError("")
    setIsLoading(true)

    try {
      const response = await fetch("http://localhost:8080/api/v1/auth/register-sindico", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        toast.success("Cadastro realizado com sucesso!")
        const loginData = await response.json()
        
        // Auto-login
        localStorage.setItem("condoflow_token", loginData.token)
        localStorage.setItem("condoflow_user", JSON.stringify(loginData.user))
        
        router.push("/sindico/plano")
      } else {
        const errorData = await response.json().catch(() => null)
        const msg = errorData?.message || "Não foi possível realizar o cadastro."
        setError(msg)
        toast.error(msg)
        setIsLoading(false)
      }
    } catch (err) {
      console.error("Erro ao registrar:", err)
      setError("Erro de conexão com o servidor.")
      toast.error("Erro de conexão com o servidor.")
      setIsLoading(false)
    }
  }

  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-1 lg:px-0 bg-slate-50">
      <Link
        href="/"
        className="absolute left-4 top-4 md:left-8 md:top-8 flex items-center text-sm font-medium text-muted-foreground hover:text-emerald-600 transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar para Home
      </Link>
      
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px]">
        <div className="flex flex-col space-y-2 text-center items-center">
          <div className="bg-emerald-600 p-3 rounded-xl inline-flex mb-2 shadow-sm">
             <Building2 className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Crie a conta do seu Condomínio
          </h1>
          <p className="text-sm text-slate-500">
            Cadastre-se como síndico para começar a gerenciar sua propriedade na nuvem.
          </p>
        </div>

        <Card className="shadow-lg border-slate-200">
          <CardContent className="grid gap-4 pt-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-md font-medium flex items-start">
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid gap-5">
                
                {/* Dados do Síndico */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">1. Seus Dados (Síndico)</h3>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      id="name"
                      placeholder="Seu nome"
                      disabled={isLoading}
                      {...register("name")}
                      className={errors.name ? "border-red-500 focus-visible:ring-red-500" : "bg-slate-50"}
                    />
                    {errors.name && (
                      <p className="text-xs text-red-500 font-medium">{errors.name.message}</p>
                    )}
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="email">E-mail Corporativo</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="sindico@condominio.com"
                      disabled={isLoading}
                      {...register("email")}
                      className={errors.email ? "border-red-500 focus-visible:ring-red-500" : "bg-slate-50"}
                    />
                    {errors.email && (
                      <p className="text-xs text-red-500 font-medium">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="password">Senha de Acesso</Label>
                    <Input
                      id="password"
                      type="password"
                      disabled={isLoading}
                      {...register("password")}
                      className={errors.password ? "border-red-500 focus-visible:ring-red-500" : "bg-slate-50"}
                    />
                    {errors.password && (
                      <p className="text-xs text-red-500 font-medium">{errors.password.message}</p>
                    )}
                  </div>
                </div>

                {/* Dados do Condomínio */}
                <div className="space-y-4 mt-2">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">2. Dados do Condomínio</h3>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="condominiumName">Nome do Condomínio</Label>
                    <Input
                      id="condominiumName"
                      placeholder="Ex: Condomínio Residencial Flores"
                      disabled={isLoading}
                      {...register("condominiumName")}
                      className={errors.condominiumName ? "border-red-500 focus-visible:ring-red-500" : "bg-slate-50"}
                    />
                    {errors.condominiumName && (
                      <p className="text-xs text-red-500 font-medium">{errors.condominiumName.message}</p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="condominiumCnpj">CNPJ do Condomínio</Label>
                    <Input
                      id="condominiumCnpj"
                      placeholder="Somente números ou formato 00.000.000/0001-00"
                      disabled={isLoading}
                      {...register("condominiumCnpj")}
                      className={errors.condominiumCnpj ? "border-red-500 focus-visible:ring-red-500" : "bg-slate-50"}
                    />
                    {errors.condominiumCnpj && (
                      <p className="text-xs text-red-500 font-medium">{errors.condominiumCnpj.message}</p>
                    )}
                  </div>
                  <div className="grid gap-2 sm:col-span-2">
                    <Label htmlFor="condominiumAddress">Endereço Completo</Label>
                    <Input
                      id="condominiumAddress"
                      placeholder="Rua, Número, Bairro, Cidade - Estado"
                      disabled={isLoading}
                      {...register("condominiumAddress")}
                      className={errors.condominiumAddress ? "border-red-500 focus-visible:ring-red-500" : "bg-slate-50"}
                    />
                    {errors.condominiumAddress && (
                      <p className="text-xs text-red-500 font-medium">{errors.condominiumAddress.message}</p>
                    )}
                  </div>
                </div>

                <Button className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11" type="submit" disabled={isLoading}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  )}
                  {isLoading ? "Criando ambiente..." : "Cadastrar e Acessar Painel"}
                </Button>
              </div>
            </form>
          </CardContent>
          
          <CardFooter className="flex flex-col border-t border-slate-100 p-6 bg-slate-50/50 rounded-b-xl">
            <p className="text-sm text-center text-slate-600">
              Já possui uma conta?{" "}
              <Link href="/sindico/login" className="text-emerald-600 hover:text-emerald-700 font-bold hover:underline transition-all">
                Fazer login
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
