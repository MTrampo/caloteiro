export type GreetingScenario = "overdue" | "due_soon" | "all_clear" | "empty"

const OVERDUE_PUNCHLINES = [
  "Hoje temos {overdue} promessas vencidas e {critical} sumidos esperando aquele 'bom dia, sumido'.",
  "Acorda, investigador! Tem gente postando foto no churrasco enquanto a sua parcela continua no vácuo.",
  "Dia de teste de paciência: {overdue} devedores já fingiram demência. Hora de mandar a cobrança matinal.",
  "O silêncio do caloteiro é ensurdecedor. Não deixe eles esquecerem que o boleto não perdoa.",
]

const DUE_SOON_PUNCHLINES = [
  "Atenção redobrada hoje: {dueSoon} cobranças vencem nas próximas horas. Fique com o app do banco engatilhado.",
  "Dia de teste de caráter: {dueSoon} figurinhas prometeram pagar hoje. Vamos ver se o Pix cai ou se inventam um enterro.",
  "Cobranças na boca do gol. Fique de olho no extrato antes de fechar o expediente.",
  "Vigilância ativa: tem promessa vencendo hoje. Mantenha a chave Pix copiada no bolso.",
]

const ALL_CLEAR_PUNCHLINES = [
  "Todo mundo pagou em dia? Estranho... confere o extrato pra ter certeza que você não está sonhando.",
  "Paz temporária na praça. Ninguém atrasado por enquanto, mas nunca baixe a guarda.",
  "Milagre histórico: lista limpa. Aproveite o sossego antes do próximo pedir dinheiro emprestado.",
  "Sua carteira está mais pontual que trem suíço hoje. Não se acostume.",
]

const EMPTY_PUNCHLINES = [
  "Nenhum caloteiro cadastrado. Ou você é abençoado ou finalmente aprendeu a dizer 'não'.",
  "Lista zerada! O segredo da tranquilidade financeira é nunca emprestar dinheiro a parentes.",
  "Zero pendências por aqui. Se alguém te pedir um Pix hoje, lembre-se desta tela vazia.",
]

export const CREDITOR_WISDOM_QUOTES = [
  {
    quote: "Quem tem vergonha de cobrar passa o fim de semana comendo pão com ovo enquanto o devedor faz Stories no open bar.",
    author: "Julius, Pai do Chris",
    subtext: "Lembre-se: o dinheiro era seu antes de sair da sua conta.",
  },
  {
    quote: "Se você emprestou R$ 50 e a pessoa nunca mais apareceu, você não tomou calote: você comprou sua paz com desconto.",
    author: "Sabedoria Popular do Investigador",
    subtext: "Mas se for mais que R$ 100, a gente vai atrás até o último centavo.",
  },
  {
    quote: "A pior mentira já contada na história da humanidade: 'te transfiro na próxima sexta-feira sem falta'.",
    author: "Manual do Caloteiro Clássico",
    subtext: "Sexta-feira chegou, e o Pix não.",
  },
  {
    quote: "Parente que pede dinheiro emprestado não é família, é teste de resistência emocional.",
    author: "Investigador Experiente",
    subtext: "Cobre com educação, mas cobre sem dó.",
  },
]

export function getTimeGreeting(): string {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return "Bom dia"
  if (hour >= 12 && hour < 18) return "Boa tarde"
  return "Boa noite"
}

export function generateDynamicPunchline(params: {
  overdueCount: number
  criticalCount: number
  dueSoonCount: number
  totalCount: number
}): string {
  const { overdueCount, criticalCount, dueSoonCount, totalCount } = params

  let pool: string[]
  if (totalCount === 0) {
    pool = EMPTY_PUNCHLINES
  } else if (overdueCount > 0) {
    pool = OVERDUE_PUNCHLINES
  } else if (dueSoonCount > 0) {
    pool = DUE_SOON_PUNCHLINES
  } else {
    pool = ALL_CLEAR_PUNCHLINES
  }

  // Sorteio determinístico por minuto ou aleatório
  const randomIndex = Math.floor(Math.random() * pool.length)
  const template = pool[randomIndex] ?? pool[0]

  return template
    .replace("{overdue}", String(overdueCount))
    .replace("{critical}", String(criticalCount))
    .replace("{dueSoon}", String(dueSoonCount))
}

export function getRandomWisdomQuote() {
  const index = Math.floor(Math.random() * CREDITOR_WISDOM_QUOTES.length)
  return CREDITOR_WISDOM_QUOTES[index] ?? CREDITOR_WISDOM_QUOTES[0]
}

