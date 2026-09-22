"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2, QrCode } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode"

export default function LeitorEncomendasPage() {
  const router = useRouter()
  const [scanResult, setScanResult] = useState<string | null>(null)
  const [isDelivering, setIsDelivering] = useState(false)
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)

  useEffect(() => {
    // Configura o scanner
    scannerRef.current = new Html5QrcodeScanner(
      "reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
      },
      false
    )

    scannerRef.current.render(onScanSuccess, onScanError)

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => {
          console.error("Failed to clear html5QrcodeScanner. ", error);
        })
      }
    }
  }, [])

  const onScanSuccess = async (decodedText: string) => {
    // Para evitar múltiplos scans seguidos do mesmo código
    if (scanResult === decodedText || isDelivering) return
    setScanResult(decodedText)
    
    // Pausa o scanner enquanto processa
    if (scannerRef.current) {
      scannerRef.current.pause(true)
    }
    
    await processDelivery(decodedText)
  }

  const onScanError = (errorMessage: string) => {
    // Ignorando erros de não encontrar QR code a cada frame
  }

  const processDelivery = async (deliveryCode: string) => {
    setIsDelivering(true)
    try {
      const token = localStorage.getItem("condoflow_token")
      const condoId = localStorage.getItem("condoflow_selected_condo_id") || "1"

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/parcels/deliver`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "X-Tenant-ID": condoId,
        },
        body: JSON.stringify({ deliveryCode }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.message || "Código de liberação inválido ou pacote já entregue.")
      }

      const parcel = await res.json()
      toast.success(`Pacote "${parcel.description}" entregue com sucesso!`)
      
      // Volta para a página de encomendas após o sucesso
      setTimeout(() => {
        router.push("/portaria/encomendas")
      }, 2000)

    } catch (error: any) {
      toast.error(error.message)
      setScanResult(null)
      if (scannerRef.current) {
        scannerRef.current.resume()
      }
    } finally {
      setIsDelivering(false)
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/portaria/encomendas")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Leitor de Liberação</h1>
          <p className="text-sm text-slate-500 mt-1">Escaneie o QR Code do morador.</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          {!scanResult ? (
            <div id="reader" className="w-full overflow-hidden rounded-lg bg-slate-900"></div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center space-y-4">
              {isDelivering ? (
                <>
                  <Loader2 className="h-10 w-10 text-primary animate-spin" />
                  <p className="font-semibold text-slate-700">Validando código e entregando...</p>
                </>
              ) : (
                <>
                  <QrCode className="h-10 w-10 text-emerald-500" />
                  <p className="font-semibold text-emerald-700">Código lido com sucesso!</p>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      {!scanResult && (
        <p className="text-center text-xs text-slate-400">
          Aponte a câmera para a tela do celular do morador.
        </p>
      )}
    </div>
  )
}
