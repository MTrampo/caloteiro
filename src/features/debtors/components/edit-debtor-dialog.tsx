"use client";

import * as React from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateDebtorSchema } from "@/commons/validations/debtor";
import { updateDebtorAction } from "@/actions/debtors";
import type { DebtorItemFormatted } from "../types";
import {
  DebtorRelationshipEnum,
  DEBTOR_RELATIONSHIP_METADATA,
} from "../types";
import {
  maskPhone,
  maskCpf,
  maskPixKey,
  unmaskDigits,
} from "@/commons/utils/masks";
import { formatProperName } from "@/commons/utils/format";
import { FaUser, FaPhone, FaIdCard, FaLocationDot, FaKey, FaSpinner, FaCheck } from "react-icons/fa6";

type EditDebtorFormInputs = z.infer<typeof updateDebtorSchema>;

const PIX_KEY_TYPES = [
  { value: "cpf", label: "CPF" },
  { value: "phone", label: "Celular" },
  { value: "email", label: "E-mail" },
  { value: "cnpj", label: "CNPJ" },
  { value: "random", label: "Chave Aleatória" },
];

const RELATIONSHIP_OPTIONS = Object.values(DebtorRelationshipEnum)
  .filter((v): v is number => typeof v === "number")
  .map((value) => ({
    value,
    label: DEBTOR_RELATIONSHIP_METADATA[value as DebtorRelationshipEnum]?.label || "Outro",
    desc: DEBTOR_RELATIONSHIP_METADATA[value as DebtorRelationshipEnum]?.desc || "",
  }));

interface EditDebtorDialogProps {
  debtor: DebtorItemFormatted | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (updatedDebtor: DebtorItemFormatted) => void;
}

export function EditDebtorDialog({
  debtor,
  open,
  onOpenChange,
  onSuccess,
}: EditDebtorDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<EditDebtorFormInputs>({
    resolver: zodResolver(updateDebtorSchema),
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
  });

  const currentPixKeyType = useWatch({ control, name: "pix_key_type" });

  React.useEffect(() => {
    if (debtor && open) {
      reset({
        name: debtor.name,
        nickname: debtor.nickname || "",
        relationship: Number(debtor.relationship ?? DebtorRelationshipEnum.COLLEAGUE),
        phone: maskPhone(debtor.phone),
        document: debtor.document ? maskCpf(debtor.document) : "",
        address: debtor.address || "",
        pix_key: debtor.pix_key || "",
        pix_key_type: (debtor.pix_key_type as any) || "cpf",
        notes: debtor.notes || "",
      });
    }
  }, [debtor, open, reset]);

  if (!debtor) return null;

  const onSubmit = async (data: EditDebtorFormInputs) => {
    setIsSubmitting(true);
    try {
      const payload: EditDebtorFormInputs = {
        ...data,
        name: data.name ? formatProperName(data.name) : undefined,
        nickname: data.nickname?.trim() ? formatProperName(data.nickname) : "",
        phone: data.phone ? unmaskDigits(data.phone) : undefined,
        document: data.document ? unmaskDigits(data.document) : "",
        address: data.address?.trim() || "",
        pix_key: data.pix_key?.trim() || "",
        pix_key_type: data.pix_key_type || "",
        notes: data.notes?.trim() || "",
      };

      const res = await updateDebtorAction(debtor.id, payload);

      if (!res.success || !res.data) {
        toast.error(res.error || "Erro ao atualizar dados da presa.");
        return;
      }

      toast.success("Dados da presa atualizados na gruta com sucesso!");
      onSuccess?.(res.data);
      onOpenChange(false);
    } catch (err) {
      console.error("[EditDebtorDialog] Erro inesperado:", err);
      toast.error("Ocorreu um erro inesperado ao salvar.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-1.5rem)] sm:w-full max-w-lg bg-zinc-900 border-zinc-800 p-4 sm:p-6 space-y-4 max-h-[calc(100dvh-2.5rem)] overflow-y-auto">
        <DialogHeader className="text-left space-y-1">
          <DialogTitle className="font-heading text-lg sm:text-xl font-bold text-white">
            Editar Informações da Presa
          </DialogTitle>
          <DialogDescription className="text-xs font-mono text-zinc-400">
            Atualize dados de contato, chave Pix ou observações desta presa na sua gruta.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
          <FieldGroup className="space-y-3">
            {/* Nome Completo */}
            <Field>
              <FieldLabel className="text-xs font-mono font-bold text-zinc-300">
                Nome do Devedor *
              </FieldLabel>
              <div className="relative">
                <FaUser className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-zinc-500 pointer-events-none" />
                <Input
                  {...register("name")}
                  placeholder="Ex: Cleiton Lopes da Silva"
                  className="pl-9 bg-zinc-950/60 border-zinc-800 text-white font-mono text-xs sm:text-sm h-11 rounded-xl focus:border-zinc-500"
                />
              </div>
              {errors.name && <FieldError>{errors.name.message}</FieldError>}
            </Field>

            {/* Vulgo e Grau de Relacionamento */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field>
                <FieldLabel className="text-xs font-mono font-bold text-zinc-300">
                  Vulgo / Apelido
                </FieldLabel>
                <Input
                  {...register("nickname")}
                  placeholder="Ex: Tio, Primo Cleitinho"
                  className="bg-zinc-950/60 border-zinc-800 text-white font-mono text-xs sm:text-sm h-11 px-3 rounded-xl focus:border-zinc-500"
                />
                {errors.nickname && <FieldError>{errors.nickname.message}</FieldError>}
              </Field>

              <Field>
                <FieldLabel className="text-xs font-mono font-bold text-zinc-300">
                  Relacionamento
                </FieldLabel>
                <Controller
                  control={control}
                  name="relationship"
                  render={({ field }) => (
                    <Select
                      value={field.value !== undefined && field.value !== null ? Number(field.value) : DebtorRelationshipEnum.COLLEAGUE}
                      onValueChange={(val) => {
                        if (val !== undefined && val !== null) {
                          field.onChange(Number(val));
                        }
                      }}
                      items={RELATIONSHIP_OPTIONS}
                    >
                      <SelectTrigger
                        size="lg"
                        className="w-full h-11 bg-zinc-950/60 border-zinc-800 text-white font-mono text-xs sm:text-sm rounded-xl px-3 focus-visible:border-zinc-500 focus-visible:ring-0"
                      >
                        <SelectValue placeholder="Selecione o vínculo">
                          {(val) => {
                            if (val === undefined || val === null || val === "") return "Selecione o vínculo";
                            const num = Number(val);
                            const meta = DEBTOR_RELATIONSHIP_METADATA[num as DebtorRelationshipEnum];
                            return meta?.label || "Outro";
                          }}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200 font-mono text-xs sm:text-sm">
                        {RELATIONSHIP_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value} className="cursor-pointer py-2 px-3">
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
            </div>

            {/* Telefone e Documento (CPF) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field>
                <FieldLabel className="text-xs font-mono font-bold text-zinc-300">
                  WhatsApp / Celular *
                </FieldLabel>
                <div className="relative">
                  <FaPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-zinc-500 pointer-events-none" />
                  <Input
                    {...register("phone")}
                    onChange={(e) => setValue("phone", maskPhone(e.target.value))}
                    placeholder="(11) 98765-4321"
                    className="pl-9 bg-zinc-950/60 border-zinc-800 text-white font-mono text-xs sm:text-sm h-11 rounded-xl focus:border-zinc-500"
                  />
                </div>
                {errors.phone && <FieldError>{errors.phone.message}</FieldError>}
              </Field>

              <Field>
                <FieldLabel className="text-xs font-mono font-bold text-zinc-300">
                  CPF / Documento
                </FieldLabel>
                <div className="relative">
                  <FaIdCard className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-zinc-500 pointer-events-none" />
                  <Input
                    {...register("document")}
                    onChange={(e) => setValue("document", maskCpf(e.target.value))}
                    placeholder="000.000.000-00"
                    className="pl-9 bg-zinc-950/60 border-zinc-800 text-white font-mono text-xs sm:text-sm h-11 rounded-xl focus:border-zinc-500"
                  />
                </div>
                {errors.document && <FieldError>{errors.document.message}</FieldError>}
              </Field>
            </div>

            {/* Chave Pix e Tipo */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Field className="sm:col-span-1">
                <FieldLabel className="text-xs font-mono font-bold text-zinc-300">
                  Tipo de Pix
                </FieldLabel>
                <Controller
                  control={control}
                  name="pix_key_type"
                  render={({ field }) => (
                    <Select
                      value={field.value || "cpf"}
                      onValueChange={field.onChange}
                      items={PIX_KEY_TYPES}
                    >
                      <SelectTrigger
                        size="lg"
                        className="w-full h-11 bg-zinc-950/60 border-zinc-800 text-white font-mono text-xs sm:text-sm rounded-xl px-3 focus-visible:border-zinc-500 focus-visible:ring-0"
                      >
                        <SelectValue placeholder="Tipo">
                          {(val) => {
                            const found = PIX_KEY_TYPES.find((t) => t.value === val);
                            return found?.label || "CPF";
                          }}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200 font-mono text-xs sm:text-sm">
                        {PIX_KEY_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value} className="cursor-pointer py-1.5 px-3">
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>

              <Field className="sm:col-span-2">
                <FieldLabel className="text-xs font-mono font-bold text-zinc-300">
                  Chave Pix
                </FieldLabel>
                <div className="relative">
                  <FaKey className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-zinc-500 pointer-events-none" />
                  <Input
                    {...register("pix_key")}
                    onChange={(e) =>
                      setValue("pix_key", maskPixKey(e.target.value, currentPixKeyType || "cpf"))
                    }
                    placeholder="Chave para receber ou devolver"
                    className="pl-9 bg-zinc-950/60 border-zinc-800 text-white font-mono text-xs sm:text-sm h-11 rounded-xl focus:border-zinc-500"
                  />
                </div>
              </Field>
            </div>

            {/* Endereço */}
            <Field>
              <FieldLabel className="text-xs font-mono font-bold text-zinc-300">
                Endereço / Referência
              </FieldLabel>
              <div className="relative">
                <FaLocationDot className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-zinc-500 pointer-events-none" />
                <Input
                  {...register("address")}
                  placeholder="Ex: Rua das Flores, 123 - Próximo à padaria"
                  className="pl-9 bg-zinc-950/60 border-zinc-800 text-white font-mono text-xs sm:text-sm h-11 rounded-xl focus:border-zinc-500"
                />
              </div>
            </Field>

            {/* Observações */}
            <Field>
              <FieldLabel className="text-xs font-mono font-bold text-zinc-300">
                Observações do Tubarão
              </FieldLabel>
              <Textarea
                {...register("notes")}
                placeholder="Anotações confidenciais sobre a presa, histórico ou desculpas..."
                rows={3}
                className="bg-zinc-950/60 border-zinc-800 text-white font-mono text-xs rounded-xl focus:border-zinc-500"
              />
            </Field>
          </FieldGroup>

          {/* Rodapé Padronizado: Apenas Botão Principal em Branco alinhado à direita */}
          <div className="flex justify-end pt-3 border-t border-zinc-800">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto h-10 px-5 bg-white hover:bg-zinc-200 text-zinc-950 font-mono text-xs font-bold rounded-xl cursor-pointer justify-center"
            >
              {isSubmitting ? (
                <>
                  <FaSpinner className="size-3.5 animate-spin mr-1.5" />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <FaCheck className="size-3.5 mr-1.5" />
                  <span>Salvar Alterações</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
