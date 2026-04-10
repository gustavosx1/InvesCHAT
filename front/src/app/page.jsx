'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../components/AuthProvider'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login')
      } else {
        checkPerfil()
      }
    }
  }, [user, loading, router])

  const checkPerfil = async () => {
    const { supabase } = await import('../../lib/supabase')
    const { data, error } = await supabase
      .from('perfil_teste')
      .select('perfil')
      .eq('id', user.id)
      .single()

    if (error || !data) {
      router.push('/PerfilForm')
    } else {
      router.push('/Chat')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Carregando InvesChat...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="text-center max-w-2xl">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <span className="text-4xl">💬</span>
        </div>
        <h1 className="text-5xl font-bold text-white mb-4">InvesChat</h1>
        <p className="text-xl text-white/90 mb-8 leading-relaxed">
          Seu assistente inteligente de investimentos. Receba conselhos personalizados e gerencie sua carteira com facilidade.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white">
            <div className="text-2xl mb-2">🤖</div>
            <h3 className="font-semibold mb-1">Chat Inteligente</h3>
            <p className="text-sm text-white/80">Converse com nosso AI sobre investimentos</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white">
            <div className="text-2xl mb-2">📊</div>
            <h3 className="font-semibold mb-1">Análise de Carteira</h3>
            <p className="text-sm text-white/80">Acompanhe seus investimentos em tempo real</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white">
            <div className="text-2xl mb-2">🎯</div>
            <h3 className="font-semibold mb-1">Perfil Personalizado</h3>
            <p className="text-sm text-white/80">Recomendações baseadas no seu perfil</p>
          </div>
        </div>
        <div className="mt-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
          <p className="text-white/80 text-sm mt-2">Redirecionando...</p>
        </div>
      </div>
    </div>
  )
}
