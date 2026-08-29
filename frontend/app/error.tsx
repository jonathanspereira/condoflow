"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Home, RefreshCcw } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Aqui nós poderíamos conectar com serviços como Sentry, LogRocket, etc.
    console.error("Erro detectado pelo Error Boundary do sistema:", error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white shadow-xl rounded-2xl p-8 text-center border border-slate-100">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="h-8 w-8 text-amber-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Ops! Algo deu errado.</h2>
        
        <p className="text-slate-600 mb-8 leading-relaxed">
          Nossa equipe técnica já foi notificada deste problema. Enquanto resolvemos, você pode tentar recarregar a página ou voltar para o início.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            onClick={() => reset()} 
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold h-11"
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Tentar Novamente
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => window.location.href = '/'}
            className="h-11 font-semibold text-slate-700"
          >
            <Home className="mr-2 h-4 w-4" />
            Página Inicial
          </Button>
        </div>
        
        <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-xs text-slate-400 font-medium">
            Se o erro persistir, entre em contato com o suporte.<br/>
            Código: {error.digest || "CF-ERR-500"}
          </p>
        </div>
      </div>
    </div>
  )
}
