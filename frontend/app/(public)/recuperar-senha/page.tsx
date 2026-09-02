"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Loader2, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

const forgotSchema = z.object({
  email: z.string().min(1, "O e-mail é obrigatório.").email("Digite um formato de e-mail válido."),
})

type ForgotFormValues = z.infer<typeof forgotSchema>

export default function RecuperarSenhaPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  })

  async function onSubmit(data: ForgotFormValues) {
    setIsLoading(true)
    setErrorMsg("")

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: data.email }),
      })

      if (response.ok) {
        setIsSuccess(true)
        toast.success("Solicitação enviada com sucesso!")
      } else {
        const errorData = await response.json().catch(() => null)
        const msg = errorData?.message || "Ocorreu um erro. Tente novamente."
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
            <CardTitle className="text-2xl text-center font-bold">Recuperar Senha</CardTitle>
            <CardDescription className="text-center">
              Informe seu e-mail para receber um link de redefinição de senha.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {isSuccess ? (
              <div className="flex flex-col items-center justify-center text-center space-y-4 py-4 animate-in fade-in duration-500">
                <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                <div className="space-y-2">
                  <h3 className="font-bold text-lg text-slate-800">Pronto!</h3>
                  <p className="text-sm text-slate-500">
                    Se o e-mail informado estiver cadastrado, você receberá um link de recuperação em instantes.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid gap-4">
                  {errorMsg && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-2.5 rounded-md text-center font-medium">
                      {errorMsg}
                    </div>
                  )}
                  <div className="grid gap-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="nome@exemplo.com"
                      disabled={isLoading}
                      {...register("email")}
                      className={errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}
                    />
                    {errors.email && (
                      <p className="text-xs text-red-500 font-medium">{errors.email.message}</p>
                    )}
                  </div>
                  
                  <Button className="w-full font-bold" type="submit" disabled={isLoading}>
                    {isLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Enviar Link
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
          {!isSuccess && (
            <CardFooter className="flex flex-col">
              <p className="mt-2 text-xs text-center text-muted-foreground">
                Lembrou sua senha?{" "}
                <Link href="/" className="text-primary hover:underline">
                  Faça login
                </Link>
              </p>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  )
}
