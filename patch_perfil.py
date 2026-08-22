import re

with open("frontend/app/sindico/(private)/perfil/page.tsx", "r") as f:
    content = f.read()

# Replace PerfilForm type and INITIAL_PROFILE
perfil_types = """
type PerfilForm = {
  nome: string
  email: string
}

const INITIAL_PROFILE: PerfilForm = {
  nome: "",
  email: "",
}
"""
content = re.sub(r'type PerfilForm = \{.*?\n\}[\s\n]*const INITIAL_PROFILE: PerfilForm = \{.*?\n\}', perfil_types.strip(), content, flags=re.DOTALL)


# Add useEffect for fetching data
use_effect = """
  const [isLoading, setIsLoading] = useState(true)

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
"""
content = content.replace('const getToken = () => typeof window !== "undefined" ? localStorage.getItem("condoflow_token") : ""', 'const getToken = () => typeof window !== "undefined" ? localStorage.getItem("condoflow_token") : ""\n' + use_effect)


# Replace handleSave
handle_save_new = """
  const [isSavingEmail, setIsSavingEmail] = useState(false)

  const handleSave = async () => {
    setIsSavingEmail(true)

    try {
      const response = await fetch("http://localhost:8080/api/v1/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({ 
          name: formData.nome,
          email: formData.email,
          role: "SINDICO" 
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
"""
content = re.sub(r'const handleSave = \(\) => \{.*?\n  \}', handle_save_new.strip(), content, flags=re.DOTALL)


# Remove telefone input
content = re.sub(r'<div className="space-y-2">\s*<Label htmlFor="telefone">Telefone</Label>.*?</div>', '', content, flags=re.DOTALL)

# Add import useEffect if not present
if "useEffect" not in content[:100]:
    content = content.replace('import { useState } from "react"', 'import { useState, useEffect } from "react"')

# Add loading spinner on the button
content = content.replace('<Button onClick={handleSave}>Salvar alterações</Button>', '<Button onClick={handleSave} disabled={isSavingEmail}>{isSavingEmail ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Salvar alterações</Button>')

# Add loading state to CardContent
content = content.replace('<CardContent className="space-y-5">', '<CardContent className="space-y-5">\n          {isLoading ? (\n            <div className="flex justify-center py-6">\n              <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />\n            </div>\n          ) : (<>')
content = content.replace('</CardContent>', '          </>)}\n        </CardContent>')

with open("frontend/app/sindico/(private)/perfil/page.tsx", "w") as f:
    f.write(content)
