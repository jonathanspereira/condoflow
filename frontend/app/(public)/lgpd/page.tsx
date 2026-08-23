import { Metadata } from "next"
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookLock } from "lucide-react";


export const metadata: Metadata = {
  title: "Sobre LGPD",
}

export default function LgpdPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-xl text-primary">
          <BookLock className="h-6 w-6" />
          <span>CondoFlow e a LGPD</span>
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
          <h1 className="text-3xl font-bold text-slate-900 mb-6">Sobre a LGPD</h1>
          
          <div className="prose prose-slate max-w-none space-y-6 text-slate-600">
            <p>
              A Lei Geral de Proteção de Dados (Lei nº 13.709/2018) estabelece regras sobre coleta, armazenamento, tratamento e compartilhamento de dados pessoais no Brasil. No CondoFlow, a sua privacidade e segurança são nossas maiores prioridades.
            </p>
            
            <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">Nossa Posição como Operadores de Dados</h2>
            <p>
              O CondoFlow atua como <strong>Operador</strong> dos dados sob a LGPD. Isso significa que processamos as informações em nome do seu condomínio (que é o <strong>Controlador</strong>). Nós não tomamos decisões sobre o uso dos seus dados, não os vendemos nem os repassamos a anunciantes.
            </p>
            
            <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">Direitos dos Moradores (Titulares)</h2>
            <p>
              Sob a LGPD, você tem o direito de:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Confirmar a existência de tratamento de seus dados.</li>
              <li>Acessar os seus dados registrados (diretamente pela sua conta no painel).</li>
              <li>Corrigir dados incompletos, inexatos ou desatualizados.</li>
              <li>Solicitar a anonimização ou exclusão de dados que sejam considerados desnecessários.</li>
            </ul>
            <p>
              A exclusão completa de dados em condomínios pode ter ressalvas legais e fiscais, onde o condomínio é obrigado por lei a reter certas informações. Qualquer pedido de exclusão profunda de dados deve ser direcionado à administração do seu condomínio.
            </p>

            <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">Segurança da Informação</h2>
            <p>
              Aplicamos medidas técnicas de segurança para proteger os dados armazenados em nossos servidores, usando criptografia para senhas e conexões (HTTPS), seguindo os melhores padrões do mercado de software.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
