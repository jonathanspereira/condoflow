import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const ocorrencias = [
  { id: "OC-1042", tipo: "Barulho", status: "Em análise", data: "24/04/2026" },
  { id: "OC-1038", tipo: "Vaga indevida", status: "Concluída", data: "22/04/2026" },
  { id: "OC-1031", tipo: "Lixo fora do horário", status: "Concluída", data: "18/04/2026" },
]

export default function HistoricoOcorrenciasPage() {
  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Histórico de Ocorrências</h1>
        <p className="text-sm text-muted-foreground">Acompanhe as ocorrências registradas no condomínio.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Últimos registros</CardTitle>
          <CardDescription>Lista consolidada das ocorrências recentes.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {ocorrencias.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="text-sm font-semibold">{item.id} • {item.tipo}</p>
                <p className="text-xs text-muted-foreground">{item.data}</p>
              </div>
              <Badge variant="outline">{item.status}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
