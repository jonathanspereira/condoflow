import re

with open("frontend/app/sindico/(private)/painel/page.tsx", "r") as f:
    content = f.read()

# Add Select to imports
if "SelectContent" not in content:
    content = content.replace(
        "import { Card, CardContent, CardHeader, CardTitle, CardDescription } from \"@/components/ui/card\"",
        "import { Card, CardContent, CardHeader, CardTitle, CardDescription } from \"@/components/ui/card\"\nimport { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from \"@/components/ui/select\""
    )

# Add days state
if "const [days, setDays] = useState<string>('30')" not in content:
    content = content.replace(
        "const [isLoading, setIsLoading] = useState(true)",
        "const [isLoading, setIsLoading] = useState(true)\n  const [days, setDays] = useState<string>('all')"
    )

# Update fetch url
content = content.replace(
    "fetch(\"http://localhost:8080/api/v1/dashboard/syndic\",",
    "fetch(`http://localhost:8080/api/v1/dashboard/syndic${days !== 'all' ? `?days=${days}` : ''}`,"
)

# Add days dependency
content = content.replace(
    "  }, [])",
    "  }, [days])"
)

# Add Select component to UI
new_header = """
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Painel do Síndico</h1>
          <p className="text-slate-500 mt-1">Acompanhe as métricas e gerencie seu condomínio</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={days} onValueChange={setDays}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todo o período</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 3 meses</SelectItem>
              <SelectItem value="180">Últimos 6 meses</SelectItem>
              <SelectItem value="365">Último ano</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
"""
content = re.sub(
    r'<div className="mb-8">\s*<h1 className="text-3xl font-bold tracking-tight text-slate-900">Painel do Síndico</h1>\s*<p className="text-slate-500 mt-1">Acompanhe as métricas e gerencie seu condomínio</p>\s*</div>',
    new_header.strip(),
    content,
    flags=re.DOTALL
)

with open("frontend/app/sindico/(private)/painel/page.tsx", "w") as f:
    f.write(content)
