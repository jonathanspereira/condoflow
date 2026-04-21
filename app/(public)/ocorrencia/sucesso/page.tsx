"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Copy, Check, ArrowRight, Printer } from "lucide-react"

export default function SucessoOcorrencia() {
  const [copied, setCopied] = useState(false)
  const protocolo = "CF-2026-X94B" // Este valor virá via URL ou Estado do formulário

  const copiarProtocolo = () => {
    navigator.clipboard.writeText(protocolo)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="container max-w-2xl py-20 px-4">
      <Card className="border-t-8 border-t-green-500 shadow-xl">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-3xl font-bold text-slate-900">Enviado com Sucesso!</CardTitle>
          <p className="text-muted-foreground">Sua ocorrência foi registrada e o síndico já foi notificado.</p>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          <div className="bg-slate-50 border rounded-lg p-6 text-center">
            <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Seu Código de Protocolo</span>
            <div className="flex items-center justify-center gap-3 mt-2">
              <code className="text-4xl font-mono font-bold text-primary tracking-tighter">
                {protocolo}
              </code>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={copiarProtocolo}
                className={copied ? "border-green-500 text-green-500" : ""}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-4 text-sm text-slate-600">
            <h4 className="font-bold text-slate-900 flex items-center gap-2">
              ⚠️ O que fazer agora?
            </h4>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Guarde este código:</strong> Ele é a sua única forma de consultar o status se você fez um relato anônimo.</li>
              <li><strong>Acompanhamento:</strong> Você pode clicar em "Consultar Protocolo" na página inicial a qualquer momento.</li>
              <li><strong>Prazo:</strong> O síndico costuma dar um retorno inicial em até 48h úteis.</li>
            </ul>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
          <Button asChild variant="outline" className="w-full">
            <Link href="/">
              Voltar para Início
            </Link>
          </Button>
          <Button asChild className="w-full">
            <Link href="/ocorrencia/consulta">
              Consultar Agora
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
      
      <div className="mt-8 text-center">
        <Button variant="ghost" size="sm" className="text-slate-400" onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" />
          Imprimir comprovante
        </Button>
      </div>
    </div>
  )
}