import { HttpStatusEnum } from "@/commons/enums/http";

export interface ResponseProps<T = unknown> {
  status: HttpStatusEnum;
  message: string;
  data: T | null;
  error?: string | null;
}

export interface ResponseInput<T = unknown> {
  message?: string;
  data?: T | null;
  error?: string | null;
}

export interface FetchOptions<TBody = unknown> extends Omit<RequestInit, "body"> {
  params?: Record<string, string>;
  body?: TBody;
}
