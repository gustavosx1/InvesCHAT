'use client'

import { createContext, useContext, useState } from 'react'

const ChatContext = createContext()

export function ChatProvider({ children }) {
  const [globalMessages, setGlobalMessages] = useState([])
  const [globalSessionId, setGlobalSessionId] = useState(null)

  const addMessage = (message) => {
    setGlobalMessages(prev => [...prev, message])
  }

  const clearMessages = () => {
    setGlobalMessages([])
  }

  const value = {
    messages: globalMessages,
    setMessages: setGlobalMessages,
    addMessage,
    clearMessages,
    sessionId: globalSessionId,
    setSessionId: setGlobalSessionId,
  }

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export function useChatContext() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChatContext deve ser usado dentro de ChatProvider')
  }
  return context
}
