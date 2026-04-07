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
      }
    })
    .catch(error => {
      console.error('Erro ao buscar perfil:', error)
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
    if (tolerancia === 'baixo' || idade > 60) return 'conservador'
    if (tolerancia === 'medio' && experiencia === 'alguma') return 'moderado'
    return 'agressivo'
  }

  const handleSubmit = async (e) => {
    setLoading(true)
    e.preventDefault()
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
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl mb-4">Questionário de Perfil de Investidor</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <div className="mb-4">
          <label className="block">Nome:</label>
          <input name="nome" value={form.nome} onChange={handleChange} className="w-full p-2 border" required />
        </div>
        <div className="mb-4">
          <label className="block">Idade:</label>
          <select name="idade" value={form.idade} onChange={handleChange} className="w-full p-2 border" required>
            <option value="">Selecione</option>
            <option value="18-30">18-30</option>
            <option value="31-50">31-50</option>
            <option value="51-60">51-60</option>
            <option value="60+">60+</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block">Experiência em investimentos:</label>
          <select name="experiencia" value={form.experiencia} onChange={handleChange} className="w-full p-2 border" required>
            <option value="">Selecione</option>
            <option value="nenhuma">Nenhuma</option>
            <option value="alguma">Alguma</option>
            <option value="muita">Muita</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block">Tolerância ao risco:</label>
          <select name="tolerancia" value={form.tolerancia} onChange={handleChange} className="w-full p-2 border" required>
            <option value="">Selecione</option>
            <option value="baixo">Baixo</option>
            <option value="medio">Médio</option>
            <option value="alto">Alto</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block">Horizonte de investimento:</label>
          <select name="horizonte" value={form.horizonte} onChange={handleChange} className="w-full p-2 border" required>
            <option value="">Selecione</option>
            <option value="curto">Curto prazo</option>
            <option value="medio">Médio prazo</option>
            <option value="longo">Longo prazo</option>
          </select>
        </div>
        <div className='space-y-2'>
        <button type="submit" className="w-full p-2 bg-blue-500 text-white">Salvar Perfil</button>
        {
          validaPerfil && <button onClick={handleCancela} className="w-full p-2 bg-red-500 text-white">Cancelar</button>

        }
        </div>
      </form>
    </div>
  )
}