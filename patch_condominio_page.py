import re

with open("frontend/app/sindico/(private)/condominio/[id]/page.tsx", "r") as f:
    content = f.read()

new_submit = """
      // 1. Atualizar o status e a mensagem em uma única chamada
      const response = await fetch(`http://localhost:8080/api/v1/occurrences/${selectedOcorrencia.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          status: novoStatus,
          response: respostaOficial.trim() || null
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        const msg = errorData?.message || "Não foi possível atualizar o status da ocorrência."
        toast.error(msg)
        setIsSubmitting(false)
        return
      }

      const updatedOcorrencia = await response.json()
"""

content = re.sub(
    r'// 1\. Atualizar o status.*?let updatedOcorrencia = await response\.json\(\)\s*if \(respostaOficial\.trim\(\)\) \{.*?\}\n',
    new_submit.strip() + '\n\n',
    content,
    flags=re.DOTALL
)

with open("frontend/app/sindico/(private)/condominio/[id]/page.tsx", "w") as f:
    f.write(content)
