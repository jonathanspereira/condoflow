"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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
    </div>
  )
}
