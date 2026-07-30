"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { 
  User, 
  Building, 
  Bell, 
  Save, 
  Key, 
  Info, 
  UserPlus, 
  UserMinus,
  Loader2
} from "lucide-react"

interface UserProfile {
  name: string
  email: string
  condominiumName: string
  tower: string
  unit: string
  isRented: boolean
  tenantName?: string
  tenantEmail?: string
}

export default function PerfilPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSavingEmail, setIsSavingEmail] = useState(false)
  const [isSavingTenant, setIsSavingTenant] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [successMsg, setSuccessMsg] = useState("")

  // Dados do Perfil e Unidade
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    email: "",
    condominiumName: "",
    tower: "",
    unit: "",
    isRented: false,
    tenantName: "",
    tenantEmail: ""
  })

  const [novoEmail, setNovoEmail] = useState("")
  const [nomeInq, setNomeInq] = useState("")
  const [emailInq, setEmailInq] = useState("")

  const getToken = () => typeof window !== "undefined" ? localStorage.getItem("condoflow_token") : ""

  // Buscar dados reais do backend ao carregar a página
  useEffect(() => {
    async function fetchProfileData() {
      setIsLoading(true)
      try {
        const response = await fetch("http://localhost:8080/api/v1/profile", {
          headers: {
            Authorization: `Bearer ${getToken()}`
          }
        })
        if (response.ok) {
          const data = await response.json()
          setProfile(data)
          setNovoEmail(data.email || "")
          setNomeInq(data.tenantName || "")
          setEmailInq(data.tenantEmail || "")
        }
      } catch (error) {
        console.error("Erro ao carregar perfil:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfileData()
  }, [])

  // Atualizar E-mail no Backend
  const handleUpdateEmail = async () => {
    setIsSavingEmail(true)
    setErrorMsg("")
    setSuccessMsg("")

    try {
      const response = await fetch("http://localhost:8080/api/v1/profile/email", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({ email: novoEmail })
      })

      if (response.ok) {
        setProfile(prev => ({ ...prev, email: novoEmail }))
        setSuccessMsg("E-mail atualizado com sucesso!")
      } else {
        setErrorMsg("Não foi possível atualizar o e-mail.")
      }
    } catch (error) {
      console.error("Erro ao atualizar e-mail:", error)
      setErrorMsg("Erro de conexão com o servidor.")
    } finally {
      setIsSavingEmail(false)
    }
  }

  // Registrar/Atualizar Inquilino com a role de RESIDENT no Backend
  const handleUpdateTenant = async () => {
    setIsSavingTenant(true)
    setErrorMsg("")
    setSuccessMsg("")

    try {
      const payload = {
        isRented: profile.isRented,
        tenantName: nomeInq,
        tenantEmail: emailInq,
        role: "RESIDENT" // Atribuindo explicitamente a role de morador/inquilino
      }

      const response = await fetch("http://localhost:8080/api/v1/profile/unit", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        setSuccessMsg("Inquilino registrado com a role de residente (RESIDENT) com sucesso!")
      } else {
        setErrorMsg("Não foi possível registrar o inquilino.")
      }
    } catch (error) {
      console.error("Erro ao registrar inquilino:", error)
      setErrorMsg("Erro de conexão com o servidor.")
    } finally {
      setIsSavingTenant(false)
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Meu Perfil</h1>
        <p className="text-muted-foreground text-lg">Gerencie as suas informações e os acessos à sua unidade.</p>
      </header>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm p-3 rounded-md font-medium">
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-md font-medium">
          {errorMsg}
        </div>
      )}

      <Tabs defaultValue="unidade" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="dados" className="gap-2"><User className="h-4 w-4" /> Pessoal</TabsTrigger>
          <TabsTrigger value="unidade" className="gap-2"><Building className="h-4 w-4" /> Unidade</TabsTrigger>
          <TabsTrigger value="notificacoes" className="gap-2"><Bell className="h-4 w-4" /> Avisos</TabsTrigger>
        </TabsList>

        {/* --- ABA DADOS PESSOAIS --- */}
        <TabsContent value="dados">
          <Card>
            <CardHeader>
              <CardTitle>Informações de Contacto</CardTitle>
              <CardDescription>Estes dados são visíveis apenas para a administração e o síndico.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo</Label>
                  <Input id="nome" value={profile.name} disabled className="bg-slate-100 cursor-not-allowed" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail Principal</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={novoEmail} 
                    onChange={(e) => setNovoEmail(e.target.value)} 
                    disabled={isLoading}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-slate-50/50 border-t p-4">
              <Button onClick={handleUpdateEmail} disabled={isSavingEmail} className="gap-2 ml-auto">
                {isSavingEmail && <Loader2 className="h-4 w-4 animate-spin" />}
                <Save className="h-4 w-4" /> Guardar Dados
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* --- ABA GESTÃO DE UNIDADE --- */}
        <TabsContent value="unidade">
          <Card className="border-blue-100 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Gestão da Unidade</CardTitle>
                <CardDescription>Controle quem reside no seu imóvel atualmente.</CardDescription>
              </div>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1">
                Proprietário
              </Badge>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg bg-slate-100/50 border border-slate-200">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Condomínio</span>
                  <span className="text-sm font-semibold">{profile.condominiumName || "Carregando..."}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Bloco</span>
                  <span className="text-sm font-semibold">{profile.tower || "Carregando..."}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Fração / Apto</span>
                  <span className="text-sm font-semibold">{profile.unit || "Carregando..."}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Status</span>
                  <Badge className={profile.isRented ? "bg-amber-100 text-amber-700 hover:bg-amber-100" : "bg-green-100 text-green-700 hover:bg-green-100"} variant="secondary">
                    {profile.isRented ? "Alugado" : "Residência Própria"}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between pb-2 border-b">
                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                  <Key className="h-4 w-4 text-blue-600" /> Ocupação do Imóvel
                </h4>
                <Button 
                  variant={profile.isRented ? "destructive" : "outline"} 
                  size="sm" 
                  className="gap-2"
                  onClick={() => setProfile(prev => ({ ...prev, isRented: !prev.isRented }))}
                >
                  {profile.isRented ? <UserMinus className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                  {profile.isRented ? "Remover Inquilino" : "Registrar Inquilino"}
                </Button>
              </div>

              {profile.isRented ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nomeInq">Nome do Inquilino</Label>
                      <Input 
                        id="nomeInq" 
                        placeholder="Nome completo do morador" 
                        value={nomeInq}
                        onChange={(e) => setNomeInq(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emailInq">E-mail do Inquilino</Label>
                      <Input 
                        id="emailInq" 
                        type="email" 
                        placeholder="inquilino@email.com" 
                        value={emailInq}
                        onChange={(e) => setEmailInq(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                    <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    <div className="text-xs text-blue-800 space-y-1">
                      <p className="font-bold">Como funciona o acesso do inquilino?</p>
                      <p>1. O inquilino receberá um e-mail para ativar a conta com perfil de <strong>Residente (RESIDENT)</strong>.</p>
                      <p>2. Ele poderá abrir ocorrências e consultar o histórico enquanto o contrato estiver ativo.</p>
                      <p>3. <strong>Você continuará a receber cópias de todas as notificações.</strong></p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-10 text-center border-2 border-dashed rounded-xl">
                  <p className="text-slate-500 text-sm italic">Atualmente, você está registrado como residente desta unidade.</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t bg-slate-50/30 p-4">
              <Button onClick={handleUpdateTenant} disabled={isSavingTenant} className="w-full md:w-auto ml-auto gap-2">
                {isSavingTenant && <Loader2 className="h-4 w-4 animate-spin" />}
                Confirmar Alteração de Ocupante
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* --- ABA NOTIFICAÇÕES --- */}
        <TabsContent value="notificacoes">
          <Card>
            <CardHeader>
              <CardTitle>Preferências de Notificação</CardTitle>
              <CardDescription>Escolha como deseja ser alertado sobre novidades.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">E-mails de Ocorrências</Label>
                  <p className="text-sm text-muted-foreground">Receba atualizações de status e respostas do síndico.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Alertas de Unidade (Cópia)</Label>
                  <p className="text-sm text-muted-foreground">Receba cópia do que o seu inquilino relatar.</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}