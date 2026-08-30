"use client"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { ArrowLeft, Loader2, Building2, Check, ArrowRight } from "lucide-react"
import { toast } from "sonner"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Turnstile } from '@marsidev/react-turnstile'

const registerSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
  email: z.string().min(1, "O e-mail é obrigatório.").email("Digite um formato de e-mail válido."),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
  condominiumName: z.string().min(3, "O nome do condomínio deve ter pelo menos 3 caracteres."),
  condominiumCnpj: z.string().min(14, "O CNPJ deve ter 14 dígitos.").max(18, "CNPJ inválido"),
  condominiumZipCode: z.string().min(8, "CEP inválido."),
  condominiumStreet: z.string().min(3, "Rua é obrigatória."),
  condominiumNumber: z.string().min(1, "Número é obrigatório."),
  condominiumNeighborhood: z.string().min(2, "Bairro é obrigatório."),
  condominiumCity: z.string().min(2, "Cidade é obrigatória."),
  condominiumState: z.string().length(2, "UF deve ter 2 letras."),
  plan: z.string().optional()
})

type RegisterFormValues = z.infer<typeof registerSchema>

export default function RegisterSindicoPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [turnstileToken, setTurnstileToken] = useState<string>("")

  const {
    register,
    handleSubmit,
    trigger,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { 
      name: "", email: "", password: "", 
      condominiumName: "", condominiumCnpj: "", 
      condominiumZipCode: "", condominiumStreet: "", condominiumNumber: "",
      condominiumNeighborhood: "", condominiumCity: "", condominiumState: "",
      plan: "FREE"
    },
    mode: "onChange"
  })

  const selectedPlan = watch("plan")

  const nextStep = async (fieldsToValidate: (keyof RegisterFormValues)[]) => {
    const isValid = await trigger(fieldsToValidate)
    if (isValid) {
      setStep(prev => prev + 1)
    }
  }

  const prevStep = () => {
    setStep(prev => prev - 1)
  }

  async function onSubmit(data: RegisterFormValues) {
    if (!turnstileToken) {
      toast.error("Por favor, valide o captcha antes de prosseguir.")
      return
    }

    setIsLoading(true)
    try {
      const payload = { ...data, turnstileToken }
      const response = await fetch("http://localhost:8080/api/v1/auth/register-sindico", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        toast.success("Cadastro realizado com sucesso!")
        const loginData = await response.json()
        
        localStorage.setItem("condoflow_token", loginData.token)
        localStorage.setItem("condoflow_user", JSON.stringify(loginData.user))
        
        router.push("/sindico/condominio")
      } else {
        const errorData = await response.json().catch(() => null)
        const msg = errorData?.message || "Não foi possível realizar o cadastro."
        toast.error(msg)
        setIsLoading(false)
      }
    } catch (err) {
      console.error("Erro ao registrar:", err)
      toast.error("Erro de conexão com o servidor.")
      setIsLoading(false)
    }
  }

  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-1 lg:px-0 bg-slate-50 py-12">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[500px]">
        
        <div className="flex flex-col space-y-2 text-center items-center">
          <div className="bg-emerald-600 p-3 rounded-xl inline-flex mb-2 shadow-sm">
             <Building2 className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Crie a conta do seu Condomínio
          </h1>
          <p className="text-sm text-slate-500">
            Etapa {step} de 3
          </p>
          
          <div className="flex justify-center gap-2 mt-4 w-full px-8">
            <div className={`h-2 flex-1 rounded-full ${step >= 1 ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
            <div className={`h-2 flex-1 rounded-full ${step >= 2 ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
            <div className={`h-2 flex-1 rounded-full ${step >= 3 ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
          </div>
        </div>

        <Card className="shadow-lg border-slate-200">
          <CardContent className="grid gap-4 pt-6">
            <form onSubmit={handleSubmit(onSubmit)}>
              
              {/* ETAPA 1 */}
              {step === 1 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">Seus Dados (Síndico)</h3>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input id="name" placeholder="Seu nome" disabled={isLoading} {...register("name")} className={errors.name ? "border-red-500 focus-visible:ring-red-500" : "bg-slate-50"} />
                    {errors.name && <p className="text-xs text-red-500 font-medium">{errors.name.message}</p>}
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="email">E-mail Corporativo</Label>
                    <Input id="email" type="email" placeholder="sindico@condominio.com" disabled={isLoading} {...register("email")} className={errors.email ? "border-red-500 focus-visible:ring-red-500" : "bg-slate-50"} />
                    {errors.email && <p className="text-xs text-red-500 font-medium">{errors.email.message}</p>}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="password">Senha de Acesso</Label>
                    <Input id="password" type="password" disabled={isLoading} {...register("password")} className={errors.password ? "border-red-500 focus-visible:ring-red-500" : "bg-slate-50"} />
                    {errors.password && <p className="text-xs text-red-500 font-medium">{errors.password.message}</p>}
                  </div>

                  <Button type="button" onClick={() => nextStep(["name", "email", "password"])} className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11">
                    Próximo <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* ETAPA 2 */}
              {step === 2 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">Dados do Condomínio</h3>

                  <div className="grid gap-2">
                    <Label htmlFor="condominiumName">Nome do Condomínio</Label>
                    <Input id="condominiumName" placeholder="Ex: Condomínio Flores" disabled={isLoading} {...register("condominiumName")} className={errors.condominiumName ? "border-red-500 focus-visible:ring-red-500" : "bg-slate-50"} />
                    {errors.condominiumName && <p className="text-xs text-red-500 font-medium">{errors.condominiumName.message}</p>}
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="condominiumCnpj">CNPJ do Condomínio</Label>
                    <Input id="condominiumCnpj" placeholder="00.000.000/0001-00" disabled={isLoading} {...register("condominiumCnpj")} className={errors.condominiumCnpj ? "border-red-500 focus-visible:ring-red-500" : "bg-slate-50"} />
                    {errors.condominiumCnpj && <p className="text-xs text-red-500 font-medium">{errors.condominiumCnpj.message}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="condominiumZipCode">CEP</Label>
                      <Input id="condominiumZipCode" placeholder="00000-000" disabled={isLoading} {...register("condominiumZipCode")} className={errors.condominiumZipCode ? "border-red-500" : "bg-slate-50"} />
                      {errors.condominiumZipCode && <p className="text-xs text-red-500 font-medium">{errors.condominiumZipCode.message}</p>}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="condominiumCity">Cidade</Label>
                      <Input id="condominiumCity" placeholder="São Paulo" disabled={isLoading} {...register("condominiumCity")} className={errors.condominiumCity ? "border-red-500" : "bg-slate-50"} />
                      {errors.condominiumCity && <p className="text-xs text-red-500 font-medium">{errors.condominiumCity.message}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div className="grid gap-2 col-span-3">
                      <Label htmlFor="condominiumStreet">Rua</Label>
                      <Input id="condominiumStreet" placeholder="Avenida Principal" disabled={isLoading} {...register("condominiumStreet")} className={errors.condominiumStreet ? "border-red-500" : "bg-slate-50"} />
                      {errors.condominiumStreet && <p className="text-xs text-red-500 font-medium">{errors.condominiumStreet.message}</p>}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="condominiumNumber">Número</Label>
                      <Input id="condominiumNumber" placeholder="1000" disabled={isLoading} {...register("condominiumNumber")} className={errors.condominiumNumber ? "border-red-500" : "bg-slate-50"} />
                      {errors.condominiumNumber && <p className="text-xs text-red-500 font-medium">{errors.condominiumNumber.message}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div className="grid gap-2 col-span-3">
                      <Label htmlFor="condominiumNeighborhood">Bairro</Label>
                      <Input id="condominiumNeighborhood" placeholder="Centro" disabled={isLoading} {...register("condominiumNeighborhood")} className={errors.condominiumNeighborhood ? "border-red-500" : "bg-slate-50"} />
                      {errors.condominiumNeighborhood && <p className="text-xs text-red-500 font-medium">{errors.condominiumNeighborhood.message}</p>}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="condominiumState">UF</Label>
                      <Input id="condominiumState" placeholder="SP" disabled={isLoading} {...register("condominiumState")} className={errors.condominiumState ? "border-red-500" : "bg-slate-50"} maxLength={2} />
                      {errors.condominiumState && <p className="text-xs text-red-500 font-medium">{errors.condominiumState.message}</p>}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button type="button" variant="outline" onClick={prevStep} className="h-11 flex-1">
                      <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                    </Button>
                    <Button type="button" onClick={() => nextStep(["condominiumName", "condominiumCnpj", "condominiumZipCode", "condominiumStreet", "condominiumNumber", "condominiumNeighborhood", "condominiumCity", "condominiumState"])} className="h-11 flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                      Próximo <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* ETAPA 3 */}
              {step === 3 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">Escolha o Plano</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    {[
                      { id: "FREE", name: "Free durante 30 dias", desc: "Sem limite de unidades", price: "Grátis" },
                      { id: "MENSAL", name: "Mensal", desc: "Sem limite de unidades e moradores", price: "R$ 1,99/unid" },
                      { id: "ANUAL", name: "Anual", desc: "Plano anual com desconto", price: "R$ 1,87/unid" }
                    ].map(plan => (
                      <div 
                        key={plan.id} 
                        onClick={() => setValue("plan", plan.id)}
                        className={`flex flex-col justify-between p-4 rounded-xl cursor-pointer border-2 transition-all h-full ${selectedPlan === plan.id ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-100 hover:border-slate-200'}`}
                      >
                        <div className="flex justify-between items-start mb-3 gap-2">
                          <span className="font-bold text-slate-900 text-sm leading-tight">{plan.name}</span>
                          <div className={`w-5 h-5 shrink-0 rounded-full flex items-center justify-center ${selectedPlan === plan.id ? 'bg-emerald-500 text-white' : 'border border-slate-300'}`}>
                            {selectedPlan === plan.id && <Check className="w-3 h-3" />}
                          </div>
                        </div>
                        <div className="mt-auto">
                          <span className="text-[11px] text-slate-500 block mb-2 leading-tight">{plan.desc}</span>
                          <span className="font-bold text-emerald-600 text-sm block">{plan.price}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-center mt-6">
                    <Turnstile 
                      siteKey="1x00000000000000000000AA" 
                      onSuccess={(token) => setTurnstileToken(token)}
                    />
                  </div>

                  <div className="flex gap-2 mt-6 pt-4 border-t border-slate-100">
                    <Button type="button" variant="outline" onClick={prevStep} className="h-11 flex-1" disabled={isLoading}>
                      Voltar
                    </Button>
                    <Button type="submit" disabled={isLoading || !turnstileToken} className="h-11 flex-[2] bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                      {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                      {isLoading ? "Criando ambiente..." : "Cadastrar e Acessar"}
                    </Button>
                  </div>
                </div>
              )}

            </form>
          </CardContent>
          
          <CardFooter className="flex flex-col border-t border-slate-100 p-6 bg-slate-50/50 rounded-b-xl mt-4">
            <p className="text-sm text-center text-slate-600">
              Já possui uma conta?{" "}
              <Link href="/sindico/login" className="text-emerald-600 hover:text-emerald-700 font-bold hover:underline transition-all">
                Fazer login
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
