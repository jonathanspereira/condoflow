"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  User,
  Key,
  Save,
  Loader2
} from "lucide-react"
import { toast } from "sonner"

interface UserProfile {
  name: string
  email: string
  role: string
}

export default function AdminPerfilPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSavingEmail, setIsSavingEmail] = useState(false)
  const [isSavingPassword, setIsSavingPassword] = useState(false)

  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")

  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    email: "",
    role: "",
  })

  const [novoEmail, setNovoEmail] = useState("")

  const getToken = () => typeof window !== "undefined" ? localStorage.getItem("condoflow_token") : ""

  useEffect(() => {
    async function fetchProfileData() {
      setIsLoading(true)
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
          headers: {
            Authorization: `Bearer ${getToken()}`
          }
        })
        if (response.ok) {
          const data = await response.json()
          setProfile(data)
          setNovoEmail(data.email || "")
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me/password`, {
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
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Perfil Super Admin</h1>
        <p className="text-muted-foreground text-lg">Gerencie as informações da conta master e a segurança de acesso.</p>
      </header>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : (
        <Tabs defaultValue="dados" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="dados" className="gap-2"><User className="h-4 w-4" /> Informações</TabsTrigger>
            <TabsTrigger value="seguranca" className="gap-2"><Key className="h-4 w-4" /> Segurança</TabsTrigger>
          </TabsList>

          <TabsContent value="dados">
            <Card>
              <CardHeader>
                <CardTitle>Informações de Acesso</CardTitle>
                <CardDescription>Edite o endereço de e-mail utilizado para efetuar login no sistema.</CardDescription>
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
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-slate-50 border-t flex justify-end">
                <Button 
                  onClick={handleUpdateEmail} 
                  disabled={isSavingEmail || novoEmail === profile.email}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {isSavingEmail ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</>
                  ) : (
                    <><Save className="mr-2 h-4 w-4" /> Salvar Alterações</>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="seguranca">
            <Card>
              <CardHeader>
                <CardTitle>Alterar Senha</CardTitle>
                <CardDescription>Crie uma senha forte com letras, números e símbolos para manter a sua conta segura.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2 max-w-sm">
                  <Label htmlFor="oldPassword">Senha Atual</Label>
                  <Input 
                    id="oldPassword" 
                    type="password" 
                    value={oldPassword} 
                    onChange={(e) => setOldPassword(e.target.value)} 
                    placeholder="Digite a sua senha atual" 
                  />
                </div>
                <div className="grid gap-2 max-w-sm pt-2">
                  <Label htmlFor="newPassword">Nova Senha</Label>
                  <Input 
                    id="newPassword" 
                    type="password" 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)} 
                    placeholder="Mínimo de 6 caracteres" 
                  />
                </div>
              </CardContent>
              <CardFooter className="bg-slate-50 border-t flex justify-start">
                <Button 
                  onClick={handleUpdatePassword} 
                  disabled={isSavingPassword || !oldPassword || !newPassword}
                  className="bg-slate-900 hover:bg-slate-800"
                >
                  {isSavingPassword ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Atualizando...</>
                  ) : (
                    <><Key className="mr-2 h-4 w-4" /> Atualizar Senha</>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
