"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ClipboardList, User, LayoutDashboard } from "lucide-react"

export default function MoradorDashPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard do Morador</h1>
        <p className="text-muted-foreground">Acesse rapidamente suas áreas principais.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              Minhas Ocorrências
            </CardTitle>
            <CardDescription>Acompanhe status e respostas dos seus relatos.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/morador/minhas-ocorrencias">Abrir ocorrências</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Meu Perfil
            </CardTitle>
            <CardDescription>Gerencie seus dados e preferências.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/morador/perfil">Abrir perfil</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-lg border bg-primary/5 p-4 text-sm text-primary flex items-center gap-2">
        <LayoutDashboard className="h-4 w-4" />
        Você está na área privada do morador.
      </div>
    </div>
  )
}
