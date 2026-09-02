"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Building2, AlertCircle, Clock, CheckCircle2, Bell, BellOff, Loader2, Plus } from "lucide-react"
import { toast } from "sonner"

interface CondominioSindico {
  id: number
  name: string
  urgentOccurrences: number
  openOccurrences: number
  resolvedThisMonth: number
  focusModeEnabled: boolean
}

export default function SindicoDashboard() {
  const router = useRouter()
  const [condominios, setCondominios] = useState<CondominioSindico[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isTogglingGlobal, setIsTogglingGlobal] = useState(false)

  // New Condominium State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [newCondo, setNewCondo] = useState({
    name: "", cnpj: "", zipCode: "", street: "", number: "", neighborhood: "", city: "", state: ""
  })

  const fetchAddress = async (zipCode: string) => {
    const cleanZip = zipCode.replace(/\D/g, "");
    if (cleanZip.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cleanZip}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setNewCondo(prev => ({
            ...prev,
            street: data.logradouro,
            neighborhood: data.bairro,
            city: data.localidade,
            state: data.uf
          }))
        } else {
          toast.error("CEP não encontrado.");
        }
      } catch (error) {
        toast.error("Erro ao buscar o CEP.");
      }
    }
  };

  const getToken = () => typeof window !== "undefined" ? localStorage.getItem("condoflow_token") : ""

  const fetchCondominios = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/condominiums/me`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      if (response.ok) {
        const data = await response.json()
        setCondominios(data)
      }
    } catch (error) {
      console.error("Erro ao buscar condomínios do síndico:", error)
      toast.error("Erro ao carregar seus condomínios.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCondominios()
  }, [])

  const modoFocoGlobal = condominios.length > 0 && condominios.every((c) => c.focusModeEnabled)

  const handleToggleGlobal = async (checked: boolean) => {
    setIsTogglingGlobal(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/condominiums/focus-mode`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({ enabled: checked })
      })
      if (response.ok) {
        setCondominios((prev) => prev.map((c) => ({ ...c, focusModeEnabled: checked })))
        toast.success(checked ? "Modo foco ativado para todos os condomínios." : "Modo foco desativado.")
      } else {
        toast.error("Não foi possível alterar o modo foco.")
      }
    } catch (error) {
      console.error("Erro ao atualizar modo foco global:", error)
      toast.error("Erro de conexão com o servidor.")
    } finally {
      setIsTogglingGlobal(false)
    }
  }

  const handleAddCondominium = async () => {
    if (!newCondo.name || !newCondo.cnpj || !newCondo.street || !newCondo.city || !newCondo.state) {
      toast.error("Preencha os campos obrigatórios.")
      return
    }

    setIsAdding(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/condominiums/me`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify(newCondo)
      })

      if (response.ok) {
        toast.success("Condomínio criado com sucesso! Lembre-se de escolher um plano.")
        setIsAddModalOpen(false)
        setNewCondo({ name: "", cnpj: "", zipCode: "", street: "", number: "", neighborhood: "", city: "", state: "" })
        fetchCondominios()
      } else {
        const err = await response.json().catch(() => null)
        toast.error(err?.message || "Não foi possível criar o condomínio.")
      }
    } catch (error) {
      console.error("Erro ao criar condomínio:", error)
      toast.error("Erro de conexão com o servidor.")
    } finally {
      setIsAdding(false)
    }
  }

  const urgentesCondominios = condominios.filter((c) => c.urgentOccurrences > 0)

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
      {/* Header com Modo Foco Global e Adicionar Condomínio */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meus Condomínios</h1>
          <p className="text-muted-foreground">
            {isLoading
              ? "Carregando..."
              : `Bem-vindo de volta. Você tem ${condominios.length} unidades sob sua gestão.`}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-4 bg-white p-4 rounded-lg border shadow-sm">
            <div className="flex flex-col items-end">
              <Label htmlFor="modo-foco" className="font-bold flex items-center gap-2">
                {modoFocoGlobal ? <BellOff className="h-4 w-4 text-orange-500" /> : <Bell className="h-4 w-4 text-blue-500" />}
                Modo Foco Global
              </Label>
              <span className="text-xs text-muted-foreground text-right">
                {modoFocoGlobal ? "Apenas emergências" : "Todas as notificações"}
              </span>
            </div>
            {isTogglingGlobal ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              <Switch
                id="modo-foco"
                checked={modoFocoGlobal}
                onCheckedChange={handleToggleGlobal}
                disabled={condominios.length === 0}
              />
            )}
          </div>

          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 px-6">
                <Plus className="h-5 w-5" /> Adicionar Condomínio
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Novo Condomínio</DialogTitle>
                <DialogDescription>
                  Preencha as informações para registrar e começar a gerenciar um novo condomínio.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome do Condomínio</Label>
                    <Input id="name" value={newCondo.name} onChange={(e) => setNewCondo({ ...newCondo, name: e.target.value })} placeholder="Condomínio Flores" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cnpj">CNPJ</Label>
                    <Input id="cnpj" value={newCondo.cnpj} onChange={(e) => setNewCondo({ ...newCondo, cnpj: e.target.value })} placeholder="00.000.000/0000-00" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">CEP</Label>
                    <Input id="zipCode" value={newCondo.zipCode} onChange={(e) => {
                        setNewCondo({ ...newCondo, zipCode: e.target.value });
                        const cleanZip = e.target.value.replace(/\D/g, "");
                        if(cleanZip.length === 8) fetchAddress(cleanZip);
                    }} placeholder="00000-000" />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="street">Rua/Avenida</Label>
                    <Input id="street" value={newCondo.street} onChange={(e) => setNewCondo({ ...newCondo, street: e.target.value })} placeholder="Av. Principal" />
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="number">Número</Label>
                    <Input id="number" value={newCondo.number} onChange={(e) => setNewCondo({ ...newCondo, number: e.target.value })} placeholder="123" />
                  </div>
                  <div className="space-y-2 col-span-3">
                    <Label htmlFor="neighborhood">Bairro</Label>
                    <Input id="neighborhood" value={newCondo.neighborhood} onChange={(e) => setNewCondo({ ...newCondo, neighborhood: e.target.value })} placeholder="Centro" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="city">Cidade</Label>
                    <Input id="city" value={newCondo.city} onChange={(e) => setNewCondo({ ...newCondo, city: e.target.value })} placeholder="São Paulo" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">UF</Label>
                    <Input id="state" value={newCondo.state} onChange={(e) => setNewCondo({ ...newCondo, state: e.target.value })} placeholder="SP" maxLength={2} />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancelar</Button>
                <Button onClick={handleAddCondominium} disabled={isAdding} className="bg-emerald-600 hover:bg-emerald-700">
                  {isAdding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Cadastrar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="todos" className="w-full">
        <TabsList className="grid w-full max-w-[400px] grid-cols-2">
          <TabsTrigger value="todos">Todos os Prédios</TabsTrigger>
          <TabsTrigger value="urgentes">Urgências Críticas</TabsTrigger>
        </TabsList>

        <TabsContent value="todos" className="mt-6">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Carregando condomínios...</p>
          ) : condominios.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
               <Building2 className="h-12 w-12 mx-auto text-slate-300 mb-4" />
               <h3 className="text-lg font-medium text-slate-900 mb-2">Nenhum condomínio cadastrado</h3>
               <p className="text-slate-500 mb-6">Você ainda não administra nenhum condomínio. Adicione o seu primeiro condomínio agora mesmo.</p>
               <Button onClick={() => setIsAddModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="mr-2 h-4 w-4" /> Cadastrar Meu Condomínio
               </Button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {condominios.map((predio) => (
                <Card 
                  key={predio.id} 
                  className="hover:shadow-md transition-shadow cursor-pointer border-t-4 border-t-emerald-600"
                  onClick={() => router.push(`/sindico/condominio/${predio.id}`)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                      {predio.urgentOccurrences > 0 && (
                        <Badge variant="destructive" className="animate-pulse">
                          {predio.urgentOccurrences} Urgências
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl mt-2">{predio.name}</CardTitle>
                  </CardHeader>

                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="flex flex-col items-center p-3 bg-slate-100 rounded-md text-center">
                        <Clock className="h-4 w-4 mb-1 text-blue-600" />
                        <span className="text-xl font-bold">{predio.openOccurrences}</span>
                        <span className="text-[10px] uppercase text-muted-foreground font-semibold">Abertas</span>
                      </div>
                      <div className="flex flex-col items-center p-3 bg-slate-100 rounded-md text-center">
                        <CheckCircle2 className="h-4 w-4 mb-1 text-green-600" />
                        <span className="text-xl font-bold">{predio.resolvedThisMonth}</span>
                        <span className="text-[10px] uppercase text-muted-foreground font-semibold">Mês Atual</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="urgentes" className="mt-6">
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <AlertCircle className="h-5 w-5" />
                Atenção Prioritária
              </CardTitle>
              <CardDescription className="text-red-600">
                Estas ocorrências exigem sua atenção imediata em todos os condomínios.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {urgentesCondominios.length === 0 ? (
                <p className="text-sm text-red-800">Nenhuma urgência no momento. 🎉</p>
              ) : (
                urgentesCondominios.map((c) => (
                  <div 
                    key={c.id} 
                    className="flex items-center justify-between bg-white border border-red-200 rounded-md p-3 cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => router.push(`/sindico/condominio/${c.id}`)}
                  >
                    <span className="font-medium text-slate-900">{c.name}</span>
                    <Badge variant="destructive">{c.urgentOccurrences} urgências</Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}