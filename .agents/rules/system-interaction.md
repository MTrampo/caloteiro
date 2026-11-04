---
trigger: always_on
---

# 🦈 Diretrizes de Linguagem e UX: Projeto Caloteiro (MVP)

Este documento estabelece os princípios de comunicação e design de texto para o MVP do Caloteiro. O objetivo é transformar a dor de cabeça de cobrar dinheiro em uma experiência cômica, ácida e recompensadora para quem emprestou, tratando o credor como um verdadeiro **Tubarão** — o caçador implacável dos mares da cobrança, inspirado no humor clássico brasileiro, memes de seriados e desenhos ("ei, cadê meu dinheiro, seu safado?").

A interface deve ser afiada, carinhosa e divertida para o **Tubarão** (o dono da conta / credor), mantendo precisão cirúrgica nos números, datas e saldos.

---

## 1. Por que o Credor é um Tubarão?
O dono da conta é chamado de **Tubarão** como uma forma de reconhecimento, carinho e cumplicidade:
* **Ele não descansa:** Não vai parar até conseguir recuperar o dinheiro que emprestou de boa-fé.
* **Ele tem garra e determinação:** É o caçador implacável que sente o cheiro do Pix na água a quilômetros de distância.
* **Ele tem fases e espécies:** Começa tranquilo e paciente (Tubarão Lixa no plano manso), mas pode se tornar cirúrgico e letal (Tubarão Martelo, Baleia ou Megalodonte) conforme o caloteiro insiste em sumir. Em pontos da interface, podemos inclusive fazer referências bem-humoradas ao tipo de tubarão que ele é de acordo com o plano ativo.
* **Ele não pede desculpas por cobrar:** Tubarão não pede licença para nadar no seu próprio mar, e o credor não tem que ter vergonha de cobrar o que é legitimamente dele.

---

## 2. O Tom de Voz
A linguagem deve ser **cínica, bem-humorada, cúmplice e ácida**. O app conversa diretamente com o **Tubarão** como aquele parceiro sincero que avisa: *"eu avisei para não emprestar pro seu cunhado, mas agora vamos rastrear até o último centavo"*.

*   **Não use:** Termos corporativos frios ou distantes ("Credor", "Inadimplente em mora", "Contas a receber", "Gestão de carteira", "Liquidação de títulos").
*   **Use:** Termos da caça bem-humorada, gírias clássicas de cobrança brasileira, analogias de tubarão farejando o Pix, referências de memes ("devo não nego, pago quando puder", Seu Madruga cobrando o aluguel, Tio Patinhas cobrando cada centavo), ironia leve e celebração apoteótica quando o Pix finalmente cai na conta.

Traduzimos burocracia para a "linguagem do povo", dando personalidade e arrancando risadas do usuário.

---

## 3. Glossário Caloteiro (Linguagem Identitária)
O assistente deve obrigatoriamente substituir termos genéricos e bancários pelos termos da nossa comunidade:

*   **Usuário / Credor / Dono da Conta** ➔ Tubarão (O Caçador)
*   **Clientes / Devedores** ➔ Presas Marcadas / Caloteiros / Suspeitos / Devedores *(Proibido usar "figurinhas", "ficha" ou "fichado")*
    *   *Fundamentação Biológica (A Mordida Exploratória):* Tubarões não têm mãos; eles dão uma mordida exploratória (*test bite*) para sentir o alvo, deixando marcas profundas de dentes. No Caloteiro, todo devedor cadastrado é uma **presa marcada** até que o Pix seja pago e a marca cicatrize.
    *   *Regra de UX:* Use **"Presas Marcadas"** ou **"Presas"** em narrativas, limites de planos, cards de aviso, e-mails e empty states (ex: *"Capacidade da Gruta: 10 presas marcadas"*, *"Marcada na gruta desde..."*). Mantenha o termo técnico **"Devedor"** apenas nos campos de formulário e filtros operacionais (ex: *"Nome do devedor"*, *"CPF"*).
*   **A Casa do Tubarão / Território / Limites** ➔ A Gruta do Tubarão / O Tanque / O Covil
    *   *Regra de UX:* Use **"Gruta"** para representar o espaço do credor, sua capacidade de planos e onde ele guarda suas presas marcadas e dívidas (ex: *"na sua gruta"*, *"capacidade da sua gruta"*, *"marcada na gruta desde..."*, *"proteger sua gruta"*).
*   **Devedor em dia** ➔ Raro / Milagreiro
*   **Devedor em atraso** ➔ Caloteiro em Treinamento / Sumido / Peixe Ensaboado
*   **Contratos / Dívidas** ➔ Promessas / Pendências / O Golpe
*   **Valor a Receber (Total)** ➔ Dinheiro Voando / Na Pista
*   **Dar baixa na parcela** ➔ Pingou o Pix! / Milagre Feito / Arrancou Sangue
*   **Parcelas Restantes** ➔ Capítulos da Novela / Dias de Luta
*   **Radar** ➔ **PROIBIDO.** Substitua sempre por **Gruta** ou **Central** (ex: *"na sua gruta"*, *"presas na gruta"*).
*   **Ficha / Fichado** ➔ **PROIBIDO.** Substitua sempre por **Dívida** ou **Marcada na gruta** (ex: *"Marcada na gruta desde..."*, *"Nova dívida"*).

---

## 4. Princípios de Redação e Layout de Interface

### A. Botões de Ação Principais (CTAs) em Branco
* Os botões de ação e cadastro devem ser invariavelmente padronizados na cor **branca** (`bg-white hover:bg-zinc-200 text-zinc-950 font-bold rounded-xl`).
* As cores semânticas (verde, vermelho, amarelo) ficam reservadas exclusivamente para **feedbacks visuais e status** (confirmação/sucesso, perigo/apagar/excluir, alertas/atenção). Nunca use verde para botões comuns de ação.

### B. Estados Vazios (Empty States) Limpos e Sem Pontilhado
* **Proibição de Cards Pontilhados:** É estritamente proibido criar bordas pontilhadas (`border-dashed`) ou caixas de fundo mais claro (`bg-card/50`) para empty states.
* O estado vazio deve ser solto diretamente no fluxo da página (`py-16 sm:py-24 text-center space-y-4 max-w-md mx-auto`), com o texto explicativo e o botão de ação centralizados de forma limpa e minimalista.

### C. Feedbacks e Sucesso (Quando o dinheiro entra)
Ao registrar um pagamento, o sistema celebra como uma vitória apoteótica do predador:
*   *Exemplo de baixa de parcela:* "Milagre na praça! Caiu o Pix. Menos uma facada no seu peito."
*   *Exemplo de quitação total:* "CANCELEM O VELÓRIO! Ele pagou tudo. Caso encerrado, o Tubarão venceu de novo!"

### D. Alertas de Atraso e Estados Críticos
O sistema não esconde o jogo; ele debocha da audácia do devedor e incentiva o Tubarão a agir:
*   *Atraso leve (1 a 3 dias):* "Passou do prazo. O suspeito já fingiu demência ou você precisa mandar um 'bom dia, sumido'?"
*   *Atraso grave (regra de quebra/judicial):* "ALERTA VERMELHO! Esse aqui já atingiu o limite da cara de pau. Hora de mostrar os dentes ou acionar o fórum."

### E. Onboarding e Boas-vindas
*   *Texto base:* "Bem-vindo ao Caloteiro, Tubarão. O lugar onde a gente anota e rastreia cada centavo que prometeram devolver 'na próxima sexta'. Chega de bloco de notas: hora de colocar ordem nos seus devedores."

---

## 5. Instruções de Design de Texto e UX
1.  **Cúmplice do Tubarão:** Nunca faça o usuário se sentir culpado por cobrar. A culpa é de quem pegou o dinheiro e sumiu. Dê munição e confiança para ele nadar atrás do que é dele.
2.  **Precisão nos Dados:** A piada fica na casca e no texto; o cálculo é sério. Valor principal, juros, multas e datas devem ser exibidos com clareza matemática impecável.
3.  **Ação com 1 Clique:** Cobrar exige agilidade. Deixe botões de ação escancarados: "Copiar Chave Pix", "Marcar como Pago" ou "Mandar Recado".

---

## 6. Objetivo Final
O usuário deve abrir o app rindo dos textos, mas fechar o app com a certeza absoluta de que tem o controle total de cada centavo que está na rua. Cobrar vira uma caça divertida e eficiente onde a missão é zerar a lista de calotes.