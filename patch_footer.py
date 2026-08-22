import re

with open("frontend/app/page.tsx", "r") as f:
    content = f.read()

new_footer = """
      {/* Footer */}
      <footer className="py-8 border-t bg-slate-50">
        <div className="max-w-5xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">© 2026 CondoFlow. Sistema de Gestão de Ocorrências.</p>
          <div className="flex gap-6 text-sm text-slate-500">
            <Link href="/privacidade" className="hover:text-primary transition-colors">Política de Privacidade</Link>
            <Link href="/cookies" className="hover:text-primary transition-colors">Política de Cookies</Link>
            <Link href="/lgpd" className="hover:text-primary transition-colors">Sobre a LGPD</Link>
          </div>
        </div>
      </footer>
"""

content = re.sub(
    r'\{/\* Footer \*/\}.*?</footer>',
    new_footer.strip(),
    content,
    flags=re.DOTALL
)

with open("frontend/app/page.tsx", "w") as f:
    f.write(content)
