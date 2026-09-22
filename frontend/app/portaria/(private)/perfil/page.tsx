"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Key, User, Shield } from "lucide-react"
import { toast } from "sonner"

type PerfilForm = {
  nome: string
  email: string
}

const INITIAL_PROFILE: PerfilForm = {
  nome: "",
  email: "",
}

export default function PerfilPortariaPage() {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<PerfilForm>(INITIAL_PROFILE)
  const [savedData, setSavedData] = useState<PerfilForm>(INITIAL_PROFILE)

  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [isSavingPassword, setIsSavingPassword] = useState(false)

  const getToken = () => typeof window !== "undefined" ? localStorage.getItem("condoflow_token") : ""

  const [isLoading, setIsLoading] = useState(true)

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
          const profile = { nome: data.name, email: data.email }
          setFormData(profile)
          setSavedData(profile)
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


  const handleChange = (field: keyof PerfilForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleEdit = () => {
    setFormData(savedData)
    setIsEditing(true)
  }

  const handleCancel = () => {
    setFormData(savedData)
    setIsEditing(false)
  }

  const [isSavingEmail, setIsSavingEmail] = useState(false)

  const handleSave = async () => {
    setIsSavingEmail(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({ 
          name: formData.nome,
          email: formData.email,
          role: "CONCIERGE" 
        })
      })

      if (response.ok) {
        setSavedData(formData)
        setIsEditing(false)
        toast.success("Perfil atualizado com sucesso!")
      } else {
        const errData = await response.json().catch(() => null)
        toast.error(errData?.message || "Não foi possível atualizar o perfil.")
      }
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error)
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
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-slate-900">Configurações da Conta</h1>

      <Tabs defaultValue="perfil" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8 bg-slate-100 p-1 rounded-lg">
          <TabsTrigger value="perfil" className="data-[state=active]:bg-white rounded-md flex items-center gap-2">
            <User className="h-4 w-4" /> <span className="hidden sm:inline">Perfil</span>
          </TabsTrigger>
          <TabsTrigger value="seguranca" className="data-[state=active]:bg-white rounded-md flex items-center gap-2">
            <Shield className="h-4 w-4" /> <span className="hidden sm:inline">Segurança</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="perfil" className="animate-in fade-in slide-in-from-bottom-2">
          <Card>
            <CardHeader>
              <CardTitle>Perfil da Portaria</CardTitle>
              <CardDescription>Visualize e atualize os seus dados.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {isLoading ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      disabled={!isEditing}
                      onChange={(event) => handleChange("nome", event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      disabled={!isEditing}
                      onChange={(event) => handleChange("email", event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="perfil">Perfil</Label>
                    <Input id="perfil" value="Portaria" disabled />
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {isEditing ? (
                      <>
                        <Button onClick={handleSave} disabled={isSavingEmail} className="bg-emerald-600 hover:bg-emerald-700">
                          {isSavingEmail ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Salvar alterações
                        </Button>
                        <Button variant="outline" onClick={handleCancel}>Cancelar</Button>
                      </>
                    ) : (
                      <Button onClick={handleEdit}>Editar perfil</Button>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seguranca" className="animate-in fade-in slide-in-from-bottom-2">
          <Card>
            <CardHeader>
              <CardTitle>Segurança</CardTitle>
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
              <div className="flex pt-4">
                <Button onClick={handleUpdatePassword} disabled={isSavingPassword || !oldPassword || !newPassword} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                  {isSavingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <Key className="h-4 w-4" />}
                  Salvar Nova Senha
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
