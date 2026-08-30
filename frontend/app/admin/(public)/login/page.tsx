"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ShieldCheck, Lock, Mail, ArrowRight, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"
import { Turnstile } from '@marsidev/react-turnstile'

export default function AdminLogin() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [turnstileToken, setTurnstileToken] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!turnstileToken) {
      toast.error("Por favor, valide o captcha antes de prosseguir.")
      return
    }
    
    setIsLoading(true)
    setErrorMessage("")

    try {
      // Usando a variável de ambiente configurada ou fallback para localhost
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1"

      const response = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, turnstileToken }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        const backendMsg = errorData?.message || "Credenciais inválidas. Verifique seu e-mail e senha."
        throw new Error(backendMsg)
      }

      const data = await response.json()

      // Salvamos o token JWT e dados do usuário no localStorage
      localStorage.setItem("condoflow_token", data.token)
      localStorage.setItem("condoflow_user", JSON.stringify({
        name: data.name,
        email: data.email,
        role: data.role
      }))

      // Redireciona para o painel administrativo
      toast.success("Login realizado com sucesso!")
      router.push("/admin/dashboard")
    } catch (error: any) {
      const msg = error.message || "Erro ao conectar com o servidor."
      setErrorMessage(msg)
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Detalhes de Background para estética Tech */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-900/20 blur-[120px] rounded-full" />
      </div>

      <div className="w-full max-w-[400px] z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-emerald-500 p-3 rounded-2xl shadow-lg shadow-emerald-500/20 mb-4">
            <ShieldCheck className="h-8 w-8 text-slate-950" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">CondoFlow <span className="text-emerald-500">HQ</span></h1>
          <p className="text-slate-400 text-sm">Acesso restrito ao Administrador Global</p>
        </div>

        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-white">Autenticação</CardTitle>
            <CardDescription className="text-slate-500 text-xs">
              Insira suas credenciais para acessar o painel.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {errorMessage && (
                <div className="bg-red-500/15 border border-red-500/30 text-red-400 p-3 rounded-lg text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300 text-xs uppercase font-bold tracking-widest">E-mail Admin</Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                  <Input 
                    id="email" 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nome@condoflow.com" 
                    className="bg-slate-950 border-slate-800 text-white pl-10 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500 h-11"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="pass" className="text-slate-300 text-xs uppercase font-bold tracking-widest">Senha</Label>
                  <Link href="/admin/esqueceu-senha" className="text-[10px] text-emerald-500 hover:underline">
                    Esqueceu a chave?
                  </Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                  <Input 
                    id="pass" 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-white pl-10 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500 h-11"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-center mt-4">
                <Turnstile 
                  siteKey="1x00000000000000000000AA" 
                  onSuccess={(token) => setTurnstileToken(token)}
                />
              </div>

              <Button 
                type="submit" 
                disabled={isLoading || !turnstileToken}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Acessar Infraestrutura <ArrowRight size={18} />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="mt-8 text-center text-[10px] text-slate-600 uppercase tracking-[0.2em]">
          Powered by CondoFlow Engine &copy; 2026
        </p>
      </div>
    </div>
  )
}