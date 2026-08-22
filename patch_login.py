import re

with open("frontend/app/morador/(public)/login/page.tsx", "r") as f:
    content = f.read()

# The link is currently just "Esqueceu sua senha?"
# Let's add "Primeiro Acesso?" before or after it.

new_links = """
            <div className="flex items-center justify-between">
              <Link
                href="/morador/primeiro-acesso"
                className="text-sm font-medium text-emerald-600 hover:text-emerald-500 hover:underline transition-colors"
              >
                Primeiro Acesso?
              </Link>
              <Link
                href="/morador/esqueceu-senha"
                className="text-sm font-medium text-slate-600 hover:text-emerald-500 hover:underline transition-colors"
              >
                Esqueceu sua senha?
              </Link>
            </div>
"""

content = re.sub(
    r'<div className="flex items-center justify-end">.*?Esqueceu sua senha\?.*?</div>',
    new_links.strip(),
    content,
    flags=re.DOTALL
)

with open("frontend/app/morador/(public)/login/page.tsx", "w") as f:
    f.write(content)
