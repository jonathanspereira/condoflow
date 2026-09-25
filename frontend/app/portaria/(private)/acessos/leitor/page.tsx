"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2, QrCode, UserCheck, KeyRound, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Scanner } from "@yudiel/react-qr-scanner"
import { Label } from "@/components/ui/label"

interface AccessAuth {
  id: number
  personName: string
  personPhotoUrl: string
  type: string
  company: string
  service: string
  status: string
  authorizedDate: string
  startTime: string
  endTime: string
  unitName: string
  residentName: string
  accessCode: string
}

export default function LeitorAcessosPage() {
  const router = useRouter()
  const [mode, setMode] = useState<"QR" | "PIN">("QR")
  const [pinInput, setPinInput] = useState("")
  const [auth, setAuth] = useState<AccessAuth | null>(null)

  const [isLoading, setIsLoading] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)

  const handleValidate = async (codeOrPin: string) => {
    if (!codeOrPin) return
    setIsLoading(true)
    try {
      const token = localStorage.getItem("condoflow_token")
      const condoId = localStorage.getItem("condoflow_selected_condo_id") || "1"

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/access/validate/${codeOrPin}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Tenant-ID": condoId,
        },
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || "Código inválido ou expirado.")
      }

      const data: AccessAuth = await res.json()
      setAuth(data)
      toast.success("Credencial validada!")

    } catch (error: any) {
      toast.error(error.message)
      setAuth(null)
    } finally {
      setIsLoading(false)
    }
  }

  const registerEntry = async () => {
    if (!auth) return
    setIsRegistering(true)
    try {
      const token = localStorage.getItem("condoflow_token")
      const condoId = localStorage.getItem("condoflow_selected_condo_id") || "1"

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/access/register-entry/${auth.accessCode}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Tenant-ID": condoId,
        },
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || "Erro ao registrar entrada.")
      }

      toast.success("Entrada registrada com sucesso!")
      setTimeout(() => router.push("/portaria/acessos"), 1500)

    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsRegistering(false)
    }
  }

  const formatDate = (isoDate: string) => {
    if (!isoDate) return ""
    const [year, month, day] = isoDate.split("-")
    return `${day}/${month}/${year}`
  }

  return (
    <div className="p-4 md:p-8 max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/portaria/acessos")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Validar Acesso</h1>
          <p className="text-sm text-slate-500 mt-1">Escanear QR Code ou digitar PIN de 4 dígitos.</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-4 sm:p-6 space-y-6">

          {!auth ? (
            <>
              <div className="flex bg-slate-100 p-1 rounded-lg">
                <Button
                  variant={mode === "QR" ? "default" : "ghost"}
                  className={`w-1/2 rounded-md ${mode === "QR" ? "bg-white text-slate-900 shadow-sm hover:bg-white" : ""}`}
                  onClick={() => setMode("QR")}
                >
                  <QrCode className="h-4 w-4 mr-2" />
                  QR Code
                </Button>
                <Button
                  variant={mode === "PIN" ? "default" : "ghost"}
                  className={`w-1/2 rounded-md ${mode === "PIN" ? "bg-white text-slate-900 shadow-sm hover:bg-white" : ""}`}
                  onClick={() => setMode("PIN")}
                >
                  <KeyRound className="h-4 w-4 mr-2" />
                  Código PIN
                </Button>
              </div>

              {isLoading ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-4">
                  <Loader2 className="h-10 w-10 text-primary animate-spin" />
                  <p className="font-semibold text-slate-700">Validando credencial...</p>
                </div>
              ) : mode === "QR" ? (
                <div className="w-full overflow-hidden rounded-lg bg-slate-900 aspect-square flex items-center">
                  <Scanner
                    onScan={(result) => handleValidate(result[0].rawValue)}
                    onError={(error) => console.log(error?.message)}
                  />
                </div>
              ) : (
                <div className="space-y-4 py-8">
                  <div className="space-y-2 text-center">
                    <Label htmlFor="pin" className="text-base">Digite o PIN do visitante</Label>
                    <Input
                      id="pin"
                      value={pinInput}
                      onChange={(e) => setPinInput(e.target.value)}
                      placeholder="0000"
                      className="text-center text-3xl font-black tracking-[0.5em] h-16 uppercase"
                      maxLength={4}
                    />
                  </div>
                  <Button
                    className="w-full h-12 text-lg"
                    onClick={() => handleValidate(pinInput)}
                    disabled={pinInput.length !== 4}
                  >
                    Validar
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-6 animate-in fade-in zoom-in duration-300">
              <div className="flex flex-col items-center justify-center space-y-2 text-center border-b border-slate-100 pb-6">
                <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-2">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Acesso Autorizado</h2>
                <Badge className="bg-emerald-100 text-emerald-800">{auth.type}</Badge>
              </div>

              <div className="flex flex-col items-center gap-4">
                {auth.personPhotoUrl ? (
                  <img src={auth.personPhotoUrl} alt={auth.personName} className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md" />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border-4 border-white shadow-md">
                    <UserCheck className="h-12 w-12" />
                  </div>
                )}
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-slate-900">{auth.personName}</h3>
                  {auth.type !== "VISITOR" && (
                    <p className="text-sm font-semibold text-slate-600 mt-1">{auth.company} • {auth.service}</p>
                  )}
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Unidade:</span>
                  <span className="font-bold text-slate-900 text-lg">{auth.unitName}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Morador:</span>
                  <span className="font-medium text-slate-900">{auth.residentName}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Período Válido:</span>
                  <span className="font-medium text-slate-900">{formatDate(auth.authorizedDate)} - {auth.startTime} às {auth.endTime}</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <Button variant="outline" className="w-full sm:w-1/2" onClick={() => setAuth(null)} disabled={isRegistering}>
                  Voltar
                </Button>
                <Button
                  className="w-full sm:w-1/2 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={registerEntry}
                  disabled={isRegistering}
                >
                  {isRegistering ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCheck className="h-4 w-4" />}
                  Liberar Entrada
                </Button>
              </div>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  )
}
