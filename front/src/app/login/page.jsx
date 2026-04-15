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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center gradient-bg">
      <div className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">InvesChat</h1>
          <p className="text-white/80">Seu assistente de investimentos inteligente</p>
        </div>

        <div className="card">
          <h2 className="text-2xl font-semibold text-center mb-6 text-gradient">Entrar na sua conta</h2>
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#0F5D98',
                    brandAccent: '#418133',
                    inputBackground: '#ffffff',
                    inputBorder: '#e5e7eb',
                    inputBorderFocus: '#0F5D98',
                    inputBorderHover: '#418133',
                  },
                  space: {
                    inputPadding: '12px',
                  },
                  borderWidths: {
                    buttonBorderWidth: '2px',
                    inputBorderWidth: '2px',
                  },
                  radii: {
                    borderRadiusButton: '8px',
                    buttonBorderRadius: '8px',
                    inputBorderRadius: '8px',
                  },
                },
              },
              className: {
                container: 'space-y-4',
                button: 'btn-primary w-full',
                input: 'input-modern',
                label: 'text-gray-700 font-medium',
              },
            }}
            providers={['google', 'github']}
            localization={{
              variables: {
                sign_in: {
                  email_label: 'Endereço de email',
                  password_label: 'Senha',
                  button_label: 'Entrar',
                  loading_button_label: 'Entrando...',
                  social_provider_text: 'Entrar com {{provider}}',
                  link_text: 'Já tem uma conta? Entre',
                },
                sign_up: {
                  email_label: 'Endereço de email',
                  password_label: 'Senha',
                  button_label: 'Cadastrar',
                  loading_button_label: 'Cadastrando...',
                  social_provider_text: 'Cadastrar com {{provider}}',
                  link_text: 'Não tem uma conta? Cadastre-se',
                },
              },
            }}
          />
        </div>

        <div className="text-center mt-6">
          <p className="text-white/60 text-sm">
            Ao continuar, você concorda com nossos Termos de Serviço
          </p>
        </div>
      </div>
    </div>
  )
}