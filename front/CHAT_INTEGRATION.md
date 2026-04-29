/**
 * INTEGRAÇÃO DO CHAT NO LAYOUT PRINCIPAL
 * 
 * Para usar o componente ChatGemini:
 * 
 * 1. Importe em src/app/page.jsx ou qualquer página
 * 2. Adicione como um componente
 * 
 * Exemplo em src/app/layout.js:
 */

import ChatGemini from '@/components/ChatGemini';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {/* Coloque em uma rota específica, ex: */}
        {/* <ChatGemini /> */}
        {children}
      </body>
    </html>
  );
}

/**
 * OU crie uma rota dedicada: src/app/chat/page.jsx
 */

import ChatGemini from '@/components/ChatGemini';

export default function ChatPage() {
  return <ChatGemini />;
}

/**
 * ALTERNATIVA: Integrar em página existente
 * 
 * import ChatGemini from '@/components/ChatGemini';
 * 
 * export default function InvestPage() {
 *   return (
 *     <div className="grid grid-cols-3 gap-4">
 *       <div className="col-span-2">
 *         <Dashboard />
 *       </div>
 *       <div className="col-span-1">
 *         <ChatGemini />
 *       </div>
 *     </div>
 *   );
 * }
 */
