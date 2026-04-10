'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../components/AuthProvider'

export default function PerfilForm() {
  const { user } = useAuth()
  const router = useRouter()
  const [form, setForm] = useState({
    nome: '',
    idade: '',
    experiencia: '',
    tolerancia: '',
    horizonte: ''
  })
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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleCancela = () => {
    router.push('/Chat')
  }

  const determinarPerfil = () => {
    // Lógica simples para determinar perfil
    const { idade, experiencia, tolerancia, horizonte } = form
    if (tolerancia === 'baixo' || idade === '60+') return 'conservador'
    if (tolerancia === 'medio' && experiencia === 'alguma') return 'moderado'
    return 'agressivo'
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full gradient-bg flex items-center justify-center">
            <span className="text-2xl">👤</span>
          </div>
          <h1 className="text-3xl font-bold text-gradient mb-2">Questionário de Perfil</h1>
          <p className="text-gray-600">Ajude-nos a conhecer seu perfil de investidor</p>
        </div>

        {/* Form Card */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome completo
                </label>
                <input
                  name="nome"
                  value={form.nome}
                  onChange={handleChange}
                  className="input-modern"
                  placeholder="Digite seu nome"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Faixa etária
                </label>
                <select
                  name="idade"
                  value={form.idade}
                  onChange={handleChange}
                  className="input-modern"
                  required
                >
                  <option value="">Selecione sua idade</option>
                  <option value="18-30">18-30 anos</option>
                  <option value="31-50">31-50 anos</option>
                  <option value="51-60">51-60 anos</option>
                  <option value="60+">60+ anos</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Experiência em investimentos
              </label>
              <select
                name="experiencia"
                value={form.experiencia}
                onChange={handleChange}
                className="input-modern"
                required
              >
                <option value="">Selecione sua experiência</option>
                <option value="nenhuma">Nenhuma experiência</option>
                <option value="alguma">Alguma experiência</option>
                <option value="muita">Muita experiência</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tolerância ao risco
              </label>
              <select
                name="tolerancia"
                value={form.tolerancia}
                onChange={handleChange}
                className="input-modern"
                required
              >
                <option value="">Selecione sua tolerância</option>
                <option value="baixo">Baixa - Prefiro segurança</option>
                <option value="medio">Média - Aceito algum risco</option>
                <option value="alto">Alta - Busco altos retornos</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Horizonte de investimento
              </label>
              <select
                name="horizonte"
                value={form.horizonte}
                onChange={handleChange}
                className="input-modern"
                required
              >
                <option value="">Selecione o prazo</option>
                <option value="curto">Curto prazo (até 2 anos)</option>
                <option value="medio">Médio prazo (2-5 anos)</option>
                <option value="longo">Longo prazo (mais de 5 anos)</option>
              </select>
            </div>

            {/* Profile Preview */}
            {form.tolerancia && form.experiencia && form.idade && (
              <div className="bg-gradient-to-r from-primary-green/10 to-primary-blue/10 rounded-lg p-4 border border-primary-green/20">
                <h3 className="font-semibold text-gray-800 mb-2">Seu perfil estimado:</h3>
                <p className="text-lg font-medium text-gradient capitalize">
                  {determinarPerfil()}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Este perfil será usado para personalizar suas recomendações de investimento.
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Salvando...
                  </div>
                ) : (
                  'Salvar Perfil'
                )}
              </button>

              {validaPerfil && (
                <button
                  type="button"
                  onClick={handleCancela}
                  className="btn-outline flex-1"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Info Section */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Suas respostas são confidenciais e serão usadas apenas para personalizar suas recomendações.
          </p>
        </div>
      </div>
    </div>
  )
}