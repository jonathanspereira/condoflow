"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Building2, Check, ArrowRight, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

export default function PlanosPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string>("TRIAL")
  const [condoId, setCondoId] = useState<string | null>(null)

  useEffect(() => {
    // In a real scenario, after registration, we might need to know the condo ID.
    // If the backend /me endpoint returns the condominiums, we can fetch it,
    // or we can just apply it to the first one. Let's fetch /me to get condo ID.
    const token = localStorage.getItem("condoflow_token")
    if (!token) {
      router.push("/sindico/login")
      return
    }

    fetch("http://localhost:8080/api/v1/condominiums/me", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          setCondoId(data[0].id.toString())
          localStorage.setItem("condoflow_selected_condo_id", data[0].id.toString())
        }
      })
      .catch(console.error)
  }, [router])

  const handleSelectPlan = async (plan: string) => {
    setSelectedPlan(plan)
  }

  const handleContinue = async () => {
    if (!condoId) {
      toast.error("Erro ao identificar seu condomínio.")
      return
    }

    setIsLoading(true)
    const token = localStorage.getItem("condoflow_token")

    try {
      const response = await fetch(`http://localhost:8080/api/v1/condominiums/${condoId}/plan`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "X-Tenant-ID": condoId,
        },
        body: JSON.stringify({ plan: selectedPlan }),
      })

      if (response.ok) {
        toast.success("Plano selecionado com sucesso!")
        router.push("/sindico/condominio")
      } else {
        toast.error("Erro ao selecionar o plano.")
      }
    } catch (error) {
      console.error(error)
      toast.error("Erro de conexão.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="h-16 bg-white border-b flex items-center justify-between px-8">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-600 p-2 rounded-lg">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-lg text-slate-900 tracking-tight">CondoFlow</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Escolha o plano ideal para o seu condomínio
          </h1>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            Você pode começar com 30 dias grátis para conhecer a plataforma, ou já garantir os recursos avançados dos planos pagos.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto w-full">
          {/* Trial Plan */}
          <div 
            onClick={() => handleSelectPlan("TRIAL")}
            className={`cursor-pointer relative rounded-2xl border p-8 shadow-sm flex flex-col transition-all duration-200 ${
            selectedPlan === "TRIAL" ? "border-emerald-600 ring-2 ring-emerald-600" : "border-slate-200 hover:border-emerald-300 bg-white"
          }`}>
            {selectedPlan === "TRIAL" && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-3 py-1 text-xs font-bold uppercase rounded-full tracking-wider">
                Selecionado
              </span>
            )}
            <h3 className="text-xl font-bold text-slate-900">Teste Grátis</h3>
            <p className="mt-2 text-slate-500 text-sm">Perfeito para conhecer todas as funcionalidades.</p>
            <p className="mt-6 flex items-baseline gap-x-1">
              <span className="text-4xl font-bold tracking-tight text-slate-900">R$0</span>
              <span className="text-sm font-semibold leading-6 text-slate-500">/ 30 dias</span>
            </p>
            <ul className="mt-8 space-y-3 text-sm leading-6 text-slate-600 flex-1">
              <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-emerald-600" /> Todas as funcionalidades base</li>
              <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-emerald-600" /> Suporte comunitário</li>
            </ul>
          </div>

          {/* Basic Plan */}
          <div 
            onClick={() => handleSelectPlan("BASIC")}
            className={`cursor-pointer relative rounded-2xl border p-8 shadow-sm flex flex-col transition-all duration-200 ${
            selectedPlan === "BASIC" ? "border-emerald-600 ring-2 ring-emerald-600" : "border-slate-200 hover:border-emerald-300 bg-white"
          }`}>
            {selectedPlan === "BASIC" && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-3 py-1 text-xs font-bold uppercase rounded-full tracking-wider">
                Selecionado
              </span>
            )}
            <h3 className="text-xl font-bold text-slate-900">Básico</h3>
            <p className="mt-2 text-slate-500 text-sm">Para condomínios pequenos buscando organização.</p>
            <p className="mt-6 flex items-baseline gap-x-1">
              <span className="text-4xl font-bold tracking-tight text-slate-900">R$99</span>
              <span className="text-sm font-semibold leading-6 text-slate-500">/ mês</span>
            </p>
            <ul className="mt-8 space-y-3 text-sm leading-6 text-slate-600 flex-1">
              <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-emerald-600" /> Gestão de ocorrências</li>
              <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-emerald-600" /> Até 50 unidades</li>
              <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-emerald-600" /> Suporte por email</li>
            </ul>
          </div>

          {/* Pro Plan */}
          <div 
            onClick={() => handleSelectPlan("PRO")}
            className={`cursor-pointer relative rounded-2xl border p-8 shadow-sm flex flex-col transition-all duration-200 bg-slate-900 text-white ${
            selectedPlan === "PRO" ? "ring-2 ring-emerald-500 border-emerald-500" : "border-slate-800"
          }`}>
            {selectedPlan === "PRO" && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-3 py-1 text-xs font-bold uppercase rounded-full tracking-wider">
                Selecionado
              </span>
            )}
            <h3 className="text-xl font-bold">Profissional</h3>
            <p className="mt-2 text-slate-400 text-sm">A solução completa para o seu condomínio.</p>
            <p className="mt-6 flex items-baseline gap-x-1">
              <span className="text-4xl font-bold tracking-tight">R$299</span>
              <span className="text-sm font-semibold leading-6 text-slate-400">/ mês</span>
            </p>
            <ul className="mt-8 space-y-3 text-sm leading-6 text-slate-300 flex-1">
              <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-emerald-400" /> Unidades ilimitadas</li>
              <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-emerald-400" /> Importação em massa</li>
              <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-emerald-400" /> Suporte prioritário 24/7</li>
            </ul>
          </div>
        </div>

        <div className="mt-12">
          <Button
            onClick={handleContinue}
            disabled={isLoading || !condoId}
            size="lg"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-14 px-8 text-lg w-[300px]"
          >
            {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Continuar para o Painel"}
            {!isLoading && <ArrowRight className="ml-2 h-5 w-5" />}
          </Button>
        </div>
      </main>
    </div>
  )
}
