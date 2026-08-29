"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Building2, SearchX } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-10 text-center flex flex-col items-center">
        <div className="bg-emerald-100 p-4 rounded-full mb-6 relative">
          <Building2 className="h-10 w-10 text-emerald-600" />
          <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-sm">
             <SearchX className="h-5 w-5 text-slate-400" />
          </div>
        </div>
        
        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">404</h1>
        <h2 className="text-xl font-bold text-slate-700 mb-4">Página não encontrada</h2>
        
        <p className="text-slate-500 mb-8 leading-relaxed text-sm">
          A página que você está procurando pode ter sido removida, mudado de nome, ou está temporariamente indisponível.
        </p>
        
        <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-base font-semibold shadow-sm transition-all rounded-xl">
          <Link href="/">
            Voltar para o Início
          </Link>
        </Button>
      </div>
    </div>
  )
}
