'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../components/AuthProvider'

const SUITABILITY_QUESTIONS = [
  {
    "id": 1,
    "eixo": "objetivos",
    "pergunta": "Qual é o seu principal objetivo ao investir?",
    "opcoes": [
      {"letra": "A", "texto": "Preservar o capital investido, evitando qualquer risco de perda", "pontos": 1},
      {"letra": "B", "texto": "Obter rentabilidade um pouco acima da poupança, com baixo risco", "pontos": 2},
      {"letra": "C", "texto": "Crescimento moderado do patrimônio, aceitando variações eventuais", "pontos": 3},
      {"letra": "D", "texto": "Maximizar o retorno no longo prazo, mesmo suportando perdas temporárias significativas", "pontos": 4},
    ]
  },
  {
    "id": 2,
    "eixo": "objetivos",
    "pergunta": "Qual é o prazo que você pretende manter seus investimentos?",
    "opcoes": [
      {"letra": "A", "texto": "Menos de 1 ano", "pontos": 1},
      {"letra": "B", "texto": "Entre 1 e 3 anos", "pontos": 2},
      {"letra": "C", "texto": "Entre 3 e 5 anos", "pontos": 3},
      {"letra": "D", "texto": "Mais de 5 anos", "pontos": 4},
    ]
  },
  {
    "id": 3,
    "eixo": "objetivos",
    "pergunta": "Se o mercado cair 20% e seu investimento perder parte do valor, o que você faria?",
    "opcoes": [
      {"letra": "A", "texto": "Resgataria tudo imediatamente para evitar mais perdas", "pontos": 1},
      {"letra": "B", "texto": "Ficaria preocupado(a) e provavelmente resgataria parte", "pontos": 2},
      {"letra": "C", "texto": "Manteria a posição aguardando a recuperação", "pontos": 3},
      {"letra": "D", "texto": "Aproveitaria para investir mais, enxergando como oportunidade", "pontos": 4},
    ]
  },
  {
    "id": 4,
    "eixo": "situacao_financeira",
    "pergunta": "Qual é a sua renda mensal bruta aproximada?",
    "opcoes": [
      {"letra": "A", "texto": "Até R$ 3.000", "pontos": 1},
      {"letra": "B", "texto": "De R$ 3.001 a R$ 8.000", "pontos": 2},
      {"letra": "C", "texto": "De R$ 8.001 a R$ 20.000", "pontos": 3},
      {"letra": "D", "texto": "Acima de R$ 20.000", "pontos": 4},
    ]
  },
  {
    "id": 5,
    "eixo": "situacao_financeira",
    "pergunta": "Qual percentual da sua renda mensal você consegue direcionar para investimentos?",
    "opcoes": [
      {"letra": "A", "texto": "Menos de 5%", "pontos": 1},
      {"letra": "B", "texto": "Entre 5% e 15%", "pontos": 2},
      {"letra": "C", "texto": "Entre 15% e 30%", "pontos": 3},
      {"letra": "D", "texto": "Mais de 30%", "pontos": 4},
    ]
  },
  {
    "id": 6,
    "eixo": "situacao_financeira",
    "pergunta": "Você possui reserva de emergência equivalente a pelo menos 6 meses de despesas?",
    "opcoes": [
      {"letra": "A", "texto": "Não possuo reserva de emergência", "pontos": 1},
      {"letra": "B", "texto": "Tenho reserva para menos de 3 meses", "pontos": 2},
      {"letra": "C", "texto": "Tenho reserva para 3 a 6 meses", "pontos": 3},
      {"letra": "D", "texto": "Tenho reserva para mais de 6 meses", "pontos": 4},
    ]
  },
  {
    "id": 7,
    "eixo": "situacao_financeira",
    "pergunta": "Como você classificaria sua situação patrimonial atual?",
    "opcoes": [
      {"letra": "A", "texto": "Tenho dívidas que comprometem minha renda", "pontos": 1},
      {"letra": "B", "texto": "Estou equilibrado(a), sem folga para imprevistos", "pontos": 2},
      {"letra": "C", "texto": "Tenho algum patrimônio acumulado além da reserva", "pontos": 3},
      {"letra": "D", "texto": "Tenho patrimônio sólido e diversificado", "pontos": 4},
    ]
  },
  {
    "id": 8,
    "eixo": "conhecimento",
    "pergunta": "Como você descreveria seu conhecimento sobre produtos de investimento?",
    "opcoes": [
      {"letra": "A", "texto": "Nunca investi além de poupança ou conta corrente", "pontos": 1},
      {"letra": "B", "texto": "Conheço CDB, Tesouro Direto e fundos de renda fixa", "pontos": 2},
      {"letra": "C", "texto": "Invisto em fundos multimercado, debêntures ou FIIs", "pontos": 3},
      {"letra": "D", "texto": "Opero ações, opções, derivativos ou criptoativos regularmente", "pontos": 4},
    ]
  },
  {
    "id": 9,
    "eixo": "conhecimento",
    "pergunta": "Há quanto tempo você investe no mercado financeiro?",
    "opcoes": [
      {"letra": "A", "texto": "Nunca investi ou comecei há menos de 6 meses", "pontos": 1},
      {"letra": "B", "texto": "Entre 6 meses e 2 anos", "pontos": 2},
      {"letra": "C", "texto": "Entre 2 e 5 anos", "pontos": 3},
      {"letra": "D", "texto": "Mais de 5 anos", "pontos": 4},
    ]
  },
  {
    "id": 10,
    "eixo": "conhecimento",
    "pergunta": "Você já passou por uma situação em que um investimento gerou perda relevante?",
    "opcoes": [
      {"letra": "A", "texto": "Não, e me incomoda muito a ideia de ter perdas", "pontos": 1},
      {"letra": "B", "texto": "Sim, mas foi difícil lidar e evito repetir a situação", "pontos": 2},
      {"letra": "C", "texto": "Sim, entendi como parte do processo e aprendi com a experiência", "pontos": 3},
      {"letra": "D", "texto": "Sim, encaro perdas como naturais e faço gestão de risco ativa", "pontos": 4},
    ]
  },
]

export default function PerfilForm() {
  const { user } = useAuth()
  const router = useRouter()
  const [form, setForm] = useState({})
  const [validaPerfil, setValidaPerfil] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(()=>{
    setLoading(true)
    if(!user) return
    fetch(`/api/perfil/${user.id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then(response => response.json())
    .then(data => {
      if (data.success && data["data"] && data["data"]["perfil"]) {
        setValidaPerfil(true)
        setLoading(false)
        console.log('Perfil encontrado:', data.data.perfil)
      } else {
        setLoading(false)
      }
    })
    .catch(error => {
      console.error('Erro ao buscar perfil:', error)
      setLoading(false)
    })
  }, [user])

  const handleChange = (questionId, pontosValue) => {
    setForm({ ...form, [questionId]: pontosValue })
  }

  const handleCancela = () => {
    router.push('/Chat')
  }

  const determinarPerfil = () => {
    // Calcula a pontuação total
    const totalPontos = Object.values(form).reduce((sum, points) => sum + (points || 0), 0)
    
    // Determina o perfil baseado na média de pontos
    const mediaPontos = totalPontos / SUITABILITY_QUESTIONS.length
    
    if (mediaPontos <= 1.75) return 'conservador'
    if (mediaPontos <= 2.5) return 'moderado'
    if (mediaPontos <= 3.25) return 'agressivo'
    return 'muito_agressivo'
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    const perfil = determinarPerfil()

    try {
      const response = await fetch('/api/perfil', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: user.id, perfil: perfil }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('Erro ao salvar perfil:', data.error)
        alert('Erro ao salvar perfil: ' + data.error)
      } else {
        console.log('Perfil salvo com sucesso:', data)
        router.push('/Chat')
      }
    } catch (error) {
      console.error('Erro ao fazer requisição:', error)
      alert('Erro ao salvar perfil')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isAllAnswered = Object.keys(form).length === SUITABILITY_QUESTIONS.length

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="flex-1 overflow-y-auto px-3 py-6 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-6 pb-28 sm:pb-24">
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold mb-2 text-gradient">Quiz do Perfil de Investidor</h1>
                <p className="text-sm text-gray-600">
                  Responda as perguntas abaixo para determinar seu perfil de investidor entre: Conservador, Moderado, Agressivo e Muito Agressivo.
                </p>
              </div>
            </div>
          </div>

          <div className="max-w-3xl mx-auto">
            {/* Form content wrapper */}
            <div className="space-y-8 pb-28 sm:pb-20">
              {SUITABILITY_QUESTIONS.map((question, index) => (
                <div key={question.id} className="pb-6 border-b border-gray-200 last:border-b-0 last:pb-0">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    <span className="text-primary-green font-bold">{index + 1}.</span> {question.pergunta}
                  </h3>
                  <div className="space-y-3">
                    {question.opcoes.map((opcao) => (
                      <label 
                        key={`${question.id}-${opcao.letra}`}
                        className="flex items-start p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-primary-green hover:bg-primary-green/5 transition-all"
                      >
                        <input
                          type="radio"
                          name={`pergunta-${question.id}`}
                          value={opcao.pontos}
                          checked={form[question.id] === opcao.pontos}
                          onChange={(e) => handleChange(question.id, parseInt(e.target.value))}
                          className="mt-1 w-4 h-4 text-primary-green cursor-pointer"
                        />
                        <div className="ml-3 flex-1">
                          <div className="font-medium text-gray-800">
                            <span className="text-primary-green font-bold">{opcao.letra})</span> {opcao.texto}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              {/* Profile Preview */}
              {isAllAnswered && (
                <div className="bg-gradient-to-r from-primary-green/10 to-primary-blue/10 rounded-lg p-4 border border-primary-green/20 mt-6">
                  <h3 className="font-semibold text-gray-800 mb-2">Seu perfil estimado:</h3>
                  <p className="text-lg font-medium text-gradient capitalize">
                    {determinarPerfil()}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Este perfil será usado para personalizar suas recomendações de investimento.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Fixed with Buttons */}
      <div className="sticky bottom-0 z-50 bg-white border-t border-gray-200 px-3 py-2 sm:px-6 sm:py-4 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="flex gap-2 sm:gap-4">
            <button
              type="submit"
              disabled={isSubmitting || !isAllAnswered}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm px-4 py-1.5 sm:py-2"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  SALVANDO...
                </div>
              ) : (
                'SALVAR PERFIL'
              )}
            </button>

            {validaPerfil && (
              <button
                type="button"
                onClick={handleCancela}
                className="btn-cancel flex-1 text-xs sm:text-sm px-4 py-1.5 sm:py-2"
              >
                CANCELAR
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
