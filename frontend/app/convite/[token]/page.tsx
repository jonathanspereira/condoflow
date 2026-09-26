"use client"

import { useEffect, useState, useRef } from "react"
import { useParams } from "next/navigation"
import { Loader2, QrCode, CheckCircle2, ShieldCheck, Clock, User, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { QRCodeSVG } from "qrcode.react"

interface AccessAuth {
  id: number
  personName: string
  type: string
  status: string
  authorizedDate: string
  startTime: string
  endTime: string
  unitName: string
  residentName: string
  accessCode: string
  pin: string
}

export default function ConvitePublicoPage() {
  const { token } = useParams()
  const [auth, setAuth] = useState<AccessAuth | null>(null)
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState("")

  const [cpf, setCpf] = useState("")
  const [photoBase64, setPhotoBase64] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [showWebcam, setShowWebcam] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  async function fetchAuth() {
    setLoading(true)
    setErrorMsg("")
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/access/public/token/${token}`)
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || "Convite inválido ou expirado.")
      }
      const data = await res.json()
      setAuth(data)
    } catch (err: any) {
      setErrorMsg(err.message)
    } finally {
      setLoading(false)
    }
  }

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setShowWebcam(true)
    } catch (err) {
      toast.error("Não foi possível acessar a câmera. Verifique as permissões.")
    }
  }

  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
    }
    setShowWebcam(false)
  }

  useEffect(() => {
    fetchAuth()
    
    // Stop webcam if component unmounts
    return () => {
      stopWebcam()
    }
  }, [token])

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d")
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth
        canvasRef.current.height = videoRef.current.videoHeight
        context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height)
        const base64 = canvasRef.current.toDataURL("image/jpeg", 0.7)
        setPhotoBase64(base64)
        stopWebcam()
      }
    }
  }

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      setPhotoBase64(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cpf || !photoBase64) {
      toast.error("Por favor, preencha o CPF e tire uma foto.")
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/access/public/token/${token}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cpf, photoBase64 })
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || "Erro ao finalizar cadastro")
      }

      toast.success("Cadastro concluído!")
      fetchAuth() // Atualiza para mostrar o QR Code
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (isoDate: string) => {
    if (!isoDate) return ""
    const [year, month, day] = isoDate.split("-")
    return `${day}/${month}/${year}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-red-200">
          <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
            <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-2">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Acesso Indisponível</h2>
            <p className="text-slate-600">{errorMsg}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!auth) return null

  const isCompleted = auth.status !== "AGUARDANDO_CADASTRO"

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-primary rounded-2xl shadow-sm mb-2">
            <ShieldCheck className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Autorização de Acesso</h1>
          <p className="text-slate-500 text-sm">Condomínio gerenciado pelo CondoFlow</p>
        </div>

        <Card className="shadow-lg border-0 ring-1 ring-slate-900/5 overflow-hidden">
          <div className="bg-slate-900 px-6 py-4 flex flex-col sm:flex-row justify-between items-center text-white gap-2">
            <div className="text-center sm:text-left">
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Unidade Autorizada</p>
              <p className="font-bold text-lg">{auth.unitName || "---"}</p>
            </div>
            <div className="text-center sm:text-right">
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Morador Responsável</p>
              <p className="font-medium text-sm">{auth.residentName}</p>
            </div>
          </div>

          <CardContent className="p-6 space-y-6">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Pessoa Autorizada:</span>
                <span className="font-semibold text-slate-900">{auth.personName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Data de Acesso:</span>
                <span className="font-medium text-slate-900">{formatDate(auth.authorizedDate)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Período:</span>
                <span className="font-medium text-slate-900">{auth.startTime} às {auth.endTime}</span>
              </div>
            </div>

            {!isCompleted ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2 text-center pb-2">
                  <h3 className="font-bold text-slate-800">Finalize seu cadastro</h3>
                  <p className="text-xs text-slate-500">Para liberar sua credencial de acesso, preencha os dados abaixo. Este link expira em 15 minutos.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input 
                    id="cpf" 
                    required 
                    placeholder="000.000.000-00" 
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Sua Foto (Selfie)</Label>
                  {photoBase64 ? (
                    <div className="relative">
                      <img src={photoBase64} alt="Preview" className="w-full h-48 object-cover rounded-xl border-2 border-primary/20" />
                      <Button 
                        type="button" 
                        variant="secondary" 
                        size="sm" 
                        className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm"
                        onClick={() => setPhotoBase64(null)}
                      >
                        Refazer
                      </Button>
                    </div>
                  ) : showWebcam ? (
                    <div className="relative rounded-xl overflow-hidden bg-black flex flex-col items-center justify-center h-48">
                      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" />
                      <canvas ref={canvasRef} className="hidden" />
                      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-4">
                        <Button type="button" variant="destructive" size="sm" onClick={stopWebcam}>Cancelar</Button>
                        <Button type="button" variant="default" size="sm" onClick={takePhoto}>Capturar</Button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors"
                      onClick={() => {
                        if (/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                          fileInputRef.current?.click()
                        } else {
                          startWebcam()
                        }
                      }}
                    >
                      <User className="h-10 w-10 text-slate-300 mb-2" />
                      <p className="text-sm font-medium text-slate-600">Toque para tirar uma foto</p>
                      <p className="text-xs text-slate-400 mt-1 text-center">Será validada na portaria</p>
                      <input 
                        type="file" 
                        accept="image/*" 
                        capture="user" 
                        className="hidden" 
                        ref={fileInputRef}
                        onChange={handlePhotoCapture}
                      />
                    </div>
                  )}
                </div>

                <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-md font-bold" disabled={submitting}>
                  {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Gerar Credencial"}
                </Button>
              </form>
            ) : (
              <div className="space-y-6 pt-4">
                {auth.status === "CADASTRO_CONCLUIDO" || auth.status === "QR_CODE_GERADO" ? (
                  <div className="flex flex-col items-center space-y-6 animate-in zoom-in duration-300">
                    <div className="flex items-center gap-2 text-emerald-600 font-semibold bg-emerald-50 px-4 py-2 rounded-full">
                      <CheckCircle2 className="h-5 w-5" />
                      <span>Credencial Liberada</span>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border shadow-sm inline-block">
                      <QRCodeSVG value={auth.accessCode} size={200} />
                    </div>

                    <div className="text-center space-y-1 w-full border-t pt-6">
                      <p className="text-sm text-slate-500">Ou informe este código na portaria:</p>
                      <p className="text-4xl font-black text-slate-900 tracking-widest">{auth.pin}</p>
                    </div>

                    <p className="text-xs text-center text-slate-400 max-w-xs leading-relaxed">
                      Esta credencial só é válida na data autorizada entre {auth.startTime} e {auth.endTime}.
                    </p>
                  </div>
                ) : (
                  <div className="text-center p-6 bg-slate-50 rounded-xl">
                    <p className="font-semibold text-slate-700">Status atual: {auth.status}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
