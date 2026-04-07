'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../components/AuthProvider'
import { supabase } from '../../../lib/supabase'

export default function Chat() {
  const { user } = useAuth()
  const router = useRouter()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sessionId, setSessionId] = useState(null)

  useEffect(() => {
    if (!user){
        return
    }
    //cria nova sessão do ChatBot
    fetch('http://localhost:8000/api/new-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({user_id: user.id})
    })
    .then(res => res.json())
    .then(data => setSessionId(data.session_id))
  }, [user])

  const sendMessage = async () => {
    if (!user || !sessionId) return
    if (!input.trim()) return

    const userMessage = { role: 'user', text: input }
    setMessages([...messages, userMessage])
    setInput('')

    const response = await fetch('http://localhost:8000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pergunta: input, session_id: sessionId, user_id: user.id })
    })

    const data = await response.json()
    console.log('Resposta do backend:', data)
    const botMessage = { role: 'bot', text: data.resposta }
    setMessages(prev => [...prev, botMessage])
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handlePerfil = () => {
    router.push('/PerfilForm')
  }
  
if (!user) {
  return <div>Carregando...</div>
}
  return (
    <div className="flex flex-col h-screen">
      <div className="p-4 border-b flex justify-between">
        <h1>InvesChat</h1>
        <div className="space-x-2">
        <button onClick={handleLogout} className="p-2 bg-purple-500 text-white">Invest</button>
        <button onClick={handlePerfil} className="p-2 bg-yellow-500 text-white">Perfil</button>
        <button onClick={handleLogout} className="p-2 bg-red-500 text-white">Logout</button>
      </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`mb-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
            <span className={`inline-block p-2 rounded ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}>
              {msg.text}
            </span>
          </div>
        ))}
      </div>
      <div className="p-4 border-t">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          className="w-full p-2 border"
          placeholder="Digite sua pergunta..."
        />
        <button onClick={sendMessage} className="mt-2 w-full p-2 bg-green-500 text-white">Enviar</button>
      </div>
    </div>
  )
}