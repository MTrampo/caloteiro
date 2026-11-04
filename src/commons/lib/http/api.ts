import { HttpStatusEnum } from "@/commons/enums/http";
import { FetchOptions, ResponseProps } from "@/commons/models/api";
import { APP_URL } from "@/commons/constants/env";

export async function api<TResponse = null, TBody = Record<string, unknown>>(
  endpoint: string,
  options: FetchOptions<TBody> = {}
): Promise<ResponseProps<TResponse>> {
  const { params, headers, body, ...rest } = options;

  const url = new URL(`${APP_URL}${endpoint}`);
  if (params) {
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
  }

  // Se houver body, serializa. Se não, fica undefined.
  const finalBody = body ? JSON.stringify(body) : undefined;

  try {
    const response = await fetch(url.toString(), {
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: finalBody,
      ...rest,
    });

    // O retorno sim, mantemos tipado para o seu Toast/UI brilhar
    const data: ResponseProps<TResponse> = await response.json();
    return data;

  } catch (err: unknown) {
    let errorMessage = "Erro de conexão com o servidor.";
    if (err instanceof Error) errorMessage = err.message;

    console.error("API Error:", err);

    return {
      status: HttpStatusEnum.InternalServerError,
      message: "Falha na comunicação.",
      data: null,
      error: errorMessage,
    };
  }
}