'use client'

export function MarkdownMessage({ text }) {
  // Processa inline markdown (negrito, itálico, links)
  const processInline = (str) => {
    if (!str) return str
    
    // Aplicar transformações em ordem (importante para evitar conflitos)
    let processed = str
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="text-primary-blue underline">$1</a>')
    
    return processed
  }

  // Processa markdown e retorna array de elementos React
  const parseMarkdown = (text) => {
    const lines = text.split('\n')
    const elements = []
    let currentList = []
    let i = 0

    while (i < lines.length) {
      const line = lines[i]
      const trimmed = line.trim()

      // Verificar se há lista em progresso e a linha atual não é um item de lista
      if (currentList.length > 0 && !trimmed.match(/^[-*•]\s/)) {
        elements.push({
          type: 'list',
          items: currentList,
          key: `list-${i}`,
        })
        currentList = []
      }

      // H1 (# )
      if (trimmed.match(/^# /)) {
        const title = trimmed.replace(/^# /, '')
        elements.push({
          type: 'h1',
          text: title,
          key: `h1-${i}`,
        })
      }
      // H2 (## )
      else if (trimmed.match(/^## /)) {
        const title = trimmed.replace(/^## /, '')
        elements.push({
          type: 'h2',
          text: title,
          key: `h2-${i}`,
        })
      }
      // H3 (### )
      else if (trimmed.match(/^### /)) {
        const title = trimmed.replace(/^### /, '')
        elements.push({
          type: 'h3',
          text: title,
          key: `h3-${i}`,
        })
      }
      // Lista (- ou * ou •)
      else if (trimmed.match(/^[-*•]\s/)) {
        const item = trimmed.replace(/^[-*•]\s/, '')
        currentList.push(item)
      }
      // Linha vazia - pular
      else if (!trimmed) {
        // skip
      }
      // Paragráfo normal
      else {
        elements.push({
          type: 'paragraph',
          text: trimmed,
          key: `p-${i}`,
        })
      }

      i++
    }

    // Adicionar lista final se houver
    if (currentList.length > 0) {
      elements.push({
        type: 'list',
        items: currentList,
        key: `list-final`,
      })
    }

    return elements
  }

  const elements = parseMarkdown(text)

  return (
    <div className="space-y-2 text-sm leading-relaxed">
      {elements.map((el) => {
        switch (el.type) {
          case 'h1':
            return (
              <h1
                key={el.key}
                className="text-lg font-bold mt-3 mb-2 text-gray-900"
              >
                {el.text}
              </h1>
            )
          case 'h2':
            return (
              <h2
                key={el.key}
                className="text-base font-bold mt-2 mb-1 text-gray-900"
              >
                {el.text}
              </h2>
            )
          case 'h3':
            return (
              <h3
                key={el.key}
                className="text-sm font-bold mt-2 mb-1 text-gray-900"
              >
                {el.text}
              </h3>
            )
          case 'list':
            return (
              <ul key={el.key} className="list-disc list-inside space-y-1 my-2 ml-2">
                {el.items.map((item, idx) => (
                  <li
                    key={`${el.key}-item-${idx}`}
                    className="text-sm"
                    dangerouslySetInnerHTML={{
                      __html: processInline(item),
                    }}
                  />
                ))}
              </ul>
            )
          case 'paragraph':
            return (
              <p
                key={el.key}
                className="text-sm"
                dangerouslySetInnerHTML={{
                  __html: processInline(el.text),
                }}
              />
            )
          default:
            return null
        }
      })}
    </div>
  )
}
