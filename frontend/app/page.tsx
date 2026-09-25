"use client"

import { useState } from "react"
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Building2, Clock, PlusCircle, Search, User, UserCog, ShieldCheck, QrCode, PackageCheck, Smartphone } from "lucide-react";
import { motion } from "framer-motion";

export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-white overflow-hidden">
      {/* Header Simples */}
      <header className="flex h-16 items-center justify-between px-4 md:px-8 border-b relative z-50 bg-white/80 backdrop-blur-md">
        <div className="flex items-center gap-2 font-bold text-xl text-primary">
          <Building2 className="h-6 w-6" />
          <span>CondoFlow</span>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-2">
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
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold ml-2">
            <Link href="/sindico/cadastro">
              Cadastre-se Agora
            </Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
        </Button>
      </header>

      {/* Mobile Navigation Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden flex flex-col bg-white border-b px-4 py-4 space-y-2 relative z-40">
          <Button asChild variant="ghost" className="justify-start">
            <Link href="/morador/login">
              <User className="mr-2 h-4 w-4" />
              Área do Morador
            </Link>
          </Button>
          <Button asChild variant="ghost" className="justify-start">
            <Link href="/portaria/login">
              <ShieldCheck className="mr-2 h-4 w-4" />
              Área da Portaria
            </Link>
          </Button>
          <Button asChild variant="ghost" className="justify-start">
            <Link href="/sindico/login">
              <UserCog className="mr-2 h-4 w-4" />
              Área do Síndico
            </Link>
          </Button>
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold justify-start">
            <Link href="/sindico/cadastro">
              Cadastre-se Agora
            </Link>
          </Button>
        </div>
      )}

      <main className="flex-1">
        {/* Seção Hero */}
        <section className="relative overflow-hidden py-20 px-8 bg-slate-50 border-b perspective-1000">
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
          <div className="relative max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
            
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex-1 text-center lg:text-left z-10"
            >
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-slate-900 mb-6">
                Gestão de Ocorrências <br className="hidden md:block" />
                <span className="text-emerald-600 bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500">Sem Complicação.</span>
              </h1>
              <p className="mx-auto lg:mx-0 max-w-[600px] text-slate-500 md:text-xl mb-10">
                A plataforma oficial para moradores e síndicos resolverem problemas do condomínio com transparência, agilidade e controle inteligente de encomendas.
              </p>
            </motion.div>

            <div className="flex-1 relative w-full max-w-lg lg:max-w-none h-[500px] hidden md:block z-10 transform-style-3d">
              {/* Central Dashboard Card with 3D Float */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.8, rotateY: -15, rotateX: 10 }}
                animate={{ opacity: 1, scale: 1, rotateY: [-10, 10, -10], rotateX: [5, -5, 5] }}
                transition={{ 
                  opacity: { duration: 1 },
                  scale: { duration: 1 },
                  rotateY: { repeat: Infinity, duration: 8, ease: "easeInOut" },
                  rotateX: { repeat: Infinity, duration: 6, ease: "easeInOut" }
                }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 bg-white shadow-2xl shadow-emerald-900/10 rounded-3xl p-6 border border-slate-100 z-20"
                style={{ transformStyle: "preserve-3d" }}
              >
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2" style={{ transform: "translateZ(20px)" }}>
                  <Building2 className="h-5 w-5 text-emerald-600" /> Visão Geral
                </h3>
                <div className="space-y-3" style={{ transform: "translateZ(30px)" }}>
                  <div className="flex justify-between items-center p-2 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-slate-100">
                    <span className="text-sm font-medium text-slate-600">Ocorrências Abertas</span>
                    <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">12</span>
                  </div>
                  <div className="flex justify-between items-center p-2 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-slate-100">
                    <span className="text-sm font-medium text-slate-600">Encomendas Pendentes</span>
                    <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-1 rounded-full">5</span>
                  </div>
                  <div className="flex justify-between items-center p-2 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-slate-100">
                    <span className="text-sm font-medium text-slate-600">Reservas Hoje</span>
                    <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">3</span>
                  </div>
                </div>
              </motion.div>

              {/* QR Code Validation Floating Feature */}
              <motion.div 
                initial={{ opacity: 0, x: 50, y: -50 }}
                animate={{ opacity: 1, x: 0, y: [-10, 10, -10] }}
                transition={{ 
                  opacity: { duration: 1, delay: 0.3 },
                  x: { duration: 1, delay: 0.3 },
                  y: { repeat: Infinity, duration: 4, ease: "easeInOut", delay: 1 } 
                }}
                className="absolute top-10 right-0 w-64 bg-slate-900/90 backdrop-blur-md border border-slate-700 shadow-2xl rounded-2xl p-4 z-30"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-emerald-500/20 p-2 rounded-xl">
                    <QrCode className="h-6 w-6 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Retirada Segura</p>
                    <p className="text-[10px] text-emerald-400 uppercase tracking-wider font-semibold">QR Code Validado</p>
                  </div>
                </div>
                <div className="flex items-center justify-center p-2 bg-white/10 rounded-lg border border-white/5 border-dashed">
                  <PackageCheck className="h-8 w-8 text-white/80" />
                </div>
              </motion.div>

              {/* Occurrence Resolved Floating Feature */}
              <motion.div 
                initial={{ opacity: 0, x: -50, y: 50 }}
                animate={{ opacity: 1, x: 0, y: [10, -10, 10] }}
                transition={{ 
                  opacity: { duration: 1, delay: 0.6 },
                  x: { duration: 1, delay: 0.6 },
                  y: { repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1.5 } 
                }}
                className="absolute bottom-10 left-5 w-72 bg-white/90 backdrop-blur-md border border-white/40 shadow-[0_20px_50px_-12px_rgba(16,185,129,0.2)] rounded-2xl p-4 z-10"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <ShieldCheck className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">Ocorrência #492 Resolvida</p>
                    <p className="text-xs text-slate-500">Há 2 minutos</p>
                  </div>
                </div>
                <div className="h-1.5 bg-blue-50 rounded-full w-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2, delay: 1, ease: "easeInOut" }}
                    className="h-full bg-blue-500 rounded-full"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Seção de Funcionalidades que Geram Valor */}
        <section className="py-24 px-8 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Tudo que seu condomínio precisa</h2>
            <p className="text-slate-500 mt-4 max-w-2xl mx-auto">Funcionalidades pensadas para gerar segurança e valor para moradores e administração.</p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3 perspective-1000">
            <motion.div 
              whileHover={{ scale: 1.05, rotateY: 5, rotateX: 5 }}
              className="flex flex-col items-center text-center p-8 bg-white border border-slate-100 shadow-xl shadow-slate-200/50 rounded-3xl transition-all duration-300 transform-style-3d cursor-pointer"
            >
              <div className="mb-6 p-4 bg-emerald-50 rounded-2xl ring-1 ring-emerald-100" style={{ transform: "translateZ(20px)" }}>
                <QrCode className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="font-bold text-xl mb-3 text-slate-800" style={{ transform: "translateZ(30px)" }}>Controle de Encomendas</h3>
              <p className="text-sm text-slate-500 leading-relaxed" style={{ transform: "translateZ(10px)" }}>
                Chega de pacotes perdidos. O morador recebe um QR Code único no e-mail e faz a retirada na portaria em segundos, com total segurança e registro no sistema.
              </p>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.05, rotateY: -5, rotateX: 5 }}
              className="flex flex-col items-center text-center p-8 bg-white border border-slate-100 shadow-xl shadow-slate-200/50 rounded-3xl transition-all duration-300 transform-style-3d cursor-pointer"
            >
              <div className="mb-6 p-4 bg-blue-50 rounded-2xl ring-1 ring-blue-100" style={{ transform: "translateZ(20px)" }}>
                <ShieldCheck className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-bold text-xl mb-3 text-slate-800" style={{ transform: "translateZ(30px)" }}>Ocorrências Seguras</h3>
              <p className="text-sm text-slate-500 leading-relaxed" style={{ transform: "translateZ(10px)" }}>
                Relate problemas de infraestrutura ou convivência. Escolha entre relatos identificados ou anônimos, com acompanhamento de status em tempo real.
              </p>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.05, rotateY: 5, rotateX: -5 }}
              className="flex flex-col items-center text-center p-8 bg-white border border-slate-100 shadow-xl shadow-slate-200/50 rounded-3xl transition-all duration-300 transform-style-3d cursor-pointer"
            >
              <div className="mb-6 p-4 bg-purple-50 rounded-2xl ring-1 ring-purple-100" style={{ transform: "translateZ(20px)" }}>
                <Building2 className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-bold text-xl mb-3 text-slate-800" style={{ transform: "translateZ(30px)" }}>Gestão Multi-Prédios</h3>
              <p className="text-sm text-slate-500 leading-relaxed" style={{ transform: "translateZ(10px)" }}>
                A solução definitiva para Síndicos Profissionais. Troque de condomínio com um clique e tenha a visão geral de todos os seus clientes numa única tela.
              </p>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t bg-slate-50 mt-auto">
        <div className="max-w-5xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">© 2026 CondoFlow. Sistema de Gestão de Condomínios.</p>
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