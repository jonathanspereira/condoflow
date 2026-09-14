"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Download, Printer } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import { toast } from "sonner"

export default function QrCodePage() {
  const [condominiumId, setCondominiumId] = useState<string | null>(null)
  const [condominiumName, setCondominiumName] = useState<string>("Carregando...")
  const [isLoading, setIsLoading] = useState(true)
  const [url, setUrl] = useState<string>("")

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        const storedCondoId = localStorage.getItem("condoflow_selected_condo_id")
        if (storedCondoId) {
          setCondominiumId(storedCondoId)
          
          // Get condo info
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/condominiums/${storedCondoId}/public`)
          if (res.ok) {
            const data = await res.json()
            setCondominiumName(data.name)
          }

          // Build URL
          const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://condoflow.fun"
          setUrl(`${baseUrl}/ocorrencia`)
        }
      } catch (error) {
        console.error("Erro ao carregar dados do condomínio:", error)
        toast.error("Erro ao carregar dados.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    const svg = document.getElementById("qr-code-svg")
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      if (ctx) {
        ctx.fillStyle = "white"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0)
        
        const pngFile = canvas.toDataURL("image/png")
        const downloadLink = document.createElement("a")
        downloadLink.download = `QR_Code_${condominiumName.replace(/\s+/g, '_')}.png`
        downloadLink.href = `${pngFile}`
        downloadLink.click()
      }
    }
    
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!condominiumId) {
    return (
      <div className="p-6">
        <p className="text-red-500 font-semibold">Nenhum condomínio selecionado.</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <header className="mb-8 print:hidden">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">QR Code do Condomínio</h1>
        <p className="text-muted-foreground text-lg">
          Gere e imprima o QR Code para que moradores, visitantes e prestadores relatem ocorrências facilmente.
        </p>
      </header>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Cartaz para Impressão */}
        <Card className="flex-1 border-2 shadow-lg print:shadow-none print:border-none print:w-full print:h-screen flex flex-col justify-center bg-slate-50 relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-32 bg-primary/10 rounded-t-lg print:hidden" />
          <CardContent className="pt-16 pb-16 flex flex-col items-center justify-center text-center space-y-8 relative z-10">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight uppercase print:text-6xl">
                Ouvidoria
              </h2>
              <h3 className="text-2xl font-bold text-primary max-w-md mx-auto print:text-4xl">
                {condominiumName}
              </h3>
            </div>
            
            <p className="text-lg text-slate-600 font-medium max-w-sm print:text-2xl print:max-w-xl">
              Aponte a câmera do seu celular para registrar ocorrências, sugestões ou problemas.
            </p>
            
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100 print:shadow-none print:border-8 print:border-slate-900 inline-block">
              <QRCodeSVG
                id="qr-code-svg"
                value={url}
                size={250}
                level="H"
                includeMargin={true}
                className="print:w-[400px] print:h-[400px]"
              />
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest print:text-xl">ID do Condomínio</p>
              <div className="bg-slate-900 text-white font-mono text-4xl md:text-5xl font-bold py-3 px-8 rounded-lg tracking-widest print:text-7xl shadow-inner inline-block">
                {condominiumId}
              </div>
            </div>

            <p className="text-xs text-slate-400 max-w-xs pt-4 print:text-lg">
              Em caso de dúvidas, procure o síndico ou a administração.
            </p>
          </CardContent>
        </Card>

        {/* Ações */}
        <Card className="w-full md:w-80 shrink-0 h-fit print:hidden">
          <CardHeader>
            <CardTitle>Ações</CardTitle>
            <CardDescription>Opções de compartilhamento e impressão.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handlePrint} className="w-full gap-2 h-12 text-lg">
              <Printer className="h-5 w-5" />
              Imprimir Cartaz
            </Button>
            <Button onClick={handleDownload} variant="outline" className="w-full gap-2 h-12">
              <Download className="h-5 w-5" />
              Baixar QR Code
            </Button>
          </CardContent>
          <CardFooter className="bg-slate-50 rounded-b-lg border-t p-4 text-xs text-slate-500 leading-relaxed">
            Dica: Fixe este cartaz em áreas comuns como elevadores, murais de aviso e portaria para facilitar o acesso de todos.
          </CardFooter>
        </Card>
      </div>

      {/* Estilos para impressão */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:w-full, .print\\:w-full * {
            visibility: visible;
          }
          .print\\:w-full {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        }
      `}} />
    </div>
  )
}
