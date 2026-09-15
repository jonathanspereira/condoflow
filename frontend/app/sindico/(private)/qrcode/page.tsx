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
      <div className="flex flex-col md:flex-row gap-6">
        {/* Cartaz para Impressão */}
        <Card className="flex-1 border-2 shadow-lg flex flex-col justify-center bg-slate-50 relative overflow-hidden print:w-[148mm] print:h-[210mm] print:mx-auto print:border-2">
          <div className="absolute top-0 inset-x-0 h-32 bg-emerald-500 rounded-t-lg" />
          <CardContent className="pt-16 pb-16 flex flex-col items-center justify-center text-center space-y-8 relative z-10">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight uppercase mt-8">
                Ouvidoria
              </h2>
              <h3 className="text-2xl font-bold text-emerald-600 max-w-md mx-auto">
                {condominiumName}
              </h3>
            </div>
            
            <div className="space-y-1">
              <p className="text-lg text-slate-600 font-medium max-w-sm">
                Aponte a câmera do seu celular para registrar ocorrências, sugestões ou problemas.
              </p>
              <p className="text-lg font-bold text-emerald-600">
                ou acesse o site condoflow.fun
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-emerald-100 inline-block print:shadow-md">
              <QRCodeSVG
                id="qr-code-svg"
                value={url}
                size={180}
                level="H"
                includeMargin={true}
              />
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-bold text-emerald-700 uppercase tracking-widest">ID do Condomínio</p>
              <div className="bg-emerald-600 text-white font-mono text-4xl md:text-5xl font-bold py-3 px-8 rounded-lg tracking-widest shadow-inner inline-block">
                {condominiumId}
              </div>
            </div>

            <p className="text-xs text-slate-400 max-w-xs pt-4">
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
          @page {
            size: A5 portrait;
            margin: 0;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body * {
            visibility: hidden;
          }
          .print\\:w-\\[148mm\\], .print\\:w-\\[148mm\\] * {
            visibility: visible;
          }
          .print\\:w-\\[148mm\\] {
            position: absolute;
            left: 0;
            top: 0;
            margin: 0;
            width: 148mm !important;
            height: 210mm !important;
            page-break-inside: avoid;
          }
        }
      `}} />
    </div>
  )
}
