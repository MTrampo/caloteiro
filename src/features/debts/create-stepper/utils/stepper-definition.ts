import { defineStepper } from "@stepperize/react";

export const { useStepper, steps } = defineStepper([
  {
    id: "target",
    title: "1. O Alvo",
    description: "Quem pegou seu dinheiro emprestado",
  },
  {
    id: "terms",
    title: "2. O Acordo",
    description: "Valores, juros, parcelas e prazos",
  },
  {
    id: "review",
    title: "3. Resumo & Confirmação",
    description: "Conferência das parcelas e ativação",
  },
]);

