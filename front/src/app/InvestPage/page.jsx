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

function calculateProjectedReturn({ valorInvestido, aporteMensal, taxaEfetiva, prazoAnos }) {
  const valor = Number(valorInvestido) || 0
  const aporte = Number(aporteMensal) || 0
  const taxaAnual = Number(taxaEfetiva) / 100
  const anos = Number(prazoAnos) || 0
  
  // Se valores críticos forem inválidos, retorna 0
  if (valor === 0 && aporte === 0) {
    return { valorEstimado: 0, rendimentoEstimado: 0, aportesTotal: 0 }
  }
  
  if (taxaAnual === 0 || anos === 0) {
    // Se não há taxa ou tempo, o valor não cresce
    const meses = Math.round(anos * 12)
    const aportesTotal = aporte * meses
    return {
      valorEstimado: valor + aportesTotal,
      rendimentoEstimado: 0,
      aportesTotal
    }
  }

  // Converter taxa anual para mensal
  const taxaMensal = Math.pow(1 + taxaAnual, 1/12) - 1
  const meses = Math.round(anos * 12)

  // Valor futuro do investimento inicial com juros compostos
  const vfInicial = valor * Math.pow(1 + taxaMensal, meses)

  // Valor futuro dos aportes mensais (série de pagamentos com juros compostos)
  // Fórmula com aportes feitos no INÍCIO de cada período: VF = PMT × [((1 + i)^n - 1) / i] × (1 + i)
  let vfAportes = 0
  if (aporte > 0) {
    if (taxaMensal > 1e-10) {
      // Aportes começam no primeiro mês e rendem com juros compostos
      vfAportes = aporte * (Math.pow(1 + taxaMensal, meses) - 1) / taxaMensal * (1 + taxaMensal)
    } else {
      // Se taxa é praticamente zero, aportes não rendem
      vfAportes = aporte * meses
    }
  }

  const valorEstimado = vfInicial + vfAportes
  const aportesTotal = aporte * meses
  const rendimentoEstimado = valorEstimado - valor - aportesTotal

  return {
    valorEstimado,
    rendimentoEstimado,
    aportesTotal
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
    if (taxaEfetiva > 0) {
      return calculateProjectedReturn({
        valorInvestido: form.valorInvestido,
        aporteMensal: form.aporteMensal,
        taxaEfetiva: taxaEfetiva,
        prazoAnos: form.prazoAnos
      })
    }
    return { valorEstimado: 0, rendimentoEstimado: 0, aportesTotal: 0 }
  }, [form, taxaEfetiva])

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header - Fixed */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-primary-blue/95 to-primary-green/95 shadow-lg px-3 py-4 sm:px-6 sm:py-6">
        <div className="max-w-4xl mx-auto flex flex-col gap-2 sm:flex-row justify-between items-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1 flex items-center gap-3">SIMULADOR DE INVESTIMENTOS</h2>
          <div className="flex gap-2">
          
          </div>
        </div>
      </div>

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
            <div className="w-12 h-12 rounded-full gradient-bg flex items-center justify-center">
              <span className="text-white text-xl">📊</span>
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

        <form onSubmit={handleSubmit} className="mb-8 grid gap-4 rounded-lg border bg-white p-6 shadow-sm">
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
            <p className="text-sm text-gray-600">Cálculo com juros compostos ao mês.</p>
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
      <div className="sticky bottom-0 z-50 bg-white border-t border-gray-200 px-3 py-3 sm:px-6 sm:py-4 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row sm:gap-4">
            <button 
              type="submit" 
              className="btn-primary flex-1 text-sm px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed order-2 sm:order-1" 
              disabled={loadingTaxas}
            >
              {loadingTaxas ? "CALCULANDO..." : "CALCULAR"}
            </button>
            <button 
              type="button" 
              onClick={handleCancela} 
              className="btn-cancel flex-1 text-sm px-4 py-2 order-1 sm:order-2"
            >
              VOLTAR
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

