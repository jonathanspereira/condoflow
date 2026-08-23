import { Metadata } from "next"
import { redirect } from "next/navigation"


export const metadata: Metadata = {
  title: "Painel do Síndico",
}

export default function OcorrenciaPage() {
  redirect("/sindico/painel/ocorrencia/historico")
}