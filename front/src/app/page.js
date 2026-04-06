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
        // Verificar perfil
        checkProfile()
      }
    }
  }, [user, loading, router])

  const checkProfile = async () => {
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

  if (loading) return <div>Loading...</div>

  return <div>Redirecting...</div>
}
