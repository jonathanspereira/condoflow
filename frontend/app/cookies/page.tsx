import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Cookie } from "lucide-react";

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-xl text-primary">
          <Cookie className="h-6 w-6" />
          <span>CondoFlow Cookies</span>
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
          <h1 className="text-3xl font-bold text-slate-900 mb-6">Política de Cookies</h1>
          
          <div className="prose prose-slate max-w-none space-y-6 text-slate-600">
            <p>
              Como é prática comum em quase todos os sites profissionais e sistemas web, este site usa cookies (e tecnologias semelhantes como o LocalStorage) para melhorar a sua experiência.
            </p>
            
            <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">Como usamos os Cookies?</h2>
            <p>
              Utilizamos cookies e tecnologias de armazenamento local do seu navegador para as seguintes finalidades essenciais:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Autenticação e Sessão:</strong> Para manter você logado de forma segura no painel do morador ou síndico sem precisar digitar a senha a cada clique.
              </li>
              <li>
                <strong>Preferências de Interface:</strong> Para lembrar configurações visuais (como tabelas e menus abertos ou fechados).
              </li>
            </ul>
            
            <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">Cookies Essenciais</h2>
            <p>
              O CondoFlow não utiliza cookies de rastreamento de terceiros (como Facebook Pixel ou redes de publicidade). Todos os dados armazenados localmente são classificados como <em>Estritamente Necessários</em> para o funcionamento técnico do sistema do seu condomínio.
            </p>
            
            <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">Desativando Cookies</h2>
            <p>
              Você pode impedir a configuração de cookies ajustando as configurações do seu navegador (consulte a Ajuda do navegador para saber como fazer isso). No entanto, esteja ciente de que a desativação afetará completamente a funcionalidade deste sistema, impedindo que você faça login ou abra ocorrências.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
