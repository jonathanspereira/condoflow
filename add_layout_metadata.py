import os

def generate_title(path):
    parts = path.split('/')
    
    if 'admin' in parts and 'login' in parts: return 'Login Admin'
    if 'sindico' in parts and 'login' in parts: return 'Login Síndico'
    if 'morador' in parts and 'login' in parts: return 'Login Morador'
    if 'admin' in parts and 'dashboard' in parts: return 'Dashboard Admin'
    if 'sindico' in parts and 'painel' in parts: return 'Painel do Síndico'
    if 'sindico' in parts and 'moradores' in parts: return 'Moradores'
    if 'admin' in parts and 'condominios' in parts: return 'Condomínios'
    if 'morador' in parts and 'minhas-ocorrencias' in parts: return 'Minhas Ocorrências'
    if 'sindico' in parts and 'condominio' in parts: return 'Gerir Ocorrências'
    if 'admin' in parts and 'perfil' in parts: return 'Perfil Admin'
    if 'sindico' in parts and 'perfil' in parts: return 'Perfil Síndico'
    if 'morador' in parts and 'perfil' in parts: return 'Perfil Morador'
    if 'primeiro-acesso' in parts: return 'Primeiro Acesso'
    if 'ocorrencia' in parts and 'anonima' in parts: return 'Ocorrência Anônima'
    if 'ocorrencia' in parts and 'sucesso' in parts: return 'Ocorrência Registrada'
    if 'ocorrencia' in parts and 'consulta' in parts: return 'Consultar Ocorrência'
    if 'ocorrencia' in parts: return 'Ocorrências'
    if 'privacidade' in parts: return 'Política de Privacidade'
    if 'cookies' in parts: return 'Política de Cookies'
    if 'lgpd' in parts: return 'Sobre LGPD'
    if 'recuperar-senha' in parts: return 'Recuperar Senha'
    if 'redefinir-senha' in parts: return 'Redefinir Senha'
    if 'esqueceu-senha' in parts: return 'Esqueci a Senha'
    
    return 'CondoFlow'

for root, dirs, files in os.walk('frontend/app'):
    if 'page.tsx' in files:
        page_path = os.path.join(root, 'page.tsx')
        with open(page_path, 'r') as f:
            content = f.read()
            
        if "'use client'" in content or '"use client"' in content:
            # Check if there is already a layout.tsx in the exact same folder
            layout_path = os.path.join(root, 'layout.tsx')
            if not os.path.exists(layout_path):
                title = generate_title(page_path)
                
                layout_content = f"""import type {{ Metadata }} from "next";

export const metadata: Metadata = {{
  title: "{title}",
}};

export default function Layout({{
  children,
}}: Readonly<{{
  children: React.ReactNode;
}}>) {{
  return <>{{children}}</>;
}}
"""
                with open(layout_path, 'w') as f:
                    f.write(layout_content)
                    
