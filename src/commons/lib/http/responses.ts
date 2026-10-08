import { HttpStatusEnum } from "@/commons/enums/http";
import { ResponseInput, ResponseProps } from "@/commons/models/api";

export const ApiResponse = {
  Ok: <T>(input: ResponseInput<T>): ResponseProps<T> => ({
    status: HttpStatusEnum.Ok,
    message: input.message || "Operação realizada com sucesso",
    data: input.data as T,
    error: input.error
  }),

  Created: <T>(input: ResponseInput<T>): ResponseProps<T> => ({
    status: HttpStatusEnum.Created,
    message: input.message,
    data: input.data as T,
  }),

  BadRequest: <T = null>(input: ResponseInput<T>): ResponseProps<T> => ({
    status: HttpStatusEnum.BadRequest,
    message: input.message,
    data: (input.data ?? null) as T,
    error: input.error
  }),

  Unauthorized: <T = null>(input: ResponseInput<T>): ResponseProps<T> => ({
    status: HttpStatusEnum.Unauthorized,
    message: input.message,
    data: (input.data ?? null) as T,
    error: input.error
  }),

  NotFound: <T = null>(input: ResponseInput<T>): ResponseProps<T> => ({
    status: HttpStatusEnum.NotFound,
    message: input.message,
    data: (input.data ?? null) as T,
    error: input.error
  }),

  Forbidden: <T = null>(input: ResponseInput<T>): ResponseProps<T> => ({
    status: HttpStatusEnum.Forbidden,
    message: input.message,
    data: (input.data ?? null) as T,
    error: input.error
  }),

  Conflict: <T = null>(input: ResponseInput<T>): ResponseProps<T> => ({
    status: HttpStatusEnum.Conflict,
    message: input.message,
    data: (input.data ?? null) as T,
    error: input.error
  }),

  InternalError: <T = null>(input: ResponseInput<T>): ResponseProps<T> => ({
    status: HttpStatusEnum.InternalServerError,
    message: input.message || "Erro interno no servidor",
    data: (input.data ?? null) as T,
    error: input.error
  }),
};