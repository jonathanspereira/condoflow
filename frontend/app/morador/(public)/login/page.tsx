"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Loader2, Home } from "lucide-react"
import { toast } from "sonner"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Turnstile } from '@marsidev/react-turnstile'

const loginSchema = z.object({
  email: z.string().min(1, "O e-mail é obrigatório.").email("Digite um formato de e-mail válido."),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
})

type LoginFormValues = z.infer<typeof loginSchema>

interface UnitData {
  id: number
  unit: string
  condominiumId: number
}

export default function LoginMoradorPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [turnstileToken, setTurnstileToken] = useState<string>("")

  // Estado para fluxo multi-condominio
  const [units, setUnits] = useState<UnitData[]>([])
  const [showUnitSelector, setShowUnitSelector] = useState(false)
  const [selectedUnitId, setSelectedUnitId] = useState<string>("")

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  // 1. Passo: Autenticação
  async function onSubmit(data: LoginFormValues) {
    if (!turnstileToken) {
      toast.error("Por favor, valide o captcha antes de prosseguir.")
      return
    }

    setIsLoading(true)
    setErrorMsg("")

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email.trim(), password: data.password, turnstileToken }),
      })

      if (response.ok) {
        const responseData = await response.json()
        if (responseData.token) {
          localStorage.setItem("condoflow_token", responseData.token)
        }
        
        await handleFetchUnits(responseData.token)

      } else {
        const errorData = await response.json().catch(() => null)
        const msg = errorData?.message || "E-mail ou senha inválidos. Verifique suas credenciais."
        setErrorMsg(msg)
        toast.error(msg)
        setIsLoading(false)
      }
    } catch (error) {
      console.error("Erro ao conectar com o servidor:", error)
      setErrorMsg("Não foi possível conectar ao servidor.")
      toast.error("Erro de conexão com o servidor.")
      setIsLoading(false)
    }
  }

  // 2. Passo: Buscar unidades do morador
  async function handleFetchUnits(token: string) {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/units/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (res.ok) {
        const data: UnitData[] = await res.json()
        
        if (data.length === 0) {
          setErrorMsg("Sua conta não possui nenhuma unidade vinculada.")
          toast.error("Nenhuma unidade encontrada.")
          localStorage.removeItem("condoflow_token")
          setIsLoading(false)
          return
        }

        if (data.length === 1) {
          // Se tiver apenas uma unidade, entra direto
          localStorage.setItem("condoflow_unit_id", String(data[0].id))
          localStorage.setItem("condoflow_condominium_id", String(data[0].condominiumId))
          toast.success("Login realizado com sucesso!")
          router.push("/morador/minhas-ocorrencias")
        } else {
          // Mais de uma unidade, exibe o seletor
          setUnits(data)
          setSelectedUnitId(String(data[0].id))
          setShowUnitSelector(true)
          setIsLoading(false)
        }
      } else {
        setErrorMsg("Erro ao buscar unidades.")
        toast.error("Erro ao carregar seu perfil.")
        setIsLoading(false)
      }
    } catch (err) {
      setErrorMsg("Falha de conexão ao buscar unidades.")
      setIsLoading(false)
    }
  }

  // 3. Passo: Confirmar a unidade selecionada
  function handleSelectUnit() {
    if (!selectedUnitId) return
    const unit = units.find(u => String(u.id) === selectedUnitId)
    if (unit) {
      localStorage.setItem("condoflow_unit_id", String(unit.id))
      localStorage.setItem("condoflow_condominium_id", String(unit.condominiumId))
      toast.success("Acesso confirmado!")
      router.push("/morador/minhas-ocorrencias")
    }
  }

  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-1 lg:px-0">
      <Link
        href="/"
        className="absolute left-4 top-4 md:left-8 md:top-8 flex items-center text-sm font-medium text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar
      </Link>

      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[380px]">
        {!showUnitSelector ? (
          <Card className="shadow-lg">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center font-bold">Login do Morador</CardTitle>
              <CardDescription className="text-center">
                Entre para acompanhar suas ocorrências e notificações.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid gap-4">
                  {errorMsg && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-2.5 rounded-md text-center font-medium">
                      {errorMsg}
                    </div>
                  )}
                  <div className="grid gap-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="nome@exemplo.com"
                      disabled={isLoading}
                      {...register("email")}
                      className={errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}
                    />
                    {errors.email && (
                      <p className="text-xs text-red-500 font-medium">{errors.email.message}</p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Senha</Label>
                      <Link
                        href="/recuperar-senha"
                        className="text-xs text-primary hover:underline"
                      >
                        Esqueceu a senha?
                      </Link>
                    </div>
                    <Input 
                      id="password" 
                      type="password" 
                      disabled={isLoading} 
                      {...register("password")}
                      className={errors.password ? "border-red-500 focus-visible:ring-red-500" : ""}
                    />
                    {errors.password && (
                      <p className="text-xs text-red-500 font-medium">{errors.password.message}</p>
                    )}
                  </div>
                  
                  <div className="flex justify-center mt-2">
                    <Turnstile 
                      siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"}
                      onSuccess={(token) => setTurnstileToken(token)}
                    />
                  </div>

                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 font-bold mt-2" type="submit" disabled={isLoading || !turnstileToken}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Entrar como Morador
                  </Button>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col items-center justify-center space-y-2">
              <div className="text-sm text-slate-500">
                Primeiro acesso?{" "}
                <Link href="/morador/primeiro-acesso" className="text-emerald-600 font-semibold hover:underline">
                  Crie sua senha
                </Link>
              </div>
            </CardFooter>
          </Card>
        ) : (
          <Card className="shadow-lg animate-in fade-in zoom-in duration-300">
            <CardHeader className="space-y-1">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-2">
                <Home className="h-6 w-6 text-emerald-600" />
              </div>
              <CardTitle className="text-xl text-center font-bold text-slate-900">Selecione sua Unidade</CardTitle>
              <CardDescription className="text-center text-xs">
                Identificamos que você possui vínculo com mais de um imóvel. Qual unidade deseja acessar agora?
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 mt-2">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-700">Minhas Unidades/Condomínios</Label>
                <Select value={selectedUnitId} onValueChange={setSelectedUnitId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Escolha uma unidade..." />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map((u) => (
                      <SelectItem key={u.id} value={String(u.id)}>
                        Unidade {u.unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button onClick={handleSelectUnit} className="w-full bg-emerald-600 hover:bg-emerald-700 font-bold mt-2">
                Acessar Painel
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}