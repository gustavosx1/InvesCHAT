'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../components/AuthProvider'
import { supabase } from '../../../lib/supabase'
import {LogOut, Calculator} from "lucide-react"

export default function Chat() {
  const { user } = useAuth()
  const router = useRouter()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sessionId, setSessionId] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }
  const SUGESTOES = [
    "Qual a cotação do dólar hoje?",
    "Qual a cotação do euro hoje?",
    "O que é renda fixa?",
    "O que são ações?",
    "Por que a poupança rende tão pouco?",
    "Qual é a diferença entre ações e renda fixa?",
    "O que é o CDI?",
    "Quanto rende o CDI hoje?",
    "Quanto rende o Tesouro Selic hoje?",
    "O que são FIIs?",
    "Como funciona o Tesouro Direto?",
    "O que é a taxa SELIC?",
    "O que é a reunião do COPOM?",
    "Qual é a importância do IPCA?",
    "O que é IPCA?",
    "Quanto foi o IPCA nos últimos 12 meses?",
    "Qual a importância do perfil de investidor?",
    "Como calcular o rendimento de uma ação?",
    "Qual o valor do bitcoin hoje?",
    "O que é uma carteira de investimentos?",
    "Como diversificar meus investimentos?",
    "O que é risco de mercado?",
    "O que é risco de crédito?",
    "O que é risco de liquidez?",
    "O que é uma debênture?",
    "O que é um CDB?",
    "O que é um fundo de investimento?",
    "O que é um ETF?",
    "O que são ações preferenciais e ordinárias?",
    "O que são CRI's e CRA's?",
    "O que é uma LCI e LCA?",
    "O que é um fundo multimercado?",
    "O que é um fundo de ações?",
    "O que é um fundo de renda fixa?",
    "O que é um fundo cambial?",
    "O que é um fundo de crédito privado?",
    "O que é um fundo de índice (ETF)?",
    "O que são BDRs?",
    "Quais as notícias da semana?",
  ]

  const random = Math.floor(Math.random() * SUGESTOES.length)
  useEffect(scrollToBottom, [messages])

  useEffect(() => {
    if (!user){
        return
    }
    //cria nova sessão do ChatBot
    fetch('/api/chat/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({user_id: user.id})
    })
    .then(res => res.json())
    .then(data => setSessionId(data.sessionId))
  }, [user])

  const sendMessage = async () => {
    if (!user || !sessionId) return
    if (!input.trim()) return

    const userMessage = { role: 'user', text: input }
    setMessages([...messages, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pergunta: input, session_id: sessionId, user_id: user.id })
      })

      const data = await response.json()
      console.log('Resposta do backend:', data)
      const botMessage = { role: 'bot', text: data.resposta }
      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      const errorMessage = { role: 'bot', text: 'Desculpe, ocorreu um erro. Tente novamente.' }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handlePerfil = () => {
    router.push('/PerfilForm')
  }

  const handleInvest = () => {
    router.push('/InvestPage')
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header - Fixed/Sticky */}
      <div className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200 px-3 py-3 sm:px-6 sm:py-4">
        <div className="max-w-4xl mx-auto flex flex-col gap-3 sm:flex-row justify-between items-center">
          <img src="/logo.png" alt="InvesChat Logo" className="h-10 sm:h-12 object-contain" />
          <div className="flex flex-wrap gap-2 justify-center sm:justify-end">
            <button onClick={handleInvest} className="btn-outline-blue text-xs sm:text-sm px-3 sm:px-4 py-2 whitespace-nowrap">
              <Calculator className='inline-block w-3 h-3 sm:w-4 sm:h-4 mr-1' />
              Simular
            </button>
            <button onClick={handlePerfil} className="btn-outline-blue text-xs sm:text-sm px-3 sm:px-4 py-2 whitespace-nowrap">
              👤 Perfil
            </button>
            <button onClick={handleLogout} className="btn-outline-red text-xs sm:text-sm px-3 sm:px-4 py-2 whitespace-nowrap">
              <LogOut className="inline-block w-3 h-3 sm:w-4 sm:h-4 mr-1 mb-1" />
              Sair
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-primary-blue to-primary-green flex items-center justify-center">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Bem-vindo ao InvesChat!</h3>
              <p className="text-gray-500">Notícias e dados em tempo real do mercado financeiro</p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                msg.role === 'user'
                  ? 'bg-primary-blue text-white rounded-br-sm'
                  : 'bg-white text-gray-800 rounded-bl-sm shadow-sm border border-gray-100'
              }`}>
                <p className="text-sm leading-relaxed">{msg.text}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm border border-gray-100">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-primary-blue rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-primary-blue rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-primary-blue rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input - Fixed/Sticky at bottom */}
      <div className="sticky bottom-0 z-50 bg-white border-t border-gray-200 p-3 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col gap-2 sm:gap-4 sm:flex-row">
            <div className="flex-1 min-w-0">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isLoading && sendMessage()}
                className="input-modern text-sm w-full"
                placeholder={SUGESTOES[random]}
                disabled={isLoading}
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px] sm:min-w-[140px] text-sm px-3 sm:px-4 py-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
              ) : (
                'Enviar'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}