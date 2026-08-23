import os
import re

page_files = []
for root, dirs, files in os.walk('frontend/app'):
    if 'page.tsx' in files:
        page_files.append(os.path.join(root, 'page.tsx'))

def generate_title(path):
    parts = path.split('/')
    
    # Handle specific known routes
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
    
    # Default title
    return 'Página'

for file_path in page_files:
    with open(file_path, 'r') as f:
        content = f.read()
    
    if "export const metadata" not in content and "'use client'" not in content and '"use client"' not in content:
        title = generate_title(file_path)
        
        # Add metadata import if needed
        if "import { Metadata }" not in content and "import type { Metadata }" not in content:
            if "import " in content:
                content = re.sub(r'^(import .*?\n)', r'import { Metadata } from "next"\n\1', content)
            else:
                content = 'import { Metadata } from "next"\n' + content
                
        # Insert metadata export before the default export
        metadata_str = f'\nexport const metadata: Metadata = {{\n  title: "{title}",\n}}\n\n'
        content = re.sub(r'(export default function)', metadata_str + r'\1', content)
        
        with open(file_path, 'w') as f:
            f.write(content)

