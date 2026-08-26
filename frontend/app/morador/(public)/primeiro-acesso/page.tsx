"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Loader2, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

export default function PrimeiroAcessoPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("http://localhost:8080/api/v1/auth/first-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      })

      if (response.ok) {
        setIsSent(true)
      } else {
        const errorData = await response.json().catch(() => null)
        const msg = errorData?.message || "E-mail não encontrado ou erro no servidor."
        toast.error(msg)
      }
    } catch (error) {
      console.error("Erro ao conectar com o servidor:", error)
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

      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[380px]">
        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center font-bold">Primeiro Acesso</CardTitle>
            <CardDescription className="text-center">
              Informe seu e-mail para receber as instruções de criação de senha.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {isSent ? (
              <div className="flex flex-col items-center space-y-4 text-center py-4">
                <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-medium">E-mail enviado!</h3>
                  <p className="text-xs text-muted-foreground">Verifique sua caixa de entrada e siga as instruções para criar sua senha.</p>
                </div>
                <Link href="/morador/login" className="w-full mt-4">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 font-bold">
                    Ir para Login
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleResetPassword}>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nome@exemplo.com"
                      disabled={isLoading}
                      required
                    />
                  </div>
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 font-bold" type="submit" disabled={isLoading || !email}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Enviar instruções
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
          <CardFooter className="flex flex-col items-center justify-center space-y-2">
            {!isSent && (
              <div className="text-sm text-slate-500">
                Lembrou a senha?{" "}
                <Link href="/morador/login" className="text-emerald-600 font-semibold hover:underline">
                  Faça login
                </Link>
              </div>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
