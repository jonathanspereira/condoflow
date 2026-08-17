"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

const loginSchema = z.object({
  email: z.string().min(1, "O e-mail é obrigatório.").email("Digite um formato de e-mail válido."),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginMoradorPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true)
    setErrorMsg("")

    try {
      const response = await fetch("http://localhost:8080/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: data.email, password: data.password }),
      })

      if (response.ok) {
        const responseData = await response.json()
        
        if (responseData.token) {
          localStorage.setItem("condoflow_token", responseData.token)
        }

        toast.success("Login realizado com sucesso!")
        router.push("/morador/minhas-ocorrencias")
      } else {
        const errorData = await response.json().catch(() => null)
        const msg = errorData?.message || "E-mail ou senha inválidos. Verifique suas credenciais."
        setErrorMsg(msg)
        toast.error(msg)
      }
    } catch (error) {
      console.error("Erro ao conectar com o servidor:", error)
      setErrorMsg("Não foi possível conectar ao servidor. Tente novamente mais tarde.")
      toast.error("Erro de conexão com o servidor.")
    } finally {
      setIsLoading(false)
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

      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
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
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 font-bold" type="submit" disabled={isLoading}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Entrar como Morador
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col">
            <p className="mt-2 text-xs text-center text-muted-foreground">
              Ainda não tem acesso? Solicite cadastro à portaria ou administração.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}