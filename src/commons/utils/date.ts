import { getCalendarDateInSaoPaulo } from "./format";

export { getCalendarDateInSaoPaulo };

/**
 * Calcula a quantidade de segundos restantes até as 23:59:59 do dia corrente
 * no fuso horário oficial de Brasília (America/Sao_Paulo).
 * Utilizado para definir o TTL (revalidate) de caches que devem virar à meia-noite.
 * 
 * @param referenceDate Data de referência (padrão: new Date())
 * @returns Número de segundos até a meia-noite (mínimo de 60s por segurança)
 */
export function getSecondsUntilMidnightSaoPaulo(referenceDate: Date = new Date()): number {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    hour12: false,
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  });

  const parts = formatter.formatToParts(referenceDate);
  const hourPart = parts.find((p) => p.type === "hour")?.value || "0";
  // Em algumas implementações do Intl, meia-noite (00) pode vir como 24 se hourCycle for h24
  let hour = Number(hourPart);
  if (hour === 24) hour = 0;

  const minute = Number(parts.find((p) => p.type === "minute")?.value || 0);
  const second = Number(parts.find((p) => p.type === "second")?.value || 0);

  const secondsPassedToday = hour * 3600 + minute * 60 + second;
  const totalSecondsInDay = 86400;
  const remaining = totalSecondsInDay - secondsPassedToday;

  return Math.max(60, remaining);
}

