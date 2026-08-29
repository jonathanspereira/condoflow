import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.condoflow.com.br'),
  title: {
    template: '%s | CondoFlow',
    default: 'CondoFlow | Sistema Inteligente de Gestão de Condomínios',
  },
  description: "O CondoFlow é uma plataforma moderna para gestão de condomínios. Permite que síndicos organizem chamados e que moradores registrem ocorrências de forma fácil, segura e anônima.",
  keywords: ["gestão de condomínio", "software para síndico", "app morador", "abrir ocorrência condomínio", "sistema de administração de condomínio", "condoflow"],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://www.condoflow.com.br",
    title: "CondoFlow - Gestão Inteligente",
    description: "Revolucione a gestão do seu condomínio com o CondoFlow. Grátis para testar por 30 dias.",
    siteName: "CondoFlow",
  },
  twitter: {
    card: "summary_large_image",
    title: "CondoFlow - Gestão de Condomínios",
    description: "A melhor ferramenta para síndicos e moradores.",
  },
  alternates: {
    canonical: '/',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", inter.variable)}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
