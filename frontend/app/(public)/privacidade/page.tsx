import { Metadata } from "next"
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShieldCheck } from "lucide-react";


export const metadata: Metadata = {
  title: "Política de Privacidade",
}

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-xl text-primary">
          <ShieldCheck className="h-6 w-6" />
          <span>CondoFlow Privacidade</span>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>
      </header>
      
      <main className="flex-1 max-w-4xl mx-auto w-full p-8">
        <div className="bg-white p-10 rounded-xl shadow-sm border border-slate-100">
          <h1 className="text-3xl font-bold text-slate-900 mb-6">Política de Privacidade</h1>
          
          <div className="prose prose-slate max-w-none space-y-6 text-slate-600">
            <p>
              A sua privacidade é importante para nós. É política do CondoFlow respeitar a sua privacidade em relação a qualquer informação sua que possamos coletar no sistema CondoFlow.
            </p>
            
            <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">1. Coleta de Dados</h2>
            <p>
              Solicitamos informações pessoais, como nome, e-mail e unidade, apenas quando realmente precisamos delas para lhe fornecer os serviços de gestão do seu condomínio. Fazemo-lo por meios justos e legais, com o seu conhecimento e consentimento do síndico/administração.
            </p>
            
            <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">2. Uso das Informações</h2>
            <p>
              Os dados coletados são utilizados exclusivamente para a comunicação interna do condomínio, registro de ocorrências e gestão predial. Não compartilhamos informações de identificação pessoal publicamente ou com terceiros, exceto quando exigido por lei.
            </p>

            <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">3. Ocorrências Anônimas</h2>
            <p>
              O sistema CondoFlow oferece o recurso de "Ocorrência Anônima". Ao utilizar essa modalidade, seus dados de identificação e unidade não são registrados ou visíveis para a administração (síndicos), garantindo sigilo absoluto do relator.
            </p>
            
            <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">4. Retenção de Dados</h2>
            <p>
              Apenas retemos as informações coletadas pelo tempo necessário para fornecer o serviço solicitado. Quando armazenamos dados, protegemos dentro de meios comercialmente aceitáveis para evitar perdas e roubos, bem como acesso, divulgação, cópia, uso ou modificação não autorizados.
            </p>

            <p className="pt-8 text-sm text-slate-400">
              Esta política é efetiva a partir de Janeiro de 2026.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
