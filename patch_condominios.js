const fs = require('fs');
const file = 'frontend/app/admin/(private)/condominios/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add Tabs import
content = content.replace(
  'import { TooltipProvider } from "@/components/ui/tooltip"',
  `import { TooltipProvider } from "@/components/ui/tooltip"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Briefcase } from "lucide-react"`
);

// 2. Add porteiros state
content = content.replace(
  'const [sindicoSuccess, setSindicoSuccess] = useState<{ message: string; tempPassword?: string } | null>(null)',
  `const [sindicoSuccess, setSindicoSuccess] = useState<{ message: string; tempPassword?: string } | null>(null)
  const [porteirosVinculados, setPorteirosVinculados] = useState<any[]>([])
  const [isLoadingPorteiros, setIsLoadingPorteiros] = useState(false)
  const [emailPorteiro, setEmailPorteiro] = useState("")
  const [nomePorteiro, setNomePorteiro] = useState("")
  const [isSavingPorteiro, setIsSavingPorteiro] = useState(false)
  const [porteiroError, setPorteiroError] = useState("")
  const [porteiroSuccess, setPorteiroSuccess] = useState<{ message: string; tempPassword?: string } | null>(null)
  const [editingPorteiroId, setEditingPorteiroId] = useState<string | null>(null)
  const [editPorteiroName, setEditPorteiroName] = useState("")
  const [editPorteiroEmail, setEditPorteiroEmail] = useState("")
  const [isSavingEditPorteiro, setIsSavingEditPorteiro] = useState(false)`
);

// 3. Update handleOpenSindico to handleOpenFuncionarios
content = content.replace(
  'const handleOpenSindico = async (condo: Condominium) => {',
  `const fetchPorteirosVinculados = async (condoId: number) => {
    setIsLoadingPorteiros(true)
    try {
      const response = await fetch(\`\${process.env.NEXT_PUBLIC_API_URL}/condominiums/\${condoId}/concierges\`, {
        headers: { Authorization: \`Bearer \${getToken()}\` }
      })
      if (response.ok) {
        setPorteirosVinculados(await response.json())
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoadingPorteiros(false)
    }
  }
  
  const handleOpenSindico = async (condo: Condominium) => {`
);

content = content.replace(
  /const handleOpenSindico = async \(condo: Condominium\) => \{([\s\S]*?)await fetchSindicosVinculados\(condo\.id\)\n  \}/m,
  `const handleOpenFuncionarios = async (condo: Condominium) => {
    setSelectedCondo(condo)
    setEmailSindico("")
    setNomeSindico("")
    setSindicoError("")
    setSindicoSuccess(null)
    setIsSindicoOpen(true)
    setSindicosVinculados([])
    
    setEmailPorteiro("")
    setNomePorteiro("")
    setPorteiroError("")
    setPorteiroSuccess(null)
    setPorteirosVinculados([])
    
    await Promise.all([
      fetchSindicosVinculados(condo.id),
      fetchPorteirosVinculados(condo.id)
    ])
  }`
);

// 4. Add porteiros functions
content = content.replace(
  'const handleUpdateCondominium = async (e: React.FormEvent) => {',
  `const handleVincularPorteiro = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCondo || !emailPorteiro) return
    setIsSavingPorteiro(true)
    setPorteiroError("")
    setPorteiroSuccess(null)
    try {
      const response = await fetch(\`\${process.env.NEXT_PUBLIC_API_URL}/condominiums/\${selectedCondo.id}/concierges\`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: \`Bearer \${getToken()}\` },
        body: JSON.stringify({ email: emailPorteiro, name: nomePorteiro || undefined })
      })
      if (response.ok) {
        const data = await response.json()
        setPorteiroSuccess({
          message: \`\${data.name} foi adicionado como porteiro de \${selectedCondo.name}.\`,
          tempPassword: data.temporaryPassword || undefined
        })
        setEmailPorteiro("")
        setNomePorteiro("")
        fetchPorteirosVinculados(selectedCondo.id)
      } else {
        const errData = await response.json().catch(() => null)
        setPorteiroError(errData?.message || "Não foi possível adicionar o porteiro.")
      }
    } catch (error) {
      setPorteiroError("Erro de conexão com o servidor.")
    } finally {
      setIsSavingPorteiro(false)
    }
  }

  const handleRemovePorteiro = async (porteiroId: string) => {
    if (!selectedCondo) return
    setIsLoadingPorteiros(true)
    setPorteiroError("")
    try {
      const response = await fetch(\`\${process.env.NEXT_PUBLIC_API_URL}/condominiums/\${selectedCondo.id}/concierges/\${porteiroId}\`, {
        method: "DELETE",
        headers: { Authorization: \`Bearer \${getToken()}\` }
      })
      if (response.ok) {
        fetchPorteirosVinculados(selectedCondo.id)
        setPorteiroSuccess(null)
      } else {
        setPorteiroError("Erro ao remover o porteiro.")
      }
    } catch (error) {
      setPorteiroError("Erro de conexão ao remover.")
    } finally {
      setIsLoadingPorteiros(false)
    }
  }

  const handleEditPorteiroSubmit = async (porteiroId: string) => {
    if (!selectedCondo) return
    setIsSavingEditPorteiro(true)
    setPorteiroError("")
    try {
      const response = await fetch(\`\${process.env.NEXT_PUBLIC_API_URL}/condominiums/\${selectedCondo.id}/concierges/\${porteiroId}\`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: \`Bearer \${getToken()}\` },
        body: JSON.stringify({ email: editPorteiroEmail, name: editPorteiroName || undefined })
      })
      if (response.ok) {
        fetchPorteirosVinculados(selectedCondo.id)
        setEditingPorteiroId(null)
        setPorteiroSuccess(null)
      } else {
        const errData = await response.json().catch(() => null)
        setPorteiroError(errData?.message || "Erro ao atualizar o porteiro.")
      }
    } catch (error) {
      setPorteiroError("Erro de conexão ao atualizar.")
    } finally {
      setIsSavingEditPorteiro(false)
    }
  }
  
  const handleUpdateCondominium = async (e: React.FormEvent) => {`
);

// 5. Replace "Modal para Vincular Síndico por E-mail" UI with Funcionarios UI
const oldModal = `      {/* Modal para Vincular Síndico por E-mail */}
      <Dialog open={isSindicoOpen} onOpenChange={setIsSindicoOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Vincular Síndico</DialogTitle>
            <DialogDescription>
              Informe o e-mail do síndico responsável. Apenas um síndico pode estar vinculado por vez (o antigo será substituído). Se o e-mail não tiver conta, uma nova será criada.
            </DialogDescription>
          </DialogHeader>

          <div className="bg-slate-50 border border-slate-100 rounded-md p-3 mb-1">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-tight mb-2">Síndicos Atuais</h4>
            {isLoadingSindicos ? (
              <p className="text-xs text-slate-500 flex items-center gap-2"><Loader2 className="h-3 w-3 animate-spin" /> Carregando...</p>
            ) : sindicosVinculados.length > 0 ? (
              <ul className="space-y-2">
                {sindicosVinculados.map((s, i) => (
                  <li key={i} className="text-xs flex flex-col gap-2 bg-white p-2 border rounded">
                    {editingSindicoId === s.id ? (
                      <div className="flex flex-col gap-2 w-full">
                        <Input
                          value={editSindicoName}
                          onChange={(e) => setEditSindicoName(e.target.value)}
                          placeholder="Nome do Síndico"
                          className="h-8 text-xs"
                        />
                        <Input
                          value={editSindicoEmail}
                          onChange={(e) => setEditSindicoEmail(e.target.value)}
                          placeholder="E-mail do Síndico"
                          className="h-8 text-xs"
                        />
                        <div className="flex justify-end gap-2 mt-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => setEditingSindicoId(null)}
                            disabled={isSavingEditSindico}
                          >
                            Cancelar
                          </Button>
                          <Button
                            size="sm"
                            className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={() => handleEditSindicoSubmit(s.id)}
                            disabled={isSavingEditSindico}
                          >
                            {isSavingEditSindico ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                            Salvar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between w-full">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">{s.name}</span>
                          <span className="text-slate-500">{s.email}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-slate-500 hover:text-slate-700 h-7 px-2"
                            onClick={() => {
                              setEditingSindicoId(s.id)
                              setEditSindicoName(s.name)
                              setEditSindicoEmail(s.email)
                            }}
                            disabled={isLoadingSindicos}
                          >
                            Editar
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-500 hover:text-red-700 h-7 px-2"
                            onClick={() => handleRemoveSindico(s.id)}
                            disabled={isLoadingSindicos}
                          >
                            Remover
                          </Button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-500 italic">Nenhum síndico vinculado no momento.</p>
            )}
          </div>

          {sindicoError && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-md font-medium">
              {sindicoError}
            </div>
          )}

          {sindicoSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm p-3 rounded-md font-medium space-y-1">
              <p>{sindicoSuccess.message}</p>
              {sindicoSuccess.tempPassword && (
                <p className="font-mono text-xs bg-white border border-emerald-200 rounded px-2 py-1 inline-block">
                  Senha temporária: <strong>{sindicoSuccess.tempPassword}</strong>
                </p>
              )}
            </div>
          )}
          {sindicosVinculados.length === 0 ? (
            <form onSubmit={handleVincularSindico} className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email-sindico">E-mail do Síndico</Label>
              <Input 
                id="email-sindico" 
                type="email"
                placeholder="sindico@condominio.com" 
                value={emailSindico} 
                onChange={(e) => setEmailSindico(e.target.value)} 
                required 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="nome-sindico">Nome do Síndico</Label>
              <Input 
                id="nome-sindico" 
                placeholder="Necessário apenas se ainda não tiver conta" 
                value={nomeSindico} 
                onChange={(e) => setNomeSindico(e.target.value)} 
              />
            </div>
            <DialogFooter className="pt-4">
              <Button type="submit" disabled={isSavingSindico} className="bg-emerald-600 hover:bg-emerald-700 w-full font-bold text-white gap-2">
                {isSavingSindico && <Loader2 className="h-4 w-4 animate-spin" />}
                Vincular Síndico
              </Button>
            </DialogFooter>
            </form>
          ) : (
            <div className="py-4 text-center border border-slate-100 bg-slate-50 rounded-md mt-4">
              <p className="text-sm text-slate-500 px-4">
                Este condomínio já possui um síndico vinculado. Remova o síndico atual para vincular um novo.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>`;

const newModal = `      {/* Modal para Vincular Funcionários (Síndico/Porteiro) */}
      <Dialog open={isSindicoOpen} onOpenChange={setIsSindicoOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
               <Briefcase className="text-blue-600" /> Gestão de Funcionários
            </DialogTitle>
            <DialogDescription>
              Cadastre e gerencie a equipe de administração e acesso (Síndicos e Porteiros) do condomínio.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="sindicos" className="w-full mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="sindicos">Administração (Síndico)</TabsTrigger>
              <TabsTrigger value="porteiros">Portaria</TabsTrigger>
            </TabsList>
            
            {/* TABS SÍNDICO */}
            <TabsContent value="sindicos" className="space-y-4 pt-4">
              <div className="bg-slate-50 border border-slate-100 rounded-md p-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-tight mb-2">Síndicos Atuais</h4>
                {isLoadingSindicos ? (
                  <p className="text-xs text-slate-500 flex items-center gap-2"><Loader2 className="h-3 w-3 animate-spin" /> Carregando...</p>
                ) : sindicosVinculados.length > 0 ? (
                  <ul className="space-y-2">
                    {sindicosVinculados.map((s, i) => (
                      <li key={i} className="text-xs flex flex-col gap-2 bg-white p-2 border rounded shadow-sm">
                        {editingSindicoId === s.id ? (
                          <div className="flex flex-col gap-2 w-full">
                            <Input
                              value={editSindicoName}
                              onChange={(e) => setEditSindicoName(e.target.value)}
                              placeholder="Nome do Síndico"
                              className="h-8 text-xs"
                            />
                            <Input
                              value={editSindicoEmail}
                              onChange={(e) => setEditSindicoEmail(e.target.value)}
                              placeholder="E-mail do Síndico"
                              className="h-8 text-xs"
                            />
                            <div className="flex justify-end gap-2 mt-1">
                              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setEditingSindicoId(null)} disabled={isSavingEditSindico}>Cancelar</Button>
                              <Button size="sm" className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleEditSindicoSubmit(s.id)} disabled={isSavingEditSindico}>
                                {isSavingEditSindico ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null} Salvar
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between w-full">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-900">{s.name}</span>
                              <span className="text-slate-500">{s.email}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-700 h-7 px-2" onClick={() => { setEditingSindicoId(s.id); setEditSindicoName(s.name); setEditSindicoEmail(s.email); }} disabled={isLoadingSindicos}>Editar</Button>
                              <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 h-7 px-2" onClick={() => handleRemoveSindico(s.id)} disabled={isLoadingSindicos}>Remover</Button>
                            </div>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-500 italic">Nenhum síndico vinculado no momento.</p>
                )}
              </div>

              {sindicoError && <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-md font-medium">{sindicoError}</div>}
              {sindicoSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm p-3 rounded-md font-medium space-y-1">
                  <p>{sindicoSuccess.message}</p>
                  {sindicoSuccess.tempPassword && <p className="font-mono text-xs bg-white border border-emerald-200 rounded px-2 py-1 inline-block">Senha temporária: <strong>{sindicoSuccess.tempPassword}</strong></p>}
                </div>
              )}

              {sindicosVinculados.length === 0 ? (
                <form onSubmit={handleVincularSindico} className="grid gap-4 py-2">
                  <div className="grid gap-2">
                    <Label htmlFor="email-sindico">E-mail do Síndico</Label>
                    <Input id="email-sindico" type="email" placeholder="sindico@condominio.com" value={emailSindico} onChange={(e) => setEmailSindico(e.target.value)} required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="nome-sindico">Nome do Síndico</Label>
                    <Input id="nome-sindico" placeholder="Necessário apenas se ainda não tiver conta" value={nomeSindico} onChange={(e) => setNomeSindico(e.target.value)} />
                  </div>
                  <Button type="submit" disabled={isSavingSindico} className="bg-emerald-600 hover:bg-emerald-700 w-full font-bold text-white mt-2 gap-2">
                    {isSavingSindico && <Loader2 className="h-4 w-4 animate-spin" />} Vincular Síndico
                  </Button>
                </form>
              ) : (
                <div className="py-4 text-center border border-slate-100 bg-slate-50 rounded-md">
                  <p className="text-sm text-slate-500 px-4">Este condomínio já possui um síndico vinculado. Remova o atual para vincular um novo.</p>
                </div>
              )}
            </TabsContent>

            {/* TABS PORTEIRO */}
            <TabsContent value="porteiros" className="space-y-4 pt-4">
              <div className="bg-slate-50 border border-slate-100 rounded-md p-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-tight mb-2">Porteiros Atuais</h4>
                {isLoadingPorteiros ? (
                  <p className="text-xs text-slate-500 flex items-center gap-2"><Loader2 className="h-3 w-3 animate-spin" /> Carregando...</p>
                ) : porteirosVinculados.length > 0 ? (
                  <ul className="space-y-2">
                    {porteirosVinculados.map((p, i) => (
                      <li key={i} className="text-xs flex flex-col gap-2 bg-white p-2 border rounded shadow-sm">
                        {editingPorteiroId === p.id ? (
                          <div className="flex flex-col gap-2 w-full">
                            <Input
                              value={editPorteiroName}
                              onChange={(e) => setEditPorteiroName(e.target.value)}
                              placeholder="Nome do Porteiro"
                              className="h-8 text-xs"
                            />
                            <Input
                              value={editPorteiroEmail}
                              onChange={(e) => setEditPorteiroEmail(e.target.value)}
                              placeholder="E-mail do Porteiro"
                              className="h-8 text-xs"
                            />
                            <div className="flex justify-end gap-2 mt-1">
                              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setEditingPorteiroId(null)} disabled={isSavingEditPorteiro}>Cancelar</Button>
                              <Button size="sm" className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white" onClick={() => handleEditPorteiroSubmit(p.id)} disabled={isSavingEditPorteiro}>
                                {isSavingEditPorteiro ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null} Salvar
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between w-full">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-900">{p.name}</span>
                              <span className="text-slate-500">{p.email}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-700 h-7 px-2" onClick={() => { setEditingPorteiroId(p.id); setEditPorteiroName(p.name); setEditPorteiroEmail(p.email); }} disabled={isLoadingPorteiros}>Editar</Button>
                              <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 h-7 px-2" onClick={() => handleRemovePorteiro(p.id)} disabled={isLoadingPorteiros}>Remover</Button>
                            </div>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-500 italic">Nenhum porteiro vinculado no momento.</p>
                )}
              </div>

              {porteiroError && <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-md font-medium">{porteiroError}</div>}
              {porteiroSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm p-3 rounded-md font-medium space-y-1">
                  <p>{porteiroSuccess.message}</p>
                  {porteiroSuccess.tempPassword && <p className="font-mono text-xs bg-white border border-emerald-200 rounded px-2 py-1 inline-block">Senha temporária: <strong>{porteiroSuccess.tempPassword}</strong></p>}
                </div>
              )}

              <form onSubmit={handleVincularPorteiro} className="grid gap-4 py-2 border-t pt-4">
                <div className="grid gap-2">
                  <Label htmlFor="email-porteiro">E-mail do Porteiro</Label>
                  <Input id="email-porteiro" type="email" placeholder="porteiro@condominio.com" value={emailPorteiro} onChange={(e) => setEmailPorteiro(e.target.value)} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="nome-porteiro">Nome do Porteiro</Label>
                  <Input id="nome-porteiro" placeholder="Ex: Carlos Silva" value={nomePorteiro} onChange={(e) => setNomePorteiro(e.target.value)} required />
                </div>
                <Button type="submit" disabled={isSavingPorteiro} className="bg-blue-600 hover:bg-blue-700 w-full font-bold text-white mt-2 gap-2">
                  {isSavingPorteiro && <Loader2 className="h-4 w-4 animate-spin" />} Adicionar Porteiro
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>`;

content = content.replace(oldModal, newModal);

// 6. Replace "Mail" button in the list to "Briefcase" (Funcionarios)
content = content.replace(
  `                        {/* Botão para Vincular Síndico por E-mail */}
                        <TooltipProvider>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                            onClick={() => handleOpenSindico(condo)}
                            title="Vincular Síndico por E-mail"
                          >
                            <Mail size={18} />
                          </Button>
                        </TooltipProvider>`,
  `                        {/* Botão para Gerenciar Funcionários */}
                        <TooltipProvider>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                            onClick={() => handleOpenFuncionarios(condo)}
                            title="Equipe do Condomínio (Síndico/Portaria)"
                          >
                            <Briefcase size={18} />
                          </Button>
                        </TooltipProvider>`
);

// 7. Change the icon of Unidades from Users to Home
content = content.replace(
  `                              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-emerald-600 hover:bg-emerald-50">
                                <Users size={18} />
                              </Button>`,
  `                              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-emerald-600 hover:bg-emerald-50" title="Unidades e Moradores">
                                <Home size={18} />
                              </Button>`
);

fs.writeFileSync(file, content);
