"use client"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"

const initialForm = {
  nome: "",
  tipoTaxa: "percentual_cdi",
  dataAplicacao: "",
  valorInvestido: "",
  aporteMensal: "0",
  percentualIndice: "100",
  prazoAnos: "",
  comentarios: ""
}

function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(Number(value) || 0)
}

function formatDate(value) {
  if (!value) return "-"
  return new Intl.DateTimeFormat("pt-BR").format(value)
}

function parseLocalDate(value) {
  if (!value || typeof value !== "string") return null
  const [year, month, day] = value.split("-").map(Number)
  if (!year || !month || !day) return null

  const date = new Date(year, month - 1, day)
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null
  }

  return date
}

function addMonthsKeepingDay(baseDate, monthsToAdd) {
  const result = new Date(baseDate)
  const originalDay = result.getDate()

  result.setDate(1)
  result.setMonth(result.getMonth() + monthsToAdd)

  const lastDayOfMonth = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate()
  result.setDate(Math.min(originalDay, lastDayOfMonth))

  return result
}

function calculateProjectedReturn({ valorInvestido, aporteMensal, taxaEfetiva, prazoAnos, dataAplicacao }) {
  const valor = Number(valorInvestido) || 0
  const aporte = Number(aporteMensal) || 0
  const taxaAnual = Number(taxaEfetiva) / 100
  const anos = Number(prazoAnos) || 0
  const dataInicial = parseLocalDate(dataAplicacao)
  const prazoMeses = Math.max(0, Math.round(anos * 12))

  const emptyProjection = {
    valorEstimado: 0,
    rendimentoEstimado: 0,
    aportesTotal: 0,
    quantidadeAportes: 0,
    dataFinal: null
  }
  
  // Se valores críticos forem inválidos, retorna 0
  if (valor === 0 && aporte === 0) {
    return emptyProjection
  }

  if (!dataInicial || prazoMeses <= 0) {
    return emptyProjection
  }

  const dataFinal = addMonthsKeepingDay(dataInicial, prazoMeses)
  const msPerDay = 1000 * 60 * 60 * 24
  const baseComposta = 1 + Math.max(-0.999999, taxaAnual)

  let capitalInvestido = 0
  let valorEstimado = 0
  let quantidadeAportes = 0

  const addCashFlow = (amount, date) => {
    if (amount <= 0) return

    const diasAteVencimento = Math.max(0, Math.round((dataFinal - date) / msPerDay))
    const fator = baseComposta > 0 ? Math.pow(baseComposta, diasAteVencimento / 365) : 1

    capitalInvestido += amount
    valorEstimado += amount * fator
  }

  // Capital inicial aplicado na data de aplicação.
  addCashFlow(valor, dataInicial)

  // Aportes mensais na data de aniversário da aplicação (mesmo dia do mês, quando possível).
  if (aporte > 0) {
    for (let mes = 0; mes < prazoMeses; mes += 1) {
      const dataAporte = addMonthsKeepingDay(dataInicial, mes)
      if (dataAporte >= dataFinal) break

      addCashFlow(aporte, dataAporte)
      quantidadeAportes += 1
    }
  }

  const aportesTotal = aporte * quantidadeAportes
  const rendimentoEstimado = valorEstimado - capitalInvestido

  return {
    valorEstimado,
    rendimentoEstimado,
    aportesTotal,
    quantidadeAportes,
    dataFinal
  }
}

export default function CalculadoraRendaFixa() {
  const router = useRouter()
  const [form, setForm] = useState(initialForm)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [taxaCDI, setTaxaCDI] = useState(null)
  const [taxaSELIC, setTaxaSELIC] = useState(null)
  const [loadingTaxas, setLoadingTaxas] = useState(true)

  // Buscar as taxas quando o componente monta
  useEffect(() => {
    const fetchTaxas = async () => {
      setLoadingTaxas(true)
      try {
        // Buscar taxa CDI acumulada dos últimos 12 meses
        const cdiRes = await fetch("/api/data/cdi")
        const cdiJson = await cdiRes.json()
        if (cdiJson.dados && cdiJson.dados.cdi_12_meses) {
          setTaxaCDI(cdiJson.dados.cdi_12_meses)
        }

        // Buscar taxa SELIC
        const selicRes = await fetch("/api/data/selic-atual")
        const selicJson = await selicRes.json()
        if (selicJson.dados && selicJson.dados.taxa_selic_atual) {
          setTaxaSELIC(parseFloat(selicJson.dados.taxa_selic_atual))
        }
      } catch (err) {
        console.error("Erro ao buscar taxas:", err)
        setError("Erro ao buscar as taxas atuais. Tente novamente.")
      } finally {
        setLoadingTaxas(false)
      }
    }

    fetchTaxas()
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setError("")
    setMessage("")

    const { nome, tipoTaxa, dataAplicacao, valorInvestido, percentualIndice, prazoAnos } = form
    if (!nome || !tipoTaxa || !dataAplicacao || !valorInvestido || !percentualIndice || !prazoAnos) {
      setError("Preencha todos os campos obrigatórios para calcular o rendimento.")
      return
    }

    if (!taxaCDI && tipoTaxa === "percentual_cdi") {
      setError("Aguarde o carregamento da taxa CDI.")
      return
    }

    if (!taxaSELIC && tipoTaxa === "percentual_selic") {
      setError("Aguarde o carregamento da taxa SELIC.")
      return
    }

    setMessage("Cálculo realizado com sucesso! Veja a projeção abaixo.")
  }

  const handleCancela = () => {
    router.push('/Chat')
  }

  // Calcular a taxa efetiva baseado no tipo de taxa selecionado
  const calcularTaxaEfetiva = () => {
    const { tipoTaxa, percentualIndice } = form
    const percentual = Number(percentualIndice) / 100

    if (tipoTaxa === "percentual_cdi" && taxaCDI) {
      return taxaCDI * percentual
    }

    if (tipoTaxa === "percentual_selic" && taxaSELIC) {
      return taxaSELIC * percentual
    }

    return 0
  }

  const taxaEfetiva = calcularTaxaEfetiva()
  const projection = useMemo(() => {
    return calculateProjectedReturn({
      valorInvestido: form.valorInvestido,
      aporteMensal: form.aporteMensal,
      taxaEfetiva: taxaEfetiva,
      prazoAnos: form.prazoAnos,
      dataAplicacao: form.dataAplicacao
    })
  }, [form, taxaEfetiva])

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto px-3 py-6 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-6 pb-28 sm:pb-24">
        <div className="mb-6 rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold mb-2 text-gradient">Calculadora de Renda Fixa</h1>
              <p className="text-sm text-gray-600">
                Calcule a rentabilidade de investimentos em renda fixa. Selecione o índice, adicione o spread e veja a projeção para o período desejado.
              </p>
            </div>
           
          </div>
        </div>

        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <span className="text-xl">⚠️</span>
            </div>
            <div>
              <h3 className="font-semibold text-amber-900 mb-1">Aviso importante</h3>
              <p className="text-sm text-amber-800">
                As taxas de juros (CDI, SELIC) são medidas de política monetária que podem ser alteradas a qualquer momento pelo Banco Central. 
                As projeções apresentadas são baseadas nas taxas atuais e <strong>não constituem garantia de retorno</strong>. 
                Seus rendimentos reais podem variar significativamente durante o período de investimento.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mb-0 grid gap-4 rounded-lg border bg-white p-6 shadow-sm">
          {error && <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          {message && <div className="rounded border border-green-300 bg-green-50 p-3 text-sm text-green-700">{message}</div>}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block mb-1 font-medium text-gray-700">Nome do investimento</label>
              <input
                name="nome"
                value={form.nome ?? ""}
                onChange={handleChange}
                className="input-modern"
                placeholder="Ex: CDB, Tesouro, LCI"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-700">Tipo de taxa</label>
              <select
                name="tipoTaxa"
                value={form.tipoTaxa ?? "percentual_cdi"}
                onChange={handleChange}
                className="input-modern"
                required
              >
                <option value="percentual_cdi">% do CDI</option>
                <option value="percentual_selic">% da SELIC</option>
              </select>
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-700">Data da aplicação</label>
              <input
                type="date"
                name="dataAplicacao"
                value={form.dataAplicacao ?? ""}
                onChange={handleChange}
                className="input-modern"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-700">Valor investido (R$)</label>
              <input
                type="number"
                name="valorInvestido"
                step="0.01"
                min="0"
                value={form.valorInvestido ?? ""}
                onChange={handleChange}
                className="input-modern"
                placeholder="1000"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-700">Aporte mensal (R$)</label>
              <input
                type="number"
                name="aporteMensal"
                step="0.01"
                min="0"
                value={form.aporteMensal ?? "0"}
                onChange={handleChange}
                className="input-modern"
                placeholder="0"
              />
              <p className="text-xs text-gray-500 mt-1">Deixe em 0 se não fizer aportes mensais</p>
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-700">Percentual do índice (%)</label>
              <input
                type="number"
                name="percentualIndice"
                step="0.1"
                min="0"
                value={form.percentualIndice ?? "100"}
                onChange={handleChange}
                className="input-modern"
                placeholder="100"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {loadingTaxas ? "Carregando taxas..." :
                  form.tipoTaxa === "percentual_cdi" 
                    ? `CDI atual: ${taxaCDI?.toFixed(2)}% a.a. • Sua taxa: ${(taxaCDI * Number(form.percentualIndice ?? 100) / 100)?.toFixed(2)}% a.a.`
                    : `SELIC atual: ${taxaSELIC?.toFixed(2)}% a.a. • Sua taxa: ${(taxaSELIC * Number(form.percentualIndice ?? 100) / 100)?.toFixed(2)}% a.a.`
                }
              </p>
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-700">Horizonte (anos)</label>
              <input
                type="number"
                name="prazoAnos"
                step="0.5"
                min="0.5"
                value={form.prazoAnos ?? ""}
                onChange={handleChange}
                className="input-modern"
                placeholder="1"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block mb-1 font-medium text-gray-700">Observações</label>
              <textarea
                name="comentarios"
                value={form.comentarios ?? ""}
                onChange={handleChange}
                className="input-modern"
                rows="2"
                placeholder="Ex: investimento em título prefixado com liquidez vencimento"
              />
            </div>
          </div>

          <div className="rounded border border-gray-200 bg-slate-50 p-4">
            <h2 className="text-lg font-semibold mb-2 text-gradient">Projeção de retorno</h2>
            <p className="text-sm text-gray-600">Cálculo com juros compostos e datas reais dos aportes mensais.</p>
            {loadingTaxas ? (
              <div className="mt-3 flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-blue"></div>
                <span className="ml-2 text-sm text-gray-600">Carregando taxas...</span>
              </div>
            ) : (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="rounded bg-white p-3 shadow-sm border border-gray-100">
                  <p className="text-xs uppercase text-gray-500">Valor inicial investido</p>
                  <p className="text-lg font-semibold text-primary-blue">{formatCurrency(Number(form.valorInvestido ?? 0) || 0)}</p>
                </div>
                <div className="rounded bg-white p-3 shadow-sm border border-gray-100">
                  <p className="text-xs uppercase text-gray-500">Total de aportes mensais</p>
                  <p className="text-lg font-semibold text-primary-blue">{formatCurrency(projection.aportesTotal)}</p>
                </div>
                <div className="rounded bg-white p-3 shadow-sm border border-gray-100">
                  <p className="text-xs uppercase text-gray-500">Capital total investido</p>
                  <p className="text-lg font-semibold text-slate-700">{formatCurrency((Number(form.valorInvestido ?? 0) || 0) + projection.aportesTotal)}</p>
                </div>
                <div className="rounded bg-white p-3 shadow-sm border border-gray-100">
                  <p className="text-xs uppercase text-gray-500">Taxa efetiva</p>
                  <p className="text-lg font-semibold text-primary-blue">{taxaEfetiva.toFixed(2)}% a.a.</p>
                </div>
                <div className="rounded bg-white p-3 shadow-sm border border-gray-100">
                  <p className="text-xs uppercase text-gray-500">Quantidade de aportes</p>
                  <p className="text-lg font-semibold text-slate-700">{projection.quantidadeAportes}</p>
                </div>
                <div className="rounded bg-white p-3 shadow-sm border border-gray-100">
                  <p className="text-xs uppercase text-gray-500">Data final da projeção</p>
                  <p className="text-lg font-semibold text-slate-700">{formatDate(projection.dataFinal)}</p>
                </div>
                <div className="rounded bg-white p-3 shadow-sm border border-gray-100 sm:col-span-2">
                  <p className="text-xs uppercase text-gray-500">Rendimento estimado (juros)</p>
                  <p className="text-xl font-semibold text-primary-green">{formatCurrency(projection.rendimentoEstimado)}</p>
                </div>
                <div className="rounded bg-white p-3 shadow-sm border border-2 border-primary-green sm:col-span-2">
                  <p className="text-xs uppercase text-gray-500">Valor final projetado</p>
                  <p className="text-2xl font-bold text-primary-green">{formatCurrency(projection.valorEstimado)}</p>
                </div>
              </div>
            )}
          </div>
        </form>
        </div>
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 z-50 bg-white border-t border-gray-200 px-3 py-2 sm:px-6 sm:py-4 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2 sm:gap-4">
            <button 
              type="submit" 
              className="btn-primary flex-1 text-xs sm:text-sm px-4 py-1.5 sm:py-2 disabled:opacity-50 disabled:cursor-not-allowed" 
              disabled={loadingTaxas}
              onClick={handleSubmit}
            >
              {loadingTaxas ? "CALCULANDO..." : "CALCULAR"}
            </button>
            <button 
              type="button" 
              onClick={handleCancela} 
              className="btn-cancel flex-1 text-xs sm:text-sm px-4 py-1.5 sm:py-2"
            >
              VOLTAR
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

