"use client"

import { useState, Suspense } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Loader2, KeyRound } from "lucide-react"
import { toast } from "sonner"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

const resetSchema = z.object({
  newPassword: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
  confirmPassword: z.string().min(6, "Confirme a senha."),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "As senhas não coincidem.",
  path: ["confirmPassword"],
})

type ResetFormValues = z.infer<typeof resetSchema>

function RedefinirSenhaForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  })

  async function onSubmit(data: ResetFormValues) {
    if (!token) {
      setErrorMsg("Token de recuperação ausente ou inválido na URL.")
      return
    }

    setIsLoading(true)
    setErrorMsg("")

    try {
      const response = await fetch("http://localhost:8080/api/v1/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, newPassword: data.newPassword }),
      })

      if (response.ok) {
        toast.success("Senha redefinida com sucesso! Faça login com a nova senha.")
        router.push("/")
      } else {
        const errorData = await response.json().catch(() => null)
        const msg = errorData?.message || "Ocorreu um erro. O link pode estar expirado."
        setErrorMsg(msg)
        toast.error(msg)
      }
    } catch (error) {
      console.error("Erro ao conectar com o servidor:", error)
      setErrorMsg("Não foi possível conectar ao servidor.")
      toast.error("Erro de conexão.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="text-center py-8">
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6 inline-block">
          Link de recuperação inválido ou ausente.
        </div>
        <br/>
        <Link href="/recuperar-senha">
          <Button variant="outline">Solicitar novo link</Button>
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-4">
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-2.5 rounded-md text-center font-medium">
            {errorMsg}
          </div>
        )}
        <div className="grid gap-2">
          <Label htmlFor="newPassword">Nova Senha</Label>
          <Input
            id="newPassword"
            type="password"
            placeholder="Mínimo de 6 caracteres"
            disabled={isLoading}
            {...register("newPassword")}
            className={errors.newPassword ? "border-red-500 focus-visible:ring-red-500" : ""}
          />
          {errors.newPassword && (
            <p className="text-xs text-red-500 font-medium">{errors.newPassword.message}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Repita a nova senha"
            disabled={isLoading}
            {...register("confirmPassword")}
            className={errors.confirmPassword ? "border-red-500 focus-visible:ring-red-500" : ""}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-red-500 font-medium">{errors.confirmPassword.message}</p>
          )}
        </div>
        
        <Button className="w-full font-bold mt-2" type="submit" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <KeyRound className="mr-2 h-4 w-4" />
          )}
          Salvar Nova Senha
        </Button>
      </div>
    </form>
  )
}

export default function RedefinirSenhaPage() {
  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-1 lg:px-0">
      <Link
        href="/"
        className="absolute left-4 top-4 md:left-8 md:top-8 flex items-center text-sm font-medium text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar para o início
      </Link>

      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center font-bold">Redefinir Senha</CardTitle>
            <CardDescription className="text-center">
              Crie uma nova senha segura para acessar sua conta.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>}>
              <RedefinirSenhaForm />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
