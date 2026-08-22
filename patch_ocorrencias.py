import re

with open("frontend/app/morador/(private)/minhas-ocorrencias/page.tsx", "r") as f:
    content = f.read()

new_submit = """
      const response = await fetch("http://localhost:8080/api/v1/occurrences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          title: titulo,
          description: descricao,
          category: categoria,
          unitId: localStorage.getItem("condoflow_unit_id") ? Number(localStorage.getItem("condoflow_unit_id")) : undefined,
          relatedUnits: hasRelatedUnit && relatedUnitsList.length > 0 ? relatedUnitsList.join(", ") : (hasRelatedUnit ? relatedUnit : null),
        })
      })

      if (response.ok) {
        const occData = await response.json()
        
        // Upload arquivos se houver
        if (arquivos && arquivos.length > 0) {
          for (const arquivo of arquivos) {
            const formData = new FormData();
            formData.append("file", arquivo);
            
            try {
              await fetch(`http://localhost:8080/api/v1/occurrences/${occData.id}/attachments`, {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${getToken()}`
                },
                body: formData
              });
            } catch (err) {
              console.error("Erro ao fazer upload do anexo:", err);
              toast.error(`Falha ao anexar o arquivo ${arquivo.name}`);
            }
          }
        }

        resetForm()
        setIsModalOpen(false)
        fetchOccurrences()
"""

content = re.sub(
    r'const response = await fetch\("http://localhost:8080/api/v1/occurrences".*?if \(response\.ok\) \{.*?fetchOccurrences\(\)\n',
    new_submit.strip() + '\n',
    content,
    flags=re.DOTALL
)

with open("frontend/app/morador/(private)/minhas-ocorrencias/page.tsx", "w") as f:
    f.write(content)
