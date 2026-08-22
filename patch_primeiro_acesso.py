import re

with open("frontend/app/morador/(public)/primeiro-acesso/page.tsx", "r") as f:
    content = f.read()

content = content.replace("Esqueceu a senha?", "Primeiro Acesso")
content = content.replace("AdminForgotPasswordPage", "MoradorPrimeiroAcessoPage")
content = content.replace("Digite seu e-mail de administrador para receber um link de recuperação de senha.", "Digite o e-mail cadastrado pelo seu síndico para criar sua senha de acesso inicial.")
content = content.replace("Recuperar Senha", "Solicitar Acesso")
content = content.replace("Enviando...", "Processando...")
content = content.replace('href="/admin/login"', 'href="/morador/login"')

with open("frontend/app/morador/(public)/primeiro-acesso/page.tsx", "w") as f:
    f.write(content)
