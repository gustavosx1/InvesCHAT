"use client"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../../../components/AuthProvider"

const initialForm = {
  nome: "",
  tipo: "",
  dataAplicacao: "",
  valorInvestido: "",
  taxaAnual: "",
  prazoMeses: "",
  tipoRendimento: "composto",
  comentarios: ""
}

function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(Number(value) || 0)
}

function calculateProjectedReturn({ valorInvestido, taxaAnual, prazoMeses, tipoRendimento }) {
  const valor = Number(valorInvestido)
  const taxa = Number(taxaAnual) / 100
  const meses = Number(prazoMeses)
  if (!valor || !taxa || !meses) {
    return { valorEstimado: 0, rendimentoEstimado: 0 }
  }

  const anos = meses / 12
  const valorEstimado = tipoRendimento === "simples"
    ? valor * (1 + taxa * anos)
    : valor * Math.pow(1 + taxa, anos)

  return {
    valorEstimado,
    rendimentoEstimado: valorEstimado - valor
  }
}

export default function InvestForm() {
  const router = useRouter()
  const [form, setForm] = useState(initialForm)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [investments, setInvestments] = useState([])
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    const loadPortfolio = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/invest/${user.id}`)
        const text = await res.text()
        let body = null

        try {
          body = text ? JSON.parse(text) : null
        } catch (parseError) {
          console.error('Resposta inválida de /api/invest:', text)
          throw parseError
        }

        if (res.ok && body?.data?.investimentos) {
          setInvestments(Array.isArray(body.data.investimentos) ? body.data.investimentos : [body.data.investimentos])
        } else if (!res.ok) {
          console.error('Erro na API /api/invest:', res.status, body)
        }
      } catch (err) {
        console.error("Erro ao carregar carteira:", err)
      } finally {
        setLoading(false)
      }
    }

    loadPortfolio()
  }, [user])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError("")
    setMessage("")

    if (!user) {
      setError("Usuário não autenticado. Faça login e tente novamente.")
      return
    }

    const { nome, tipo, dataAplicacao, valorInvestido, taxaAnual, prazoMeses, tipoRendimento, comentarios } = form
    if (!nome || !tipo || !dataAplicacao || !valorInvestido || !taxaAnual || !prazoMeses) {
      setError("Preencha todos os campos obrigatórios antes de salvar o investimento.")
      return
    }

    const { valorEstimado, rendimentoEstimado } = calculateProjectedReturn(form)
    const novoInvestimento = {
      id: `inv-${Date.now()}`,
      nome,
      tipo,
      dataAplicacao,
      valorInvestido: Number(valorInvestido),
      taxaAnual: Number(taxaAnual),
      prazoMeses: Number(prazoMeses),
      tipoRendimento,
      comentarios,
      valorEstimado: Number(valorEstimado.toFixed(2)),
      rendimentoEstimado: Number(rendimentoEstimado.toFixed(2)),
      criadoEm: new Date().toISOString()
    }

    try {
      const res = await fetch("/api/invest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ id: user.id, investimentos: novoInvestimento })
      })

      const text = await res.text()
      let body = null

      try {
        body = text ? JSON.parse(text) : null
      } catch (parseError) {
        console.error('Resposta inválida de /api/invest:', text)
        throw parseError
      }

      if (!res.ok) {
        setError(body?.error || "Erro ao salvar o investimento")
        return
      }

      setInvestments((prev) => [...prev, novoInvestimento])
      setMessage("Investimento salvo com sucesso.")
      setForm(initialForm)
    } catch (err) {
      console.error(err)
      setError("Falha ao enviar o investimento. Tente novamente.")
    }
  }

  const handleCancela = () => {
    router.push('/Chat')
  }

  const projection = useMemo(() => calculateProjectedReturn(form), [form])
  const totalInvestido = investments.reduce((sum, item) => sum + Number(item.valorInvestido || 0), 0)
  const totalEstimado = investments.reduce((sum, item) => sum + Number(item.valorEstimado || 0), 0)

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-4 bg-gray-50">
      <div className="w-full max-w-4xl">
        <div className="mb-6 rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold mb-2 text-gradient">Cadastrar novo investimento</h1>
              <p className="text-sm text-gray-600">
                Preencha os dados do investimento para calcular a rentabilidade estimada e enviar o cadastro em JSON para a API.
              </p>
            </div>
            <div className="w-12 h-12 rounded-full gradient-bg flex items-center justify-center">
              <span className="text-white text-xl">💰</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">ID do usuário: <span className="font-medium">{user?.id || 'carregando...'}</span></p>
        </div>

        <form onSubmit={handleSubmit} className="mb-8 grid gap-4 rounded-lg border bg-white p-6 shadow-sm">
          {error && <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          {message && <div className="rounded border border-green-300 bg-green-50 p-3 text-sm text-green-700">{message}</div>}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block mb-1 font-medium text-gray-700">Nome do investimento</label>
              <input
                name="nome"
                value={form.nome}
                onChange={handleChange}
                className="input-modern"
                placeholder="Ex: CDB, Ação XYZ"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-700">Tipo de investimento</label>
              <select
                name="tipo"
                value={form.tipo}
                onChange={handleChange}
                className="input-modern"
                required
              >
                <option value="">Selecione</option>
                <option value="renda_fixa">Renda fixa</option>
                <option value="renda_variavel">Renda variável</option>
                <option value="fundos">Fundos</option>
                <option value="imobiliario">Imobiliário</option>
              </select>
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-700">Data da aplicação</label>
              <input
                type="date"
                name="dataAplicacao"
                value={form.dataAplicacao}
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
                value={form.valorInvestido}
                onChange={handleChange}
                className="input-modern"
                placeholder="1000"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-700">Taxa anual (%)</label>
              <input
                type="number"
                name="taxaAnual"
                step="0.01"
                min="0"
                value={form.taxaAnual}
                onChange={handleChange}
                className="input-modern"
                placeholder="8.5"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-700">Horizonte (meses)</label>
              <input
                type="number"
                name="prazoMeses"
                step="1"
                min="1"
                value={form.prazoMeses}
                onChange={handleChange}
                className="input-modern"
                placeholder="12"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block mb-1 font-medium text-gray-700">Tipo de rendimento</label>
              <select
                name="tipoRendimento"
                value={form.tipoRendimento}
                onChange={handleChange}
                className="input-modern"
              >
                <option value="composto">Juros compostos</option>
                <option value="simples">Juros simples</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block mb-1 font-medium text-gray-700">Observações</label>
              <textarea
                name="comentarios"
                value={form.comentarios}
                onChange={handleChange}
                className="input-modern"
                rows="3"
                placeholder="Ex: investimento em título prefixado"
              />
            </div>
          </div>

          <div className="rounded border border-gray-200 bg-slate-50 p-4">
            <h2 className="text-lg font-semibold mb-2 text-gradient">Projeção de retorno</h2>
            <p className="text-sm text-gray-600">Baseada nos valores e no prazo informados.</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded bg-white p-3 shadow-sm border border-gray-100">
                <p className="text-xs uppercase text-gray-500">Valor estimado</p>
                <p className="text-xl font-semibold text-primary-green">{formatCurrency(projection.valorEstimado)}</p>
              </div>
              <div className="rounded bg-white p-3 shadow-sm border border-gray-100">
                <p className="text-xs uppercase text-gray-500">Rendimento estimado</p>
                <p className="text-xl font-semibold text-primary-blue">{formatCurrency(projection.rendimentoEstimado)}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="submit" className="btn-primary flex-1">Salvar investimento</button>
            <button type="button" onClick={handleCancela} className="btn-outline flex-1">Cancelar</button>
          </div>
        </form>

        <section className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gradient">Carteira de investimentos</h2>
              <p className="text-sm text-gray-600">Total de investimentos cadastrados e retorno projetado.</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="rounded border border-gray-200 bg-slate-50 p-3">
                <p className="text-sm text-gray-500">Total investido</p>
                <p className="text-lg font-semibold text-primary-blue">{formatCurrency(totalInvestido)}</p>
              </div>
              <div className="rounded border border-gray-200 bg-slate-50 p-3">
                <p className="text-sm text-gray-500">Total projetado</p>
                <p className="text-lg font-semibold text-primary-green">{formatCurrency(totalEstimado)}</p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-blue"></div>
              <span className="ml-2 text-gray-600">Carregando investimentos...</span>
            </div>
          ) : investments.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-primary-blue/20 to-primary-green/20 flex items-center justify-center">
                <span className="text-3xl">📊</span>
              </div>
              <p className="text-gray-600">Nenhum investimento cadastrado ainda.</p>
              <p className="text-sm text-gray-500 mt-1">Comece adicionando seu primeiro investimento acima.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] divide-y divide-gray-200 text-left text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 font-semibold text-slate-700">Nome</th>
                    <th className="px-3 py-3 font-semibold text-slate-700">Tipo</th>
                    <th className="px-3 py-3 font-semibold text-slate-700">Valor</th>
                    <th className="px-3 py-3 font-semibold text-slate-700">Taxa anual</th>
                    <th className="px-3 py-3 font-semibold text-slate-700">Prazo</th>
                    <th className="px-3 py-3 font-semibold text-slate-700">Estimado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {investments.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-3 py-3 font-medium">{item.nome}</td>
                      <td className="px-3 py-3 capitalize">{item.tipo.replace('_', ' ')}</td>
                      <td className="px-3 py-3 text-primary-blue font-medium">{formatCurrency(item.valorInvestido)}</td>
                      <td className="px-3 py-3">{item.taxaAnual}%</td>
                      <td className="px-3 py-3">{item.prazoMeses} meses</td>
                      <td className="px-3 py-3 text-primary-green font-medium">{formatCurrency(item.valorEstimado)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
