import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, User, UserCog } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="container relative min-h-screen flex items-center justify-center px-4">
      <Link
        href="/"
        className="absolute left-4 top-4 md:left-8 md:top-8 flex items-center text-sm font-medium text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar
      </Link>

      <div className="grid w-full max-w-4xl gap-6 md:grid-cols-2">
        <Card className="border-2 hover:border-slate-300 transition-all">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <User className="h-6 w-6 text-slate-600" />
            </div>
            <CardTitle className="text-2xl">Login do Morador</CardTitle>
            <CardDescription>
              Acompanhe suas ocorrências, protocolos e atualizações em tempo real.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-slate-500">
            <ul className="list-disc list-inside space-y-2">
              <li>Visualização do histórico pessoal</li>
              <li>Acompanhamento de respostas</li>
              <li>Notificações das ocorrências</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full" variant="outline">
              <Link href="/login/morador">Entrar como Morador</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="border-2 border-primary shadow-lg hover:border-primary/80 transition-all">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <UserCog className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Login do Síndico</CardTitle>
            <CardDescription>
              Acesse o painel para administrar as ocorrências do condomínio.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-slate-500">
            <ul className="list-disc list-inside space-y-2">
              <li>Gestão centralizada de chamados</li>
              <li>Atualizações e respostas aos moradores</li>
              <li>Controle de múltiplos blocos e prédios</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/login/sindico">Entrar como Síndico</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}