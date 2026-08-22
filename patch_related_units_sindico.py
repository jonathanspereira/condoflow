import re

with open("frontend/app/sindico/(private)/condominio/[id]/page.tsx", "r") as f:
    content = f.read()

new_content = """
                  <div className="flex flex-wrap gap-2 text-sm text-slate-500 mb-4 items-center">
                    <span>Por: <strong className="text-slate-700">{selectedOcorrencia?.authorName || "Anônimo"}</strong></span>
                    {selectedOcorrencia?.unitName && (
                      <>
                        <span>•</span>
                        <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">
                          Unidade {selectedOcorrencia.unitName}
                        </Badge>
                      </>
                    )}
                    {selectedOcorrencia?.relatedUnits && (
                      <>
                        <span>•</span>
                        <span className="text-amber-600 font-medium">Relaciona-se com: {selectedOcorrencia.relatedUnits}</span>
                      </>
                    )}
                  </div>
"""

content = re.sub(
    r'<div className="flex gap-2 text-sm text-slate-500 mb-4 items-center">.*?</div>',
    new_content.strip(),
    content,
    flags=re.DOTALL
)

with open("frontend/app/sindico/(private)/condominio/[id]/page.tsx", "w") as f:
    f.write(content)
