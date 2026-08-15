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

const ALLOWED_ROLES = ["SINDICO", "SUPER_ADMIN"]

export default function LoginSindicoPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await fetch("http://localhost:8080/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      })

      if (response.ok) {
        const data = await response.json()

        if (!ALLOWED_ROLES.includes(data.role)) {
          setError("Este acesso é exclusivo para síndicos. Use o login de morador.")
          toast.error("Acesso negado.", { description: "Este login é exclusivo para síndicos." })
          setIsLoading(false)
          return
        }

        localStorage.setItem("condoflow_token", data.token)
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
            <form onSubmit={onSubmit}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">E-mail corporativo</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="sindico@condominio.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    required
                  />
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>
                <Button className="w-full" type="submit" disabled={isLoading}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Entrar no Painel
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col">
            <p className="mt-2 text-xs text-center text-muted-foreground">
              Sem credenciais? Solicite liberação ao administrador master da conta.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}