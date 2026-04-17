import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert, UserCheck, Info } from "lucide-react";
import Link from "next/link";

export default function EntryPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-4xl grid gap-6 md:grid-cols-2">
        
        {/* Opção: Registro Anônimo */}
        <Card className="border-2 hover:border-slate-300 transition-all">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <ShieldAlert className="h-6 w-6 text-slate-600" />
            </div>
            <CardTitle className="text-2xl">Relato Anônimo</CardTitle>
            <CardDescription>
              Sua identidade será preservada. Você receberá um protocolo para acompanhar.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-slate-500">
            <ul className="list-disc list-inside space-y-2">
              <li>Não requer login</li>
              <li>Identidade protegida</li>
              <li>Consulta via código de protocolo</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full" variant="outline">
              <Link href="/ocorrencia/anonima">Continuar Anônimo</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Opção: Registro Logado */}
        <Card className="border-2 border-primary shadow-lg hover:border-primary/80 transition-all">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <UserCheck className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Entrar na Conta</CardTitle>
            <CardDescription>
              Acesse para ver seu histórico e receber notificações em tempo real.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-slate-500">
            <ul className="list-disc list-inside space-y-2">
              <li>Histórico centralizado</li>
              <li>Notificações automáticas</li>
              <li>Opção de ocultar nome do vizinho</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/login/sindico">Fazer Login</Link>
            </Button>
          </CardFooter>
        </Card>

        <div className="md:col-span-2 flex items-center justify-center gap-2 text-xs text-slate-400">
          <Info className="h-4 w-4" />
          <span>O CondoFlow garante que denúncias sensíveis sejam tratadas com sigilo total.</span>
        </div>
      </div>
    </div>
  );
}