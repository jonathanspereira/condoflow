"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Home, RefreshCcw } from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Erro fatal detectado no nível do Layout:", error)
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
          <div className="max-w-md w-full bg-white shadow-xl rounded-2xl p-8 text-center border border-slate-100">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="h-8 w-8 text-amber-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Ops! Ocorreu um erro crítico.</h2>
            
            <p className="text-slate-600 mb-8 leading-relaxed">
              Nossa equipe já foi notificada. Por favor, tente recarregar a página.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                onClick={() => reset()} 
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold h-11"
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                Tentar Novamente
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
