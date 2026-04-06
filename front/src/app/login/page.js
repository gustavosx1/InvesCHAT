'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {useAuth} from '../../../components/AuthProvider'
import { supabase } from '../../../lib/supabase'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'

export default function Login() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push('/')
    }
  }, [user, loading, router])

  if (loading) return <div>Loading...</div>

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
      <h1 className="text-2xl mb-4">InvesChat - Login</h1>
      <Auth
        supabaseClient={supabase}
        appearance={{
          theme: ThemeSupa,
          variables: {
            default: {
              colors: {
                inputText: '#ffffff',
                fieldBackground: '#1f2937',
                primaryButtonText: '#ffffff',
                brand: '#3b82f6',
                brandAccent: '#1d4ed8',
              },
            },
          },
        }}
        providers={['google', 'github']}
      />
    </div>
  )
}