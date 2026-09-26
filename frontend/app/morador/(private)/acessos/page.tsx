"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Users, Clock, QrCode, PlusCircle, Building2, Truck, Copy, Check, ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

interface AccessAuth {
  id: number
  personName: string
  type: string
  status: string
  authorizedDate: string
  startTime: string
  endTime: string
  linkToken: string
  pin?: string
  accessCode?: string
}

export default function MeusAcessosPage() {
  const [authorizations, setAuthorizations] = useState<AccessAuth[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedLink, setCopiedLink] = useState<number | null>(null)
  const [renewing, setRenewing] = useState<number | null>(null)
  const router = useRouter()

  async function fetchAuthorizations() {
    setLoading(true)
    const token = localStorage.getItem("condoflow_token")
    if (!token) return router.push("/morador/login")

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/access/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!res.ok) throw new Error("Erro ao carregar autorizações")
      const data = await res.json()
      setAuthorizations(data || [])
    } catch (error) {
      toast.error("Não foi possível carregar as autorizações.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAuthorizations()
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "AGUARDANDO_CADASTRO":
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Aguardando Cadastro</Badge>
      case "CADASTRO_CONCLUIDO":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Cadastro Concluído</Badge>
      case "DENTRO_DO_CONDOMINIO":
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Dentro do Condomínio</Badge>
      case "FINALIZADA":
        return <Badge className="bg-slate-100 text-slate-800 border-slate-200">Finalizada</Badge>
      case "CANCELADA":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Cancelada</Badge>
      case "LINK_EXPIRADO":
      case "CREDENCIAL_EXPIRADA":
        return <Badge className="bg-slate-100 text-slate-600 border-slate-200">Expirada</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTypeIcon = (type: string) => {
    if (type === "VISITOR") return <Users className="h-5 w-5" />
    if (type === "SERVICE_PROVIDER") return <Building2 className="h-5 w-5" />
    if (type === "DELIVERY") return <Truck className="h-5 w-5" />
    return <Users className="h-5 w-5" />
  }

  const getTypeName = (type: string) => {
    if (type === "VISITOR") return "Visitante"
    if (type === "SERVICE_PROVIDER") return "Prestador"
    if (type === "DELIVERY") return "Entregador"
    return "Outro"
  }

  const copyToClipboard = (id: number, token: string) => {
    const link = `${window.location.origin}/convite/${token}`
    navigator.clipboard.writeText(link)
    setCopiedLink(id)
    toast.success("Link copiado para a área de transferência!")
    setTimeout(() => setCopiedLink(null), 2000)
  }

  const shareWhatsApp = (name: string, token: string, pin?: string) => {
    let text = "";
    if (pin) {
      text = `Olá, ${name}! Seu acesso foi liberado. Seu PIN de entrada na portaria é: *${pin}*`;
    } else {
      const link = `${window.location.origin}/convite/${token}`
      text = `Olá, ${name}! Segue o link para seu acesso: ${link}`
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank")
  }

  const handleRenewLink = async (id: number) => {
    setRenewing(id)
    try {
      const token = localStorage.getItem("condoflow_token")
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/access/${id}/renew-link`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!res.ok) throw new Error("Erro ao revalidar link")
      toast.success("Link revalidado com sucesso!")
      fetchAuthorizations()
    } catch (error) {
      toast.error("Não foi possível revalidar o link.")
    } finally {
      setRenewing(null)
    }
  }

  const formatDate = (isoDate: string) => {
    if (!isoDate) return ""
    const [year, month, day] = isoDate.split("-")
    return `${day}/${month}/${year}`
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Meus Acessos</h1>
          <p className="text-sm text-slate-500 mt-1">Gerencie os convites e autorizações para visitantes e prestadores.</p>
        </div>
        <Button onClick={() => router.push("/morador/acessos/novo")} className="gap-2 shrink-0">
          <PlusCircle className="h-4 w-4" />
          Nova Autorização
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : authorizations.length === 0 ? (
        <Card className="border-dashed shadow-none">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center text-slate-500">
            <Users className="h-12 w-12 mb-4 opacity-20" />
            <p>Você não tem autorizações registradas.</p>
            <Button variant="link" onClick={() => router.push("/morador/acessos/novo")} className="mt-2">
              Criar uma nova autorização
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {authorizations.map((auth) => (
            <Card 
              key={auth.id}
              className={`hover:border-primary/50 transition-colors flex flex-col justify-between ${
                auth.status === "AGUARDANDO_CADASTRO" ? "border-primary/30 shadow-sm bg-primary/5" : ""
              }`}
            >
              <CardContent className="p-4 md:p-6 flex flex-col justify-between gap-4 h-full">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl mt-1 shrink-0 ${
                    ["AGUARDANDO_CADASTRO", "CADASTRO_CONCLUIDO"].includes(auth.status) ? "bg-primary text-white" : "bg-slate-100 text-slate-400"
                  }`}>
                    {getTypeIcon(auth.type)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-col">
                      <h3 className="font-semibold text-slate-900 line-clamp-1">{auth.personName}</h3>
                      <span className="text-xs text-slate-400">{getTypeName(auth.type)}</span>
                    </div>
                    <div className="flex flex-col gap-2 text-xs text-slate-500 pt-1">
                      <div>{getStatusBadge(auth.status)}</div>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(auth.authorizedDate)} das {auth.startTime} às {auth.endTime}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 w-full pt-2 border-t border-slate-100 mt-2">
                  {auth.status === "CADASTRO_CONCLUIDO" && auth.pin && (
                    <div className="flex w-full items-center justify-between bg-slate-50 p-2 rounded-md border border-slate-100">
                      <span className="text-xs text-slate-500 font-medium">PIN de Entrada:</span>
                      <span className="text-sm font-bold tracking-widest text-slate-900">{auth.pin}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 w-full">
                    {auth.status === "AGUARDANDO_CADASTRO" && (
                      <div className="flex w-full gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-2 flex-1"
                          onClick={() => copyToClipboard(auth.id, auth.linkToken)}
                        >
                          {copiedLink === auth.id ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                          Copiar Link
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          className="gap-2 flex-1 bg-[#25D366] hover:bg-[#128C7E] text-white border-none"
                          onClick={() => shareWhatsApp(auth.personName, auth.linkToken)}
                        >
                          WhatsApp
                        </Button>
                      </div>
                    )}

                    {auth.status === "CADASTRO_CONCLUIDO" && auth.pin && (
                      <Button
                        variant="default"
                        size="sm"
                        className="gap-2 w-full bg-[#25D366] hover:bg-[#128C7E] text-white border-none"
                        onClick={() => shareWhatsApp(auth.personName, auth.linkToken, auth.pin)}
                      >
                        Enviar PIN via WhatsApp
                      </Button>
                    )}

                    {["LINK_EXPIRADO", "CREDENCIAL_EXPIRADA"].includes(auth.status) && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full gap-2"
                      disabled={renewing === auth.id}
                      onClick={() => handleRenewLink(auth.id)}
                    >
                      Revalidar Link
                    </Button>
                  )}
                </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
