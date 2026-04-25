export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard Global</h1>
        <p className="text-slate-500">Bem-vindo à central de controle do CondoFlow SaaS.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Condomínios", value: "12", sub: "+2 este mês" },
          { label: "Usuários Ativos", value: "1.240", sub: "98% taxa de saúde" },
          { label: "Ocorrências Totais", value: "458", sub: "12 pendentes" },
          { label: "MRR (Receita)", value: "R$ 12.500", sub: "Meta: R$ 15k" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border shadow-sm">
            <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
            <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
            <p className="text-[10px] text-emerald-600 font-bold mt-1">{stat.sub}</p>
          </div>
        ))}
      </div>
      
      <div className="h-[300px] bg-slate-200/50 rounded-xl border-2 border-dashed flex items-center justify-center text-slate-400">
        Gráfico de Crescimento do SaaS (Pendente)
      </div>
    </div>
  )
}