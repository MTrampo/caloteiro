export type GreetingScenario = "overdue" | "due_soon" | "all_clear" | "empty"

const OVERDUE_PUNCHLINES = [
  "Hoje temos {overdue} promessas vencidas e {critical} sumidos esperando aquele 'bom dia, sumido'.",
  "Acorda, Tubarão! Tem devedor postando foto no churrasco enquanto a sua parcela continua no vácuo.",
  "Dia de teste de paciência: {overdue} devedores já fingiram demência. Hora de mostrar os dentes e mandar a cobrança matinal.",
  "O silêncio do caloteiro é ensurdecedor. Não deixe eles esquecerem que tubarão não dorme de barriga vazia.",
  "Cheiro de calote na água: {overdue} parcelas atrasadas. Nadou, nadou e morreu na praia do 'te pago amanhã'.",
  "Tubarão paciente vira comida de peixe pequeno. Tem {critical} figurinhas achando que seu dinheiro foi doação.",
  "A barbatana já cortou a superfície: {overdue} promessas furadas. Hora de cobrar antes que o devedor troque de número.",
  "O Pix não cai do céu e o caloteiro não paga por telepatia. Mande o recado certeiro e recupere o que é seu.",
]

const DUE_SOON_PUNCHLINES = [
  "Atenção redobrada hoje: {dueSoon} cobranças vencem nas próximas horas. Fique com o app do banco engatilhado.",
  "Dia de teste de caráter: {dueSoon} figurinhas prometeram pagar hoje. Vamos ver se o Pix cai ou se inventam um velório do periquito.",
  "Cobranças na boca do gol. Tubarão na espreita: fique de olho no extrato antes de fechar o expediente.",
  "Vigilância ativa: tem promessa vencendo hoje. Mantenha a chave Pix copiada no bolso.",
  "A maré está subindo: {dueSoon} promessas prestes a vencer. Hora de circular o barco e lembrar quem é o dono da grana.",
  "Se o suspeito disser 'o Pix cai até às 23h59', prepare a cobrança das 00h01.",
]

const ALL_CLEAR_PUNCHLINES = [
  "Todo mundo pagou em dia? Estranho... confere o extrato pra ter certeza que você não está sonhando.",
  "Paz temporária no oceano. Ninguém atrasado por enquanto, mas tubarão que dorme vira sushi.",
  "Milagre histórico: águas calmas e lista limpa. Aproveite o sossego antes do próximo pedir dinheiro emprestado.",
  "Sua carteira está mais pontual que trem suíço hoje. Não se acostume: o calote sempre espreita.",
  "Cardume alinhado e dinheiro recuperado. Dia de celebrar e guardar o saldo a sete chaves.",
]

const EMPTY_PUNCHLINES = [
  "Nenhum caloteiro fichado. Ou você é abençoado ou finalmente aprendeu a dizer 'não'.",
  "Lista zerada! O segredo da tranquilidade financeira de um tubarão é nunca emprestar dinheiro a parentes.",
  "Zero pendências por aqui. Se alguém te pedir um Pix hoje, lembre-se desta tela vazia e fuja.",
  "Mar aberto e sem presas fichadas. Se bater a vontade de ser bonzinho, respire fundo e feche a carteira.",
]

export const CREDITOR_WISDOM_QUOTES = [
  {
    quote: "Quem tem vergonha de cobrar passa o fim de semana comendo pão com ovo enquanto o devedor faz Stories no open bar.",
    author: "Julius, Pai do Chris",
    subtext: "Lembre-se: o dinheiro era seu antes de sair da sua conta.",
  },
  {
    quote: "Se você emprestou R$ 50 e a pessoa nunca mais apareceu, você comprou sua paz com desconto. Mas se passou de R$ 100, tubarão vai atrás até o último centavo.",
    author: "Sabedoria Popular do Tubarão",
    subtext: "Tubarão sente o cheiro de Pix a léguas de distância.",
  },
  {
    quote: "A pior mentira já contada na história da humanidade: 'te transfiro na próxima sexta-feira sem falta'.",
    author: "Manual do Caloteiro Clássico",
    subtext: "Sexta-feira chegou, e o comprovante nunca veio.",
  },
  {
    quote: "Parente que pede dinheiro emprestado não é família, é teste de resistência emocional.",
    author: "Tubarão Experiente",
    subtext: "Cobre com educação, mas cobre sem dó.",
  },
  {
    quote: "Não existe trabalho ruim. O ruim é ter que trabalhar e ainda ter que cobrar quem pegou seu dinheiro emprestado.",
    author: "Seu Madruga, Mestre da Cobrança",
    subtext: "14 meses de aluguel ensinam qualquer um a ser paciente... até o limite.",
  },
  {
    quote: "O devedor sempre tem saldo para o chopp do sábado, mas na terça-feira a parcela 'ficou muito apertada'.",
    author: "Filosofia de Boteco",
    subtext: "Prioridades são prioridades.",
  },
  {
    quote: "Tubarão não pede desculpas por nadar no seu próprio oceano, e você não pede desculpas por cobrar o seu dinheiro.",
    author: "Código de Honra do Tubarão",
    subtext: "Quem deve não dorme enquanto o Tubarão estiver na caça.",
  },
  {
    quote: "Visualizou e não respondeu? O remédio para amnésia de devedor se chama chave Pix com juros acumulados.",
    author: "Estratégia de Caça",
    subtext: "Apareceu online, o boleto também está online.",
  },
]

export function getTimeGreeting(now = new Date()): string {
  const hour = now.getHours()
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

