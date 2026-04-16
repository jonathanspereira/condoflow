import RegistrarOcorrencia from "../../../../components/forms/OcorrenciaForm"; // Importa o componente que criamos
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PaginaAnonima() {
  return (
    <main className="relative min-h-screen bg-slate-50">
      <Link
        href="/ocorrencia"
        className="absolute left-4 top-4 md:left-8 md:top-8 flex items-center text-sm font-medium text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar
      </Link>
      {/* Chamamos o formulário configurado para o modo anônimo */}
      <RegistrarOcorrencia isAnonimo={true} />
    </main>
  );
}