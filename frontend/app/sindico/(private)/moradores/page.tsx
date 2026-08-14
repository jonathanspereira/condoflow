import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function MoradoresPage() {
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Moradores</CardTitle>
          <CardDescription>Gerencie os moradores do condomínio selecionado.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Nenhum morador cadastrado no momento.</p>
        </CardContent>
      </Card>
    </div>
  )
}
