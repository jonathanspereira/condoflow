"use client"

import React, { useState } from "react"
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
  Mail
} from "lucide-react"

export default function PerfilPage() {
  const [estaAlugado, setEstaAlugado] = useState(false)

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Meu Perfil</h1>
        <p className="text-muted-foreground text-lg">Gerencie as suas informações e os acessos à sua unidade.</p>
      </header>

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
                  <Input id="nome" defaultValue="Jonathan Silva" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail Principal</Label>
                  <Input id="email" type="email" defaultValue="jonathan@exemplo.com" disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">Telemóvel / WhatsApp</Label>
                  <Input id="whatsapp" placeholder="+351 000 000 000" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-slate-50/50 border-t p-4">
              <Button className="gap-2 ml-auto">
                <Save className="h-4 w-4" /> Guardar Dados
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* --- ABA GESTÃO DE UNIDADE (LÓGICA PROPRIETÁRIO/INQUILINO) --- */}
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
              {/* Info Fixa da Unidade */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg bg-slate-100/50 border border-slate-200">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Condomínio</span>
                  <span className="text-sm font-semibold">Solar das Palmeiras</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Bloco</span>
                  <span className="text-sm font-semibold">Torre B</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Fração / Apto</span>
                  <span className="text-sm font-semibold">402</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Status</span>
                  <Badge className={estaAlugado ? "bg-amber-100 text-amber-700 hover:bg-amber-100" : "bg-green-100 text-green-700 hover:bg-green-100"} variant="secondary">
                    {estaAlugado ? "Alugado" : "Residência Própria"}
                  </Badge>
                </div>
              </div>

              {/* Botão de Acção */}
              <div className="flex items-center justify-between pb-2 border-b">
                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                  <Key className="h-4 w-4 text-blue-600" /> Ocupação do Imóvel
                </h4>
                <Button 
                  variant={estaAlugado ? "destructive" : "outline"} 
                  size="sm" 
                  className="gap-2"
                  onClick={() => setEstaAlugado(!estaAlugado)}
                >
                  {estaAlugado ? <UserMinus className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                  {estaAlugado ? "Remover Inquilino" : "Registrar Inquilino"}
                </Button>
              </div>

              {estaAlugado ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nomeInq">Nome do Inquilino</Label>
                      <Input id="nomeInq" placeholder="Nome completo do morador" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emailInq">E-mail do Inquilino</Label>
                      <Input id="emailInq" type="email" placeholder="inquilino@email.com" />
                    </div>
                  </div>
                  <div className="flex gap-3 bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                    <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    <div className="text-xs text-blue-800 space-y-1">
                      <p className="font-bold">Como funciona o acesso do inquilino?</p>
                      <p>1. O inquilino receberá um e-mail para ativar a conta.</p>
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
              <Button disabled={!estaAlugado} className="w-full md:w-auto ml-auto">Confirmar Alteração de Ocupante</Button>
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