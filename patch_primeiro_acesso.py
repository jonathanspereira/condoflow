import re

with open("frontend/app/morador/(public)/primeiro-acesso/page.tsx", "r") as f:
    content = f.read()

new_submit = """
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)

    try {
      const response = await fetch("http://localhost:8080/api/v1/auth/first-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        setIsSent(true)
      } else {
        const errorData = await response.json().catch(() => null)
        alert(errorData?.message || "Erro ao processar a requisição.")
      }
    } catch (error) {
      alert("Erro de conexão com o servidor.")
    } finally {
      setIsLoading(false)
    }
  }
"""

content = re.sub(
    r'const handleSubmit = async \(e: React\.FormEvent\) => \{.*?\n  \}',
    new_submit.strip(),
    content,
    flags=re.DOTALL
)

with open("frontend/app/morador/(public)/primeiro-acesso/page.tsx", "w") as f:
    f.write(content)
