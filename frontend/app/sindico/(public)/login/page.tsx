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
import { Turnstile } from '@marsidev/react-turnstile'

const ALLOWED_ROLES = ["SINDICO", "SUPER_ADMIN"]

const loginSchema = z.object({
  email: z.string().min(1, "O e-mail corporativo é obrigatório.").email("Digite um formato de e-mail válido."),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginSindicoPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [turnstileToken, setTurnstileToken] = useState<string>("")

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  async function onSubmit(data: LoginFormValues) {
    if (!turnstileToken) {
      toast.error("Por favor, valide o captcha antes de prosseguir.")
      return
    }

    setError("")
    setIsLoading(true)

    try {
      const response = await fetch("http://localhost:8080/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, password: data.password, turnstileToken })
      })

      if (response.ok) {
        const responseData = await response.json()

        if (!ALLOWED_ROLES.includes(responseData.role)) {
          setError("Este acesso é exclusivo para síndicos. Use o login de morador.")
          toast.error("Acesso negado.", { description: "Este login é exclusivo para síndicos." })
          setIsLoading(false)
          return
        }

        localStorage.setItem("condoflow_token", responseData.token)
        toast.success("Login realizado com sucesso!")
        router.push("/sindico/condominio")
      } else {
        const errorData = await response.json().catch(() => null)
        const msg = errorData?.message || "E-mail ou senha inválidos."
        setError(msg)
        toast.error(msg)
        setIsLoading(false)
      }
    } catch (err) {
      console.error("Erro ao autenticar:", err)
      setError("Erro de conexão com o servidor.")
      toast.error("Erro de conexão com o servidor.")
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
            <CardTitle className="text-2xl text-center font-bold">Login do Síndico</CardTitle>
            <CardDescription className="text-center">
              Acesse o painel administrativo para gerenciar ocorrências do condomínio.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-md font-medium">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">E-mail corporativo</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="sindico@condominio.com"
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
                    siteKey="1x00000000000000000000AA" 
                    onSuccess={(token) => setTurnstileToken(token)}
                  />
                </div>

                <Button className="w-full mt-2" type="submit" disabled={isLoading || !turnstileToken}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Entrar no Painel
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col">
            <p className="mt-4 text-xs text-center text-muted-foreground">
              Não possui uma conta?{" "}
              <Link href="/sindico/cadastro" className="text-emerald-600 hover:text-emerald-700 font-bold hover:underline transition-all">
                Cadastre seu condomínio
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}