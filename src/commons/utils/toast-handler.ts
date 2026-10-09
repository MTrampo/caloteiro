import { toast } from "sonner";
import { HttpStatusEnum } from "@/commons/enums/http";

export function loadingToast(message: string): string | number {
  return toast.loading(message);
}

export function updateToast(
  toastId: string | number,
  status: HttpStatusEnum,
  message?: string
) {
  if (status === HttpStatusEnum.Ok || status === HttpStatusEnum.Created) {
    toast.success(message || "Sucesso!", { id: toastId });
  } else if (status === HttpStatusEnum.Forbidden || status === HttpStatusEnum.BadRequest) {
    toast.warning(message || "Atenção!", { id: toastId });
  } else {
    toast.error(message || "Ocorreu um erro inesperado.", { id: toastId });
  }
}

