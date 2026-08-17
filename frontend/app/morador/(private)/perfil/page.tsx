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
import { toast } from "sonner"

interface UserProfile {
  name: string
  email: string
  condominiumName?: string
  unitId?: number
  unitName?: string
  role: string
  isRented?: boolean
  tenantName?: string
  tenantEmail?: string
}

export default function PerfilPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSavingEmail, setIsSavingEmail] = useState(false)
  const [isSavingTenant, setIsSavingTenant] = useState(false)
  const [isSavingPassword, setIsSavingPassword] = useState(false)

  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")

  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    email: "",
    condominiumName: "",
    role: "",
    isRented: false,
    tenantName: "",
    tenantEmail: ""
  })

  const [novoEmail, setNovoEmail] = useState("")
  const [nomeInq, setNomeInq] = useState("")
  const [emailInq, setEmailInq] = useState("")

  const getToken = () => typeof window !== "undefined" ? localStorage.getItem("condoflow_token") : ""

  const traduzirRole = (role?: string) => {
    if (!role) return "Usuário"
    const roles: Record<string, string> = {
      "PROPRIETARY": "Proprietário",
      "TENANT": "Inquilino",
      "ADMIN": "Administrador",
      "SUPER_ADMIN": "Super Admin"
    }
    return roles[role] || role
  }

  useEffect(() => {
    async function fetchProfileData() {
      setIsLoading(true)
      try {
        const response = await fetch("http://localhost:8080/api/v1/users/me", {
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
        } else {
          toast.error("Não foi possível carregar os dados do perfil.")
        }
      } catch (error) {
        console.error("Erro ao carregar perfil:", error)
        toast.error("Erro de conexão com o servidor.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfileData()
  }, [])

  const handleUpdateEmail = async () => {
    setIsSavingEmail(true)

    try {
      const response = await fetch("http://localhost:8080/api/v1/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({ 
          name: profile.name,
          email: novoEmail,
          role: profile.role 
        })
      })

      if (response.ok) {
        setProfile(prev => ({ ...prev, email: novoEmail }))
        toast.success("E-mail atualizado com sucesso!")
      } else {
        const errData = await response.json().catch(() => null)
        toast.error(errData?.message || "Não foi possível atualizar o e-mail.")
      }
    } catch (error) {
      console.error("Erro ao atualizar e-mail:", error)
      toast.error("Erro de conexão com o servidor.")
    } finally {
      setIsSavingEmail(false)
    }
  }

  const handleUpdateTenant = async () => {
    if (!profile.unitId) {
      toast.error("O seu perfil não possui uma unidade (Apto) atrelada para registrar inquilinos.")
      return
    }

    if (profile.isRented && (!nomeInq || !emailInq)) {
      toast.error("Preencha o nome e o e-mail do inquilino antes de prosseguir.")
      return
    }

    setIsSavingTenant(true)

    try {
      const payload = {
        name: nomeInq || "Inquilino",
        email: emailInq,
        password: "TempPassword123@", 
        role: "TENANT",
        isRented: profile.isRented,
        unitId: profile.unitId // Envia o ID para o Backend saber quem atualizar!
      }

      const response = await fetch("http://localhost:8080/api/v1/users/tenant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        toast.success(profile.isRented 
          ? `Inquilino ${nomeInq} registrado com sucesso!`
          : "Inquilino removido e unidade marcada como residência própria.")
      } else {
        const errData = await response.json().catch(() => null)
        toast.error(errData?.message || "Não foi possível registrar o inquilino. Este e-mail pode já estar em uso.")
      }
    } catch (error) {
      console.error("Erro ao registrar inquilino:", error)
      toast.error("Erro de conexão com o servidor. Tente novamente mais tarde.")
    } finally {
      setIsSavingTenant(false)
    }
  }

  const handleUpdatePassword = async () => {
    if (!oldPassword || !newPassword) {
      toast.error("Preencha a senha atual e a nova senha.")
      return
    }

    if (newPassword.length < 6) {
      toast.error("A nova senha deve ter pelo menos 6 caracteres.")
      return
    }

    setIsSavingPassword(true)

    try {
      const response = await fetch("http://localhost:8080/api/v1/users/me/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({ oldPassword, newPassword })
      })

      if (response.ok) {
        toast.success("Senha alterada com sucesso!")
        setOldPassword("")
        setNewPassword("")
      } else {
        const errData = await response.json().catch(() => null)
        toast.error(errData?.message || "Não foi possível alterar a senha. Verifique a senha atual.")
      }
    } catch (error) {
      console.error("Erro ao alterar senha:", error)
      toast.error("Erro de conexão com o servidor.")
    } finally {
      setIsSavingPassword(false)
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Meu Perfil</h1>
        <p className="text-muted-foreground text-lg">Gerencie as suas informações e os acessos à sua unidade.</p>
      </header>



      <Tabs defaultValue="unidade" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 max-w-2xl">
          <TabsTrigger value="dados" className="gap-2"><User className="h-4 w-4" /> Pessoal</TabsTrigger>
          <TabsTrigger value="unidade" className="gap-2"><Building className="h-4 w-4" /> Unidade</TabsTrigger>
          <TabsTrigger value="notificacoes" className="gap-2"><Bell className="h-4 w-4" /> Avisos</TabsTrigger>
          <TabsTrigger value="seguranca" className="gap-2"><Key className="h-4 w-4" /> Segurança</TabsTrigger>
        </TabsList>

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

        <TabsContent value="unidade">
          <Card className="border-blue-100 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Gestão da Unidade</CardTitle>
                <CardDescription>Controle quem reside no seu imóvel atualmente.</CardDescription>
              </div>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1 font-semibold uppercase tracking-wider text-[11px]">
                {traduzirRole(profile.role)}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-lg bg-slate-100/50 border border-slate-200">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Condomínio</span>
                  <span className="text-sm font-semibold mt-0.5">{profile.condominiumName || "Não vinculado"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Unidade</span>
                  <span className="text-sm font-semibold mt-0.5">{profile.unitName || "N/A"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Status de Ocupação</span>
                  <Badge className={profile.isRented ? "bg-amber-100 text-amber-700 hover:bg-amber-100 w-fit mt-1" : "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 w-fit mt-1"} variant="secondary">
                    {profile.isRented ? "Alugado a Terceiros" : "Residência Própria"}
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
                  onClick={() => {
                    setProfile(prev => ({ ...prev, isRented: !prev.isRented }))
                    if (profile.isRented) {
                      setNomeInq("")
                      setEmailInq("")
                    }
                  }}
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
                        className="bg-white"
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
                        className="bg-white"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                    <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    <div className="text-xs text-blue-800 space-y-1">
                      <p className="font-bold">Como funciona o acesso do inquilino?</p>
                      <p>1. O inquilino receberá um e-mail para ativar a conta com perfil de <strong>Inquilino</strong>.</p>
                      <p>2. Ele poderá abrir ocorrências e consultar o histórico enquanto o contrato estiver ativo.</p>
                      <p>3. <strong>Você continuará a receber cópias de todas as notificações do sistema.</strong></p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-10 text-center border-2 border-dashed rounded-xl bg-slate-50/50">
                  <p className="text-slate-500 text-sm font-medium">Você está registrado como morador e responsável atual desta unidade.</p>
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

        <TabsContent value="seguranca">
          <Card>
            <CardHeader>
              <CardTitle>Alterar Senha</CardTitle>
              <CardDescription>Crie uma nova senha forte e evite compartilhá-la com terceiros.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="oldPassword">Senha Atual</Label>
                  <Input 
                    id="oldPassword" 
                    type="password" 
                    value={oldPassword} 
                    onChange={(e) => setOldPassword(e.target.value)} 
                    disabled={isSavingPassword}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nova Senha</Label>
                  <Input 
                    id="newPassword" 
                    type="password" 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)} 
                    disabled={isSavingPassword}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-slate-50/50 border-t p-4">
              <Button onClick={handleUpdatePassword} disabled={isSavingPassword || !oldPassword || !newPassword} className="gap-2 ml-auto">
                {isSavingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <Key className="h-4 w-4" />}
                Salvar Nova Senha
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}