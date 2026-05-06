import { AuthProvider } from '../../components/AuthProvider'
import { ChatProvider } from '../components/ChatProvider'
import './globals.css'

export const metadata = {
  title: 'InvesChat',
  description: 'Seu assistente inteligente de investimentos',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>
          <ChatProvider>
            {children}
          </ChatProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
