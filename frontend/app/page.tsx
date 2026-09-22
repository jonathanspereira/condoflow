import { Metadata } from "next"
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Building2, Clock, PlusCircle, Search, User, UserCog, ShieldCheck } from "lucide-react";


export const metadata: Metadata = {
  title: "CondoFlow - Gestão de Ocorrências",
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
            <Link href="/portaria/login">
              <ShieldCheck className="mr-2 h-4 w-4" />
              Área da Portaria
            </Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/sindico/login">
              <UserCog className="mr-2 h-4 w-4" />
              Área do Síndico
            </Link>
          </Button>
          <Button asChild className="hidden sm:flex bg-emerald-600 hover:bg-emerald-700 text-white font-bold ml-2">
            <Link href="/sindico/cadastro">
              Cadastre-se Agora
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        {/* Seção Hero */}
        <section className="relative overflow-hidden py-20 px-8 bg-slate-50 border-b">
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
          <div className="relative max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left z-10">
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-slate-900 mb-6">
                Gestão de Ocorrências <br className="hidden md:block" />
                <span className="text-emerald-600 bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500">Sem Complicação.</span>
              </h1>
              <p className="mx-auto lg:mx-0 max-w-[600px] text-slate-500 md:text-xl mb-10">
                A plataforma oficial para moradores e síndicos resolverem problemas do condomínio com transparência, agilidade e inteligência.
              </p>
            </div>

            <div className="flex-1 relative w-full max-w-lg lg:max-w-none h-[400px] hidden md:block z-10">
              {/* Floating UI Elements */}
              <div className="absolute top-10 right-10 w-72 bg-white/80 backdrop-blur-md border border-white/40 shadow-2xl rounded-2xl p-4 transform rotate-3 hover:rotate-0 transition-transform duration-500 animate-float">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-emerald-100 p-2 rounded-full">
                    <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">Ocorrência #492 Resolvida</p>
                    <p className="text-xs text-slate-500">Há 2 minutos</p>
                  </div>
                </div>
                <div className="h-2 bg-emerald-100 rounded-full w-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-full rounded-full"></div>
                </div>
              </div>

              <div className="absolute bottom-10 left-0 w-64 bg-slate-900/90 backdrop-blur-md border border-slate-700 shadow-2xl rounded-2xl p-4 transform -rotate-3 hover:rotate-0 transition-transform duration-500 animate-float-delayed">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-blue-500/20 p-2 rounded-full">
                    <UserCog className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Novo Morador Ativo</p>
                    <p className="text-xs text-slate-400">Apto 402 - Bloco B</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="h-6 w-16 bg-slate-700 rounded-md"></div>
                  <div className="h-6 w-12 bg-slate-700 rounded-md"></div>
                </div>
              </div>

              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 bg-white shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] rounded-3xl p-6 border border-slate-100 z-20">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-emerald-600" /> Visão Geral
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer">
                    <span className="text-sm font-medium text-slate-600">Ocorrências Abertas</span>
                    <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">12</span>
                  </div>
                  <div className="flex justify-between items-center p-2 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer">
                    <span className="text-sm font-medium text-slate-600">Encomendas Pendentes</span>
                    <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-1 rounded-full">5</span>
                  </div>
                  <div className="flex justify-between items-center p-2 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer">
                    <span className="text-sm font-medium text-slate-600">Reservas Hoje</span>
                    <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">3</span>
                  </div>
                </div>
              </div>
            </div>
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