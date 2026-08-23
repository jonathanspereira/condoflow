import { Metadata } from "next"
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Building2, Clock, PlusCircle, Search, User, UserCog, ShieldCheck } from "lucide-react";


export const metadata: Metadata = {
  title: "Página",
}

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header Simples */}
      <header className="flex h-16 items-center justify-between px-8 border-b">
        <div className="flex items-center gap-2 font-bold text-xl text-primary">
          <Building2 className="h-6 w-6" />
          <span>CondoFlow</span>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost">
            <Link href="/morador/login">
              <User className="mr-2 h-4 w-4" />
              Área do Morador
            </Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/sindico/login">
              <UserCog className="mr-2 h-4 w-4" />
              Área do Síndico
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        {/* Seção Hero */}
        <section className="py-20 px-8 text-center bg-slate-50 border-b">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-slate-900 mb-6">
            Gestão de Ocorrências <br className="hidden md:block" /> 
            <span className="text-primary">Sem Complicação.</span>
          </h1>
          <p className="mx-auto max-w-[600px] text-slate-500 md:text-xl mb-10">
            A plataforma oficial para moradores e síndicos resolverem problemas do condomínio com transparência e agilidade.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild size="lg" className="px-8 h-14 text-lg">
              <Link href="/ocorrencia">
                <PlusCircle className="mr-2 h-5 w-5" />
                Nova Ocorrência
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="px-8 h-14 text-lg">
              <Link href="/ocorrencia/consulta">
                <Search className="mr-2 h-5 w-5" />
                Consultar Protocolo
              </Link>
            </Button>
          </div>
        </section>

        {/* Seção de Atalhos Rápidos */}
        <section className="py-16 px-8 max-w-5xl mx-auto">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center text-center p-6">
              <div className="mb-4 p-3 bg-primary/10 rounded-full">
                <ShieldCheck className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2">Privacidade Total</h3>
              <p className="text-sm text-muted-foreground">Escolha entre relatos anônimos ou identificados com segurança.</p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6">
              <div className="mb-4 p-3 bg-primary/10 rounded-full">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2">Respostas Rápidas</h3>
              <p className="text-sm text-muted-foreground">Acompanhe em tempo real o status da sua solicitação.</p>
            </div>

            <div className="flex flex-col items-center text-center p-6">
              <div className="mb-4 p-3 bg-primary/10 rounded-full">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2">Vários Prédios</h3>
              <p className="text-sm text-muted-foreground">Síndicos profissionais gerenciam tudo em uma única tela.</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t bg-slate-50">
        <div className="max-w-5xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">© 2026 CondoFlow. Sistema de Gestão de Ocorrências.</p>
          <div className="flex gap-6 text-sm text-slate-500">
            <Link href="/privacidade" className="hover:text-primary transition-colors">Política de Privacidade</Link>
            <Link href="/cookies" className="hover:text-primary transition-colors">Política de Cookies</Link>
            <Link href="/lgpd" className="hover:text-primary transition-colors">Sobre a LGPD</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}