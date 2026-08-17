"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Key } from "lucide-react"
import { toast } from "sonner"

type PerfilForm = {
  nome: string
  email: string
  telefone: string
}

const INITIAL_PROFILE: PerfilForm = {
  nome: "Jonathan Silva",
  email: "sindico@condoflow.com",
  telefone: "(11) 99999-0000",
}

export default function PerfilSindicoPage() {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<PerfilForm>(INITIAL_PROFILE)
  const [savedData, setSavedData] = useState<PerfilForm>(INITIAL_PROFILE)

  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [isSavingPassword, setIsSavingPassword] = useState(false)

  const getToken = () => typeof window !== "undefined" ? localStorage.getItem("condoflow_token") : ""

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

  const handleSave = () => {
    setSavedData(formData)
    setIsEditing(false)
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
    <div className="p-4 md:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Perfil do Síndico</CardTitle>
          <CardDescription>Visualize e atualize os dados da sua conta administrativa.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
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
            <Label htmlFor="telefone">Telefone</Label>
            <Input
              id="telefone"
              value={formData.telefone}
              disabled={!isEditing}
              onChange={(event) => handleChange("telefone", event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="perfil">Perfil</Label>
            <Input id="perfil" value="Síndico" disabled />
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {isEditing ? (
              <>
                <Button onClick={handleSave}>Salvar alterações</Button>
                <Button variant="outline" onClick={handleCancel}>Cancelar</Button>
              </>
            ) : (
              <Button onClick={handleEdit}>Editar perfil</Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-8">
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
            <Button onClick={handleUpdatePassword} disabled={isSavingPassword || !oldPassword || !newPassword} className="gap-2">
              {isSavingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <Key className="h-4 w-4" />}
              Salvar Nova Senha
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
