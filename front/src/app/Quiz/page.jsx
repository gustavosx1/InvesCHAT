'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../components/AuthProvider'

const ALL_QUESTIONS = [
  {
    id: 1,
    question: 'O que representa melhor a ideia de orçamento pessoal?',
    options: [
      { letter: 'A', text: 'Guardar apenas o dinheiro que sobra no fim do mês' },
      { letter: 'B', text: 'Planejar receitas e despesas antes de gastar' },
      { letter: 'C', text: 'Pagar todas as contas em dia e ignorar o restante' },
      { letter: 'D', text: 'Investir primeiro em ativos de alto risco' },
    ],
    correct: 'B',
  },
  {
    id: 2,
    question: 'Se você recebe R$ 4.000 por mês e gasta R$ 3.000, o que acontece com o restante?',
    options: [
      { letter: 'A', text: 'Ele deve ser usado para pagar juros e dívidas' },
      { letter: 'B', text: 'Ele pode ser alocado em poupança, investimentos ou reserva' },
      { letter: 'C', text: 'Ele não existe, porque todo salário deve ser gasto' },
      { letter: 'D', text: 'Ele precisa ser doado para evitar endividamento' },
    ],
    correct: 'B',
  },
  {
    id: 3,
    question: 'Qual é a principal função de uma reserva de emergência?',
    options: [
      { letter: 'A', text: 'Cobrir gasto inesperado sem precisar recorrer a crédito' },
      { letter: 'B', text: 'Aumentar o valor da dívida do cartão' },
      { letter: 'C', text: 'Substituir o investimento em longo prazo' },
      { letter: 'D', text: 'Garanta lucro anual garantido' },
    ],
    correct: 'A',
  },
  {
    id: 4,
    question: 'Se a inflação for de 5% ao ano, o que isso significa?',
    options: [
      { letter: 'A', text: 'Os preços aumentam, reduzindo o poder de compra' },
      { letter: 'B', text: 'O rendimento da poupança cresce automaticamente' },
      { letter: 'C', text: 'Todo investimento fica livre de impostos' },
      { letter: 'D', text: 'A renda da família sempre dobra' },
    ],
    correct: 'A',
  },
  {
    id: 5,
    question: 'Qual é a diferença entre juros nominais e reais?',
    options: [
      { letter: 'A', text: 'Juros reais incluem imposto, nominais não' },
      { letter: 'B', text: 'Juros nominais são o valor bruto e os reais descontam a inflação' },
      { letter: 'C', text: 'Juros nominais são usados em cartão e reais em conta corrente' },
      { letter: 'D', text: 'Não existe diferença prática' },
    ],
    correct: 'B',
  },
  {
    id: 6,
    question: 'O que é juros compostos?',
    options: [
      { letter: 'A', text: 'Juros calculados apenas sobre o valor inicial' },
      { letter: 'B', text: 'Juros calculados sobre o valor inicial mais os juros acumulados' },
      { letter: 'C', text: 'Juros de empréstimos do cartão' },
      { letter: 'D', text: 'Juros cobrados apenas em investimentos de renda fixa' },
    ],
    correct: 'B',
  },
  {
    id: 7,
    question: 'Qual é o melhor uso de um cartão de crédito?',
    options: [
      { letter: 'A', text: 'Usar sem controle e pagar o mínimo' },
      { letter: 'B', text: 'Usar para pagar contas recorrentes e quitar tudo no vencimento' },
      { letter: 'C', text: 'Usar apenas para compras em dólar' },
      { letter: 'D', text: 'Usar para financiar viagens sem olhar o total' },
    ],
    correct: 'B',
  },
  {
    id: 8,
    question: 'Se uma dívida tem juros altos, o que normalmente é mais eficiente?',
    options: [
      { letter: 'A', text: 'Ignorar e pagar só no vencimento' },
      { letter: 'B', text: 'Priorizar o pagamento dessa dívida com maior custo' },
      { letter: 'C', text: 'Usar mais crédito para quitar o que já deve' },
      { letter: 'D', text: 'Transferir tudo para cheque especial' },
    ],
    correct: 'B',
  },
  {
    id: 9,
    question: 'O que significa diversificar investimentos?',
    options: [
      { letter: 'A', text: 'Colocar todo o dinheiro em um único ativo' },
      { letter: 'B', text: 'Distribuir recursos entre diferentes tipos de ativos e riscos' },
      { letter: 'C', text: 'Comprar apenas títulos públicos' },
      { letter: 'D', text: 'Investir só em moedas estrangeiras' },
    ],
    correct: 'B',
  },
  {
    id: 10,
    question: 'Qual afirmativa sobre risco e retorno está correta?',
    options: [
      { letter: 'A', text: 'Risco sempre significa garantia de ganho' },
      { letter: 'B', text: 'Em geral, maior potencial de retorno vem acompanhado de maior risco' },
      { letter: 'C', text: 'Renda fixa é sempre mais arriscada que ações' },
      { letter: 'D', text: 'Retorno e risco não têm relação' },
    ],
    correct: 'B',
  },
  {
    id: 11,
    question: 'O que é a taxa de juros de um empréstimo?',
    options: [
      { letter: 'A', text: 'O valor total pago ao final do contrato' },
      { letter: 'B', text: 'O custo do dinheiro tomado emprestado ao longo do tempo' },
      { letter: 'C', text: 'A multa por atraso' },
      { letter: 'D', text: 'A taxa de imposto da operação' },
    ],
    correct: 'B',
  },
  {
    id: 12,
    question: 'Qual é a vantagem de um investimento em renda fixa em comparação com renda variável?',
    options: [
      { letter: 'A', text: 'Previsibilidade maior de fluxo e retorno' },
      { letter: 'B', text: 'Não exige análise do mercado' },
      { letter: 'C', text: 'Sempre rende acima da inflação' },
      { letter: 'D', text: 'Não pode perder valor' },
    ],
    correct: 'A',
  },
  {
    id: 13,
    question: 'O que normalmente aumenta o custo total de um financiamento?',
    options: [
      { letter: 'A', text: 'Prazo menor e taxa menor' },
      { letter: 'B', text: 'Prazo maior e juros mais altos' },
      { letter: 'C', text: 'Pagamento à vista' },
      { letter: 'D', text: 'Aumentar a entrada' },
    ],
    correct: 'B',
  },
  {
    id: 14,
    question: 'Qual é a função principal de um imposto?',
    options: [
      { letter: 'A', text: 'Diminuir os preços dos produtos' },
      { letter: 'B', text: 'Financear serviços públicos e o Estado' },
      { letter: 'C', text: 'Aumentar o rendimento dos investimentos' },
      { letter: 'D', text: 'Eliminar a inflação' },
    ],
    correct: 'B',
  },
  {
    id: 15,
    question: 'O que é o patrimônio líquido?',
    options: [
      { letter: 'A', text: 'O dinheiro pago em salários' },
      { letter: 'B', text: 'A diferença entre ativos e passivos' },
      { letter: 'C', text: 'O total de receitas mensais' },
      { letter: 'D', text: 'O valor de todas as dívidas' },
    ],
    correct: 'B',
  },
  {
    id: 16,
    question: 'Qual a melhor prática ao receber um aumento de salário?',
    options: [
      { letter: 'A', text: 'Aumentar todos os gastos no mesmo ritmo' },
      { letter: 'B', text: 'Revisar a folha e direcionar parte para metas e investimentos' },
      { letter: 'C', text: 'Comprar imediatamente itens de luxo' },
      { letter: 'D', text: 'Aumentar o crédito rotativo' },
    ],
    correct: 'B',
  },
  {
    id: 17,
    question: 'O que é um fundo de investimento?',
    options: [
      { letter: 'A', text: 'Um banco de depósito' },
      { letter: 'B', text: 'Um conjunto de recursos de vários investidores aplicados em ativos' },
      { letter: 'C', text: 'Uma conta de salário' },
      { letter: 'D', text: 'Um seguro de vida' },
    ],
    correct: 'B',
  },
  {
    id: 18,
    question: 'Qual é a principal diferença entre ações e títulos de renda fixa?',
    options: [
      { letter: 'A', text: 'Ações representam participação societária e renda fixa representa dívida ou remuneração contratada' },
      { letter: 'B', text: 'Ações não sofrem variação' },
      { letter: 'C', text: 'Renda fixa sempre é mais arriscada' },
      { letter: 'D', text: 'Ações são sempre isentas de impostos' },
    ],
    correct: 'A',
  },
  {
    id: 19,
    question: 'O que é o CDI?',
    options: [
      { letter: 'A', text: 'Uma taxa de juros usada como referência para muitos investimentos' },
      { letter: 'B', text: 'O imposto sobre renda do país' },
      { letter: 'C', text: 'A inflação do setor imobiliário' },
      { letter: 'D', text: 'Uma taxa de câmbio' },
    ],
    correct: 'A',
  },
  {
    id: 20,
    question: 'Qual é o efeito de taxas e tarifas sobre o investimento no longo prazo?',
    options: [
      { letter: 'A', text: 'Não impactam o resultado final' },
      { letter: 'B', text: 'Podem reduzir muito a rentabilidade acumulada ao longo do tempo' },
      { letter: 'C', text: 'Só importam para contas correntes' },
      { letter: 'D', text: 'Aumentam sempre o retorno líquido' },
    ],
    correct: 'B',
  },
  {
    id: 21,
    question: 'Qual é a melhor forma de lidar com uma despesa inesperada?',
    options: [
      { letter: 'A', text: 'Pedir dinheiro emprestado no cartão sem planejar' },
      { letter: 'B', text: 'Usar reserva de emergência ou ajustar o orçamento' },
      { letter: 'C', text: 'Ignorar até o próximo mês' },
      { letter: 'D', text: 'Vender todos os investimentos imediatamente' },
    ],
    correct: 'B',
  },
  {
    id: 22,
    question: 'Qual é a principal finalidade de contratar um seguro?',
    options: [
      { letter: 'A', text: 'Aumentar a renda mensal' },
      { letter: 'B', text: 'Transferir parte do risco financeiro para a seguradora' },
      { letter: 'C', text: 'Evitar qualquer tipo de investimento' },
      { letter: 'D', text: 'Eliminar a necessidade de poupar' },
    ],
    correct: 'B',
  },
  {
    id: 23,
    question: 'Se uma aplicação rende 8% ao ano e a inflação for 5%, qual é a tendência da rentabilidade real?',
    options: [
      { letter: 'A', text: 'A rentabilidade real será menor do que 8%' },
      { letter: 'B', text: 'A rentabilidade real será de 13%' },
      { letter: 'C', text: 'Será sempre zero' },
      { letter: 'D', text: 'Não depende da inflação' },
    ],
    correct: 'A',
  },
  {
    id: 24,
    question: 'O que é um planejamento de aposentadoria?',
    options: [
      { letter: 'A', text: 'Guardar dinheiro em espécie para uma data futura e definir metas' },
      { letter: 'B', text: 'Comprar imóveis sem calcular o futuro' },
      { letter: 'C', text: 'Depender exclusivamente da renda do trabalho' },
      { letter: 'D', text: 'Poupar apenas ao fim de cada ano' },
    ],
    correct: 'A',
  },
  {
    id: 25,
    question: 'Qual é a vantagem de um investimento com disciplina de aportes mensais?',
    options: [
      { letter: 'A', text: 'Aumenta o risco do investimento sem benefício' },
      { letter: 'B', text: 'Ajuda a construir patrimônio de forma gradual e consistente' },
      { letter: 'C', text: 'Elimina a necessidade de revisar a estratégia' },
      { letter: 'D', text: 'Garantia de ganho em todos os meses' },
    ],
    correct: 'B',
  },
  {
    id: 26,
    question: 'O que é a capacidade de pagamento de uma pessoa?',
    options: [
      { letter: 'A', text: 'O quanto ela pode gastar sem comprometer suas finanças' },
      { letter: 'B', text: 'O valor total de suas dívidas' },
      { letter: 'C', text: 'Seu salário líquido do mês atual' },
      { letter: 'D', text: 'A sua renda bruta anual' },
    ],
    correct: 'A',
  },
  {
    id: 27,
    question: 'Qual é a consequência de não pagar contas em dia?',
    options: [
      { letter: 'A', text: 'Só aumenta a pontuação de crédito' },
      { letter: 'B', text: 'Pode gerar juros, multas e impacto no histórico financeiro' },
      { letter: 'C', text: 'Não influencia em nada' },
      { letter: 'D', text: 'Reduz automaticamente a renda mensal' },
    ],
    correct: 'B',
  },
  {
    id: 28,
    question: 'O que é patrimônio pessoal?',
    options: [
      { letter: 'A', text: 'O conjunto de bens e direitos menos dívidas' },
      { letter: 'B', text: 'O valor da própria renda mensal' },
      { letter: 'C', text: 'A soma apenas de investimentos em ações' },
      { letter: 'D', text: 'A quantia total é sempre igual ao salário' },
    ],
    correct: 'A',
  },
  {
    id: 29,
    question: 'Qual é a melhor estratégia para evitar endividamento?',
    options: [
      { letter: 'A', text: 'Aumentar o uso de crédito rotativo' },
      { letter: 'B', text: 'Controlar gastos, manter reserva e evitar compras além da renda' },
      { letter: 'C', text: 'Pedir empréstimos para pagar contas fixas' },
      { letter: 'D', text: 'Não acompanhar o saldo da conta' },
    ],
    correct: 'B',
  },
  {
    id: 30,
    question: 'Qual é a melhor interpretação de “rentabilidade real”?',
    options: [
      { letter: 'A', text: 'O ganho líquido depois de considerar inflação e custos' },
      { letter: 'B', text: 'O valor bruto do investimento sem descontar nada' },
      { letter: 'C', text: 'A taxa de juros do cartão de crédito' },
      { letter: 'D', text: 'A rentabilidade do dinheiro em espécie' },
    ],
    correct: 'A',
  },
  {
    id: 31,
    question: 'O que é o salário líquido?',
    options: [
      { letter: 'A', text: 'O valor recebido após descontos legais e tributos' },
      { letter: 'B', text: 'O salário bruto antes de qualquer desconto' },
      { letter: 'C', text: 'A quantia gasta com necessidades mensais' },
      { letter: 'D', text: 'A renda proveniente de investimentos' },
    ],
    correct: 'A',
  },
  {
    id: 32,
    question: 'Qual é a função de um planejamento financeiro individual?',
    options: [
      { letter: 'A', text: 'Apenas acompanhar a conta bancária' },
      { letter: 'B', text: 'Organizar receitas, despesas, objetivos e riscos' },
      { letter: 'C', text: 'Aumentar a carga tributária' },
      { letter: 'D', text: 'Eliminar totalmente qualquer gasto' },
    ],
    correct: 'B',
  },
  {
    id: 33,
    question: 'Qual melhor definição de análise de custo-benefício?',
    options: [
      { letter: 'A', text: 'Comparar o que você ganha e o que você paga para decidir se vale a compra' },
      { letter: 'B', text: 'Comprar primeiro e só depois analisar o preço' },
      { letter: 'C', text: 'Pagar qualquer valor para adquirir um produto' },
      { letter: 'D', text: 'Comparar apenas o preço sem olhar qualidade' },
    ],
    correct: 'A',
  },
  {
    id: 34,
    question: 'O que é uma meta financeira?',
    options: [
      { letter: 'A', text: 'Um objetivo mensurável que exige planejamento para ser alcançado' },
      { letter: 'B', text: 'Qualquer desejo sem prazo' },
      { letter: 'C', text: 'Uma dívida que já venceu' },
      { letter: 'D', text: 'Uma compra feita por impulso' },
    ],
    correct: 'A',
  },
  {
    id: 35,
    question: 'Qual é a relação entre renda e gastos ao longo do tempo?',
    options: [
      { letter: 'A', text: 'Se os gastos aumentarem mais que a renda, a saúde financeira piora' },
      { letter: 'B', text: 'Gastos sempre devem ser maiores que a renda' },
      { letter: 'C', text: 'A renda não afeta a qualidade de vida' },
      { letter: 'D', text: 'Tudo se resolve apenas com empréstimos' },
    ],
    correct: 'A',
  },
  {
    id: 36,
    question: 'Qual é o impacto de juros altos em uma dívida de longo prazo?',
    options: [
      { letter: 'A', text: 'Ele aumenta muito o valor total pago' },
      { letter: 'B', text: 'Ele reduziu o total de despesas' },
      { letter: 'C', text: 'Ele nunca afeta o saldo devedor' },
      { letter: 'D', text: 'Ele reduz a necessidade de pagamento' },
    ],
    correct: 'A',
  },
  {
    id: 37,
    question: 'O que é o patrimônio líquido de uma empresa?',
    options: [
      { letter: 'A', text: 'Carteira de clientes e fornecedores' },
      { letter: 'B', text: 'Diferença entre ativos e passivos' },
      { letter: 'C', text: 'Receita anual da empresa' },
      { letter: 'D', text: 'Valor de mercado de suas ações' },
    ],
    correct: 'B',
  },
  {
    id: 38,
    question: 'Qual é o efeito da demora para pagar uma conta?',
    options: [
      { letter: 'A', text: 'Gera rendimento automático no valor' },
      { letter: 'B', text: 'Pode gerar juros, multa e piora no histórico financeiro' },
      { letter: 'C', text: 'Melhora o score da pessoa' },
      { letter: 'D', text: 'Não muda em nada o orçamento' },
    ],
    correct: 'B',
  },
  {
    id: 39,
    question: 'O que é um fluxo de caixa?',
    options: [
      { letter: 'A', text: 'A movimentação de entrada e saída de dinheiro em um período' },
      { letter: 'B', text: 'O total de créditos de um cartão' },
      { letter: 'C', text: 'O valor bruto de um salário' },
      { letter: 'D', text: 'A dívida acumulada em um mês' },
    ],
    correct: 'A',
  },
  {
    id: 40,
    question: 'Qual é o principal objetivo do uso de uma planilha de orçamento?',
    options: [
      { letter: 'A', text: 'Controlar e visualizar receitas e despesas' },
      { letter: 'B', text: 'Aumentar a quantidade de contas a pagar' },
      { letter: 'C', text: 'Evitar qualquer gasto final do mês' },
      { letter: 'D', text: 'Substituir a necessidade de poupança' },
    ],
    correct: 'A',
  },
  {
    id: 41,
    question: 'Qual a melhor definição de educação financeira?',
    options: [
      { letter: 'A', text: 'Conjunto de conhecimentos e hábitos para tomar decisões financeiras melhores' },
      { letter: 'B', text: 'Somente o uso de aplicativos de investimento' },
      { letter: 'C', text: 'Guardar dinheiro em casa' },
      { letter: 'D', text: 'Comprar ativos sem analisar' },
    ],
    correct: 'A',
  },
  {
    id: 42,
    question: 'O que é o mercado financeiro?',
    options: [
      { letter: 'A', text: 'Conjunto de instituições e ativos que permitem movimentação de dinheiro e investimentos' },
      { letter: 'B', text: 'Somente a compra de imóveis' },
      { letter: 'C', text: 'O setor de varejo local' },
      { letter: 'D', text: 'O mercado de trabalho formal' },
    ],
    correct: 'A',
  },
  {
    id: 43,
    question: 'Qual é a diferença entre uma compra planejada e uma compra por impulso?',
    options: [
      { letter: 'A', text: 'Compra planejada considera orçamento e necessidade; impulso ignora planejamento' },
      { letter: 'B', text: 'Compra por impulso sempre tem juros menores' },
      { letter: 'C', text: 'São a mesma coisa' },
      { letter: 'D', text: 'Compra planejada é sempre mais cara' },
    ],
    correct: 'A',
  },
  {
    id: 44,
    question: 'O que é um ativo financeiro?',
    options: [
      { letter: 'A', text: 'Qualquer bem ou direito que tenha potencial de valor e remuneração' },
      { letter: 'B', text: 'Somente um imóvel' },
      { letter: 'C', text: 'A conta de luz' },
      { letter: 'D', text: 'A dívida do cartão' },
    ],
    correct: 'A',
  },
  {
    id: 45,
    question: 'Qual efeito do aumento da taxa de juros na economia?',
    options: [
      { letter: 'A', text: 'Pode reduzir crédito e aquecer menos a atividade econômica' },
      { letter: 'B', text: 'Sempre aumenta a inflação' },
      { letter: 'C', text: 'O que não altera nada' },
      { letter: 'D', text: 'Só impacta os bancos centrais' },
    ],
    correct: 'A',
  },
  {
    id: 46,
    question: 'Qual é o papel do Tesouro Direto?',
    options: [
      { letter: 'A', text: 'Permitir investimento em títulos públicos por pessoas físicas' },
      { letter: 'B', text: 'Oferecer empréstimos para empresas' },
      { letter: 'C', text: 'Controlar preço de gasolina' },
      { letter: 'D', text: 'Substituir fundos de investimento' },
    ],
    correct: 'A',
  },
  {
    id: 47,
    question: 'O que é a relação entre poupança e inflação?',
    options: [
      { letter: 'A', text: 'Quando a inflação supera a rentabilidade, o dinheiro perde poder de compra' },
      { letter: 'B', text: 'A poupança sempre supera a inflação' },
      { letter: 'C', text: 'Inflação não afeta dinheiro guardado' },
      { letter: 'D', text: 'A poupança é um investimento de alto risco' },
    ],
    correct: 'A',
  },
  {
    id: 48,
    question: 'Qual é o objetivo do uso de metas de curto, médio e longo prazo?',
    options: [
      { letter: 'A', text: 'Organizar prioridades e criar disciplina financeira' },
      { letter: 'B', text: 'Aumentar despesas sem controle' },
      { letter: 'C', text: 'Criar endividamento para atingir metas' },
      { letter: 'D', text: 'Ignorar impactos futuros' },
    ],
    correct: 'A',
  },
  {
    id: 49,
    question: 'O que é um passivo financeiro?',
    options: [
      { letter: 'A', text: 'Uma obrigação ou dívida que exige pagamento no futuro' },
      { letter: 'B', text: 'Um investimento de alta rentabilidade' },
      { letter: 'C', text: 'Um recurso que sempre gera caixa' },
      { letter: 'D', text: 'Um imposto sobre patrimônio' },
    ],
    correct: 'A',
  },
  {
    id: 50,
    question: 'Qual é a melhor definição de patrimônio?',
    options: [
      { letter: 'A', text: 'Conjunto de bens, direitos e investimentos menos dívidas' },
      { letter: 'B', text: 'Apenas, e somente, o salário recebido' },
      { letter: 'C', text: 'O valor total de despesas fixas' },
      { letter: 'D', text: 'Tudo aquilo que é comprado por impulso' },
    ],
    correct: 'A',
  },
  {
    id: 51,
    question: 'Qual é a importância de manter registro das receitas e despesas?',
    options: [
      { letter: 'A', text: 'Ajuda a identificar hábitos, reduzir desperdícios e planejar metas' },
      { letter: 'B', text: 'É obrigatório somente para grandes empresas' },
      { letter: 'C', text: 'Não muda em nada o planejamento' },
      { letter: 'D', text: 'Só serve para quem usa cartão de crédito' },
    ],
    correct: 'A',
  },
  {
    id: 52,
    question: 'Qual é a vantagem de um planejamento de emergência para a família?',
    options: [
      { letter: 'A', text: 'Reduz a dependência de crédito e protege o orçamento' },
      { letter: 'B', text: 'Aumenta imediatamente os gastos fixos' },
      { letter: 'C', text: 'Substitui os investimentos de longo prazo' },
      { letter: 'D', text: 'Cria automaticamente lucro' },
    ],
    correct: 'A',
  },
  {
    id: 53,
    question: 'O que é uma taxa de juros fixa?',
    options: [
      { letter: 'A', text: 'Uma taxa que permanece constante durante o período' },
      { letter: 'B', text: 'Uma taxa que muda a cada dia' },
      { letter: 'C', text: 'Uma taxa de imposto' },
      { letter: 'D', text: 'Uma taxa sem relação com a dívida' },
    ],
    correct: 'A',
  },
  {
    id: 54,
    question: 'Qual é a melhor prática antes de contratar qualquer financiamento?',
    options: [
      { letter: 'A', text: 'Comparar custo total, prazo, taxa e impacto no orçamento' },
      { letter: 'B', text: 'Ficar com a oferta mais cara' },
      { letter: 'C', text: 'Pedir o maior valor possível' },
      { letter: 'D', text: 'Assumir sem analisar a renda' },
    ],
    correct: 'A',
  },
  {
    id: 55,
    question: 'O que representa um índice de inflação?',
    options: [
      { letter: 'A', text: 'Uma medida do aumento geral de preços em um período' },
      { letter: 'B', text: 'A taxa de juros do cartão de crédito' },
      { letter: 'C', text: 'O valor do salário mínimo' },
      { letter: 'D', text: 'A margem de lucro de uma empresa' },
    ],
    correct: 'A',
  },
  {
    id: 56,
    question: 'Qual é a importância de aproveitar juros compostos no longo prazo?',
    options: [
      { letter: 'A', text: 'Permite que pequenos aportes cresçam de forma mais expressiva ao longo do tempo' },
      { letter: 'B', text: 'Só funciona em dívida' },
      { letter: 'C', text: 'Não tem efeito prático' },
      { letter: 'D', text: 'Garante lucros mensais fixos' },
    ],
    correct: 'A',
  },
  {
    id: 57,
    question: 'O que é o ciclo de vida financeiro de uma pessoa?',
    options: [
      { letter: 'A', text: 'A forma como renda, despesas e objetivos mudam ao longo da vida' },
      { letter: 'B', text: 'A idade em que se compra um carro' },
      { letter: 'C', text: 'A sequência de meses sem pagar dívidas' },
      { letter: 'D', text: 'A renda bruta anual' },
    ],
    correct: 'A',
  },
  {
    id: 58,
    question: 'Quando uma pessoa está overindebtada?',
    options: [
      { letter: 'A', text: 'Quando as obrigações financeiras superam sua capacidade de pagamento' },
      { letter: 'B', text: 'Quando não tem cartão de crédito' },
      { letter: 'C', text: 'Quando não investe em ações' },
      { letter: 'D', text: 'Quando gasta menos que a renda' },
    ],
    correct: 'A',
  },
  {
    id: 59,
    question: 'Qual é a melhor forma de comparar duas opções de investimento?',
    options: [
      { letter: 'A', text: 'Analisar retorno, risco, liquidez, prazos e custos' },
      { letter: 'B', text: 'Olhar só a taxa anunciada' },
      { letter: 'C', text: 'Escolher a opção mais popular' },
      { letter: 'D', text: 'Comprar sempre o mais arriscado' },
    ],
    correct: 'A',
  },
  {
    id: 60,
    question: 'O que é uma dívida sustentável?',
    options: [
      { letter: 'A', text: 'Uma dívida que pode ser paga sem comprometer a capacidade financeira do devedor' },
      { letter: 'B', text: 'Qualquer crédito vencido' },
      { letter: 'C', text: 'Uma dívida usada para comprar luxo sem planejamento' },
      { letter: 'D', text: 'Uma obrigação sem juros' },
    ],
    correct: 'A',
  },
]

const QUESTIONS = [...ALL_QUESTIONS]
  .sort(() => Math.random() - 0.5)
  .slice(0, 30)

const RESULT_LEVELS = [
  { max: 8, label: 'Baixo letramento financeiro', description: 'Há conceitos básicos importantes para fortalecer.' },
  { max: 15, label: 'Letramento inicial', description: 'Você conhece o básico, mas ainda pode evoluir muito.' },
  { max: 22, label: 'Letramento intermediário', description: 'Você já toma decisões com mais consciência financeira.' },
  { max: 27, label: 'Bom letramento financeiro', description: 'Você está acima da média em educação financeira.' },
  { max: 30, label: 'Excelente letramento financeiro', description: 'Você demonstra um nível muito forte de autonomia financeira.' },
]

export default function QuizPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [answers, setAnswers] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const answeredCount = Object.keys(answers).length
  const allAnswered = answeredCount === QUESTIONS.length

  const resultLevel = useMemo(() => {
    const score = result ?? 0
    return RESULT_LEVELS.find((level) => score <= level.max) ?? RESULT_LEVELS[RESULT_LEVELS.length - 1]
  }, [result])

  if (!loading && !user) {
    router.push('/login')
    return null
  }

  const handleAnswer = (questionId, optionLetter) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionLetter }))
    setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!allAnswered) {
      setError('Responda todas as 30 perguntas antes de enviar.')
      return
    }

    const score = QUESTIONS.reduce((total, question) => {
      return total + (answers[question.id] === question.correct ? 1 : 0)
    }, 0)

    setSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          nota: score,
          respostas: answers,
          quiz_completed_at: new Date().toISOString(),
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Erro ao salvar o quiz.')
      }

      setAnswers({})
      setSubmitted(false)
      setResult(null)
      alert(`Quiz enviado com sucesso! Sua nota foi ${score}/30.`)
      router.push('/Chat')
    } catch (err) {
      console.error('Erro ao enviar quiz:', err)
      setError(err.message || 'Não foi possível enviar o resultado do quiz.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-primary-blue font-semibold">Diagnóstico</p>
              <h1 className="text-3xl font-bold text-gray-900">Quiz de Letramento Financeiro</h1>
            </div>
            <button
              type="button"
              onClick={() => router.push('/Chat')}
              className="btn-outline-blue text-sm px-4 py-2"
            >
              Voltar ao chat
            </button>
          </div>
          <p className="text-gray-600 mt-4">
            Responda as 30 perguntas abaixo para avaliar seu nível de conhecimento financeiro. A pontuação é simples: 1 ponto por resposta correta.
          </p>
        </div>

        {submitted && result !== null && (
          <div className="rounded-2xl border border-primary-green/30 bg-primary-green/5 p-5 mb-6">
            <p className="text-sm uppercase tracking-[0.18em] text-primary-green font-semibold">Resultado</p>
            <h2 className="text-2xl font-bold text-gray-900 mt-2">{result}/30 pontos</h2>
            <p className="text-lg font-medium text-gray-800 mt-1">{resultLevel.label}</p>
            <p className="text-gray-600 mt-1">{resultLevel.description}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {QUESTIONS.map((item, index) => (
            <div key={item.id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                <span className="text-primary-green">{index + 1}.</span> {item.question}
              </h3>

              <div className="space-y-3">
                {item.options.map((option) => (
                  <label
                    key={`${item.id}-${option.letter}`}
                    className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition ${
                      answers[item.id] === option.letter
                        ? 'border-primary-blue bg-primary-blue/5'
                        : 'border-gray-200 hover:border-primary-blue/40'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${item.id}`}
                      value={option.letter}
                      checked={answers[item.id] === option.letter}
                      onChange={() => handleAnswer(item.id, option.letter)}
                      className="mt-1 h-4 w-4 text-primary-blue"
                    />
                    <span className="font-medium text-primary-blue mr-2">{option.letter}.</span>
                    <span className="text-gray-700">{option.text}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 -mx-4 sm:-mx-0 sm:rounded-b-2xl">
            <div className="max-w-5xl mx-auto flex flex-col sm:flex-row gap-3 items-center justify-between">
              <p className="text-sm text-gray-600">
                {answeredCount}/{QUESTIONS.length} respostas
              </p>

              <button
                type="submit"
                disabled={submitting || !allAnswered}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed text-sm px-6 py-3"
              >
                {submitting ? 'Enviando...' : 'Enviar resposta'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  )
}
