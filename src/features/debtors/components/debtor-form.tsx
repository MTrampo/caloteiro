"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm, Controller, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createDebtorSchema } from "@/commons/validations/debtor"
import { createDebtorAction } from "@/actions/debtors"
import {
  DebtorRelationshipEnum,
  DEBTOR_RELATIONSHIP_METADATA,
} from "../types"
import {
  FaUser,
  FaPhone,
  FaIdCard,
  FaLocationDot,
  FaKey,
  FaArrowLeft,
  FaCheck,
  FaSpinner,
} from "react-icons/fa6"
import {
  maskPhone,
  maskCpf,
  maskPixKey,
  unmaskDigits,
} from "@/commons/utils/masks"
import { formatProperName } from "@/commons/utils/format"

import { z } from "zod"

type DebtorFormInputs = z.infer<typeof createDebtorSchema>

const PIX_KEY_TYPES = [
  { value: "cpf", label: "CPF" },
  { value: "phone", label: "Celular" },
  { value: "email", label: "E-mail" },
  { value: "cnpj", label: "CNPJ" },
  { value: "random", label: "Chave Aleatória" },
]

export function DebtorForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnTo = searchParams.get("returnTo")
  const [isPending, setIsPending] = React.useState(false)

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<DebtorFormInputs>({
    resolver: zodResolver(createDebtorSchema),
    defaultValues: {
      name: "",
      nickname: "",
      relationship: DebtorRelationshipEnum.COLLEAGUE,
      phone: "",
      document: "",
      address: "",
      pix_key: "",
      pix_key_type: "cpf",
      notes: "",
    },
  })

  const currentPixKeyType = useWatch({ control, name: "pix_key_type" })

  const onSubmit = async (data: DebtorFormInputs) => {
    setIsPending(true)
    try {
      const payload: DebtorFormInputs = {
        ...data,
        name: formatProperName(data.name),
        nickname: data.nickname ? formatProperName(data.nickname) : data.nickname,
        phone: unmaskDigits(data.phone),
        document: data.document ? unmaskDigits(data.document) : data.document,
      }

      const res = await createDebtorAction(payload)
      if (res.success && res.data) {
        toast.success("Devedor cadastrado com sucesso!")
        const targetUrl = returnTo
          ? `${returnTo}?debtorId=${res.data.id}`
          : "/painel/devedores"
        router.push(targetUrl)
        return
      }

      if (res.code === "LIMIT_REACHED" || res.isLimitReached) {
        toast.warning(res.error || "Sua gruta atingiu a capacidade máxima de presas!", {
          action: {
            label: "Fazer Upgrade",
            onClick: () => router.push("/painel/assinatura"),
          },
          duration: 8000,
        })
      } else {
        toast.error(res.error || "Não foi possível cadastrar o devedor.")
      }
      setIsPending(false)
    } catch {
      toast.error("Erro inesperado ao cadastrar devedor.")
      setIsPending(false)
    }
  }

  // Opções do enum para o select
  const relationshipOptions = Object.values(DebtorRelationshipEnum)
    .filter((v): v is number => typeof v === "number")
    .map((value) => ({
      value,
      label: DEBTOR_RELATIONSHIP_METADATA[value as DebtorRelationshipEnum]?.label || "Outro",
      desc: DEBTOR_RELATIONSHIP_METADATA[value as DebtorRelationshipEnum]?.desc || "",
    }))

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-6">
        {/* Bloco 1: Identificação Básica */}
        <div className="space-y-4">
          <div className="space-y-1">
            <h3 className="font-heading text-sm font-bold text-white uppercase tracking-wider">
              Identificação
            </h3>
            <p className="text-xs font-mono text-zinc-400">
              Nome de registro e apelido que o devedor atende na rua.
            </p>
          </div>

          <FieldGroup className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nome Completo */}
            <Field>
              <FieldLabel>
                Nome Completo <span className="text-rose-400">*</span>
              </FieldLabel>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                  <FaUser className="size-3.5" />
                </div>
                <Input
                  type="text"
                  placeholder="Ex: Marcio Ramos"
                  disabled={isPending}
                  className="pl-9 bg-zinc-950/60 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500 font-mono text-xs sm:text-sm h-11"
                  {...register("name", {
                    onBlur: (e) => {
                      if (e.target.value) {
                        setValue("name", formatProperName(e.target.value))
                      }
                    },
                  })}
                />
              </div>
              <FieldError errors={errors.name ? [errors.name] : undefined} />
            </Field>

            {/* Apelido / Vulgo */}
            <Field>
              <FieldLabel>
                Apelido / Vulgo na Praça
              </FieldLabel>
              <Input
                type="text"
                placeholder="Ex: Marcio da Oficina, Cunhado"
                disabled={isPending}
                className="bg-zinc-950/60 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500 font-mono text-xs sm:text-sm h-11"
                {...register("nickname", {
                  onBlur: (e) => {
                    if (e.target.value) {
                      setValue("nickname", formatProperName(e.target.value))
                    }
                  },
                })}
              />
              <FieldError errors={errors.nickname ? [errors.nickname] : undefined} />
            </Field>
          </FieldGroup>

          {/* Relacionamento & Telefone */}
          <FieldGroup className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Telefone / WhatsApp */}
            <Field>
              <FieldLabel>
                WhatsApp com DDD <span className="text-rose-400">*</span>
              </FieldLabel>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                  <FaPhone className="size-3.5" />
                </div>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="text"
                      placeholder="Ex: (11) 98765-4321"
                      disabled={isPending}
                      value={field.value}
                      onChange={(e) => field.onChange(maskPhone(e.target.value))}
                      className="pl-9 bg-zinc-950/60 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500 font-mono text-xs sm:text-sm h-11"
                    />
                  )}
                />
              </div>
              <FieldError errors={errors.phone ? [errors.phone] : undefined} />
            </Field>

            {/* Grau de Relacionamento (Shadcn / Base UI Select) */}
            <Field>
              <FieldLabel>
                Grau de Relacionamento
              </FieldLabel>
              <Controller
                name="relationship"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(val) => {
                      if (val !== undefined && val !== null) {
                        field.onChange(Number(val))
                      }
                    }}
                    items={relationshipOptions}
                    disabled={isPending}
                  >
                    <SelectTrigger
                      size="lg"
                      className="bg-zinc-950/60 border-zinc-800 text-zinc-200 font-mono text-xs sm:text-sm h-11 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                    >
                      <SelectValue placeholder="Selecione o relacionamento" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border border-zinc-800 text-zinc-200">
                      {relationshipOptions.map((opt) => (
                        <SelectItem
                          key={opt.value}
                          value={opt.value}
                          className="hover:bg-zinc-800 focus:bg-zinc-800 text-xs sm:text-sm font-mono py-2 cursor-pointer"
                        >
                          <div className="flex flex-col">
                            <span className="text-white font-medium">{opt.label}</span>
                            {opt.desc && (
                              <span className="text-[11px] text-zinc-400">{opt.desc}</span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError errors={errors.relationship ? [errors.relationship] : undefined} />
            </Field>
          </FieldGroup>
        </div>

        {/* Bloco 2: Localização & Rastreio */}
        <div className="space-y-4">
          <div className="space-y-1">
            <h3 className="font-heading text-sm font-bold text-white uppercase tracking-wider">
              Localização &amp; Rastreio (Opcionais)
            </h3>
            <p className="text-xs font-mono text-zinc-400">
              Dados adicionais para não perder o suspeito de vista.
            </p>
          </div>

          <FieldGroup className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* CPF / Documento */}
            <Field>
              <FieldLabel>
                CPF do Devedor
              </FieldLabel>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                  <FaIdCard className="size-3.5" />
                </div>
                <Controller
                  name="document"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="text"
                      placeholder="Ex: 123.456.789-00"
                      disabled={isPending}
                      value={field.value}
                      onChange={(e) => field.onChange(maskCpf(e.target.value))}
                      className="pl-9 bg-zinc-950/60 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500 font-mono text-xs sm:text-sm h-11"
                    />
                  )}
                />
              </div>
              <FieldError errors={errors.document ? [errors.document] : undefined} />
            </Field>

            {/* Endereço */}
            <Field>
              <FieldLabel>
                Endereço / Referência
              </FieldLabel>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                  <FaLocationDot className="size-3.5" />
                </div>
                <Input
                  type="text"
                  placeholder="Rua, número e ponto de referência"
                  disabled={isPending}
                  className="pl-9 bg-zinc-950/60 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500 font-mono text-xs sm:text-sm h-11"
                  {...register("address")}
                />
              </div>
              <FieldError errors={errors.address ? [errors.address] : undefined} />
            </Field>
          </FieldGroup>
        </div>

        {/* Bloco 3: Dados de Pagamento & Pix */}
        <div className="space-y-4">
          <div className="space-y-1">
            <h3 className="font-heading text-sm font-bold text-white uppercase tracking-wider">
              Chave Pix (Opcional)
            </h3>
            <p className="text-xs font-mono text-zinc-400">
              Caso você precise conferir ou devolver troco/pagamento.
            </p>
          </div>

          <FieldGroup className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Tipo de Chave (Shadcn / Base UI Select) */}
            <Field className="sm:col-span-1">
              <FieldLabel>
                Tipo de Chave
              </FieldLabel>
              <Controller
                name="pix_key_type"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value || "cpf"}
                    onValueChange={(val) => {
                      if (val) field.onChange(val)
                    }}
                    items={PIX_KEY_TYPES}
                    disabled={isPending}
                  >
                    <SelectTrigger
                      size="lg"
                      className="bg-zinc-950/60 border-zinc-800 text-zinc-200 font-mono text-xs sm:text-sm h-11 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                    >
                      <SelectValue placeholder="Tipo de Chave" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border border-zinc-800 text-zinc-200">
                      {PIX_KEY_TYPES.map((type) => (
                        <SelectItem
                          key={type.value}
                          value={type.value}
                          className="hover:bg-zinc-800 focus:bg-zinc-800 text-xs sm:text-sm font-mono py-2 cursor-pointer"
                        >
                          <span className="text-white">{type.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>

            {/* Chave Pix */}
            <Field className="sm:col-span-2">
              <FieldLabel>
                Chave Pix
              </FieldLabel>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                  <FaKey className="size-3.5" />
                </div>
                <Controller
                  name="pix_key"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="text"
                      placeholder="Insira a chave Pix do devedor"
                      disabled={isPending}
                      value={field.value}
                      onChange={(e) =>
                        field.onChange(maskPixKey(e.target.value, currentPixKeyType))
                      }
                      className="pl-9 bg-zinc-950/60 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500 font-mono text-xs sm:text-sm h-11"
                    />
                  )}
                />
              </div>
              <FieldError errors={errors.pix_key ? [errors.pix_key] : undefined} />
            </Field>
          </FieldGroup>
        </div>

        {/* Bloco 4: Observações Gerais */}
        <div className="space-y-4">
          <Field>
            <FieldLabel className="flex items-center gap-1.5">
              <span>Observações &amp; Notas do Devedor</span>
            </FieldLabel>
            <Textarea
              placeholder="Ex: Prometeu pagar quando vender a moto velha dele. Disse que o salário cai dia 10."
              rows={3}
              disabled={isPending}
              className="bg-zinc-950/60 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500 font-mono text-xs sm:text-sm resize-none"
              {...register("notes")}
            />
            <FieldError errors={errors.notes ? [errors.notes] : undefined} />
          </Field>
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          size="lg"
          disabled={isPending}
          onClick={() => {
            if (returnTo) {
              router.push(returnTo)
            } else {
              router.push("/painel/devedores")
            }
          }}
          className="w-full sm:w-auto"
        >
          <FaArrowLeft className="size-3 mr-2" />
          <span>{returnTo ? "Voltar ao Fluxo" : "Voltar para Devedores"}</span>
        </Button>

        <Button
          type="submit"
          variant="success"
          size="lg"
          disabled={isPending}
          className="w-full sm:w-auto"
        >
          {isPending ? (
            <>
              <FaSpinner className="size-4 animate-spin" />
              <span>Cadastrando Devedor...</span>
            </>
          ) : (
            <>
              <span>Cadastrar Devedor</span>
              <FaCheck className="size-3.5" />
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
