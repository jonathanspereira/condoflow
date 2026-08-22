"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ShieldCheck, Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function AdminEsqueceuSenha() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    // Simulando uma requisição de recuperação de senha
    setTimeout(() => {
      setIsLoading(false)
      setIsSent(true)
    }, 1500)
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
          <p className="text-slate-400 text-sm">Recuperação de Acesso Administrativo</p>
        </div>

        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-white">Esqueceu a senha?</CardTitle>
            <CardDescription className="text-slate-500 text-xs">
              Informe seu e-mail de administrador para receber as instruções de recuperação.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSent ? (
              <div className="flex flex-col items-center space-y-4 text-center py-4">
                <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-medium text-white">E-mail enviado!</h3>
                  <p className="text-xs text-slate-400">Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.</p>
                </div>
                <Link href="/admin/login" className="w-full mt-4">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11">
                    Voltar ao login
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-6">
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

                <div className="space-y-3">
                  <Button 
                    type="submit" 
                    disabled={isLoading || !email}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      "Enviar instruções"
                    )}
                  </Button>
                  
                  <Link href="/admin/login" className="block text-center mt-4">
                    <Button variant="link" type="button" className="text-xs text-slate-400 hover:text-emerald-500 flex items-center justify-center gap-2 w-full">
                      <ArrowLeft className="h-3 w-3" />
                      Voltar para o login
                    </Button>
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="mt-8 text-center text-[10px] text-slate-600 uppercase tracking-[0.2em]">
          Powered by CondoFlow Engine &copy; 2026
        </p>
      </div>
    </div>
  )
}
