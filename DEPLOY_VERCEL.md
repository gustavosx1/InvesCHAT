# Deploy no Vercel - Guia Completo

## ❌ Problema Encontrado

Sua estrutura do repositório é:
```
invesChat/
├── front/           ← Aqui está o código Next.js
├── vercel.json      ← Configuração para o Vercel
└── .git/
```

O Vercel estava procurando o `package.json` na raiz do repositório, não em `./front/`.

## ✅ Solução

### Opção 1: Usar o vercel.json (Recomendado)

O arquivo `vercel.json` já foi criado na raiz do seu repositório. Agora:

1. **Faça push das mudanças:**
   ```bash
   git add vercel.json
   git commit -m "Add Vercel configuration for monorepo structure"
   git push
   ```

2. **Redeploye no Vercel:**
   - Vá em https://vercel.com/dashboard
   - Selecione seu projeto
   - Clique em **Settings** → **General**
   - Remova qualquer configuração de "Root Directory" customizada
   - Clique em **Deployments** → **Redeploy** no último deployment
   - Ou faça um novo push (que vai disparar automático)

### Opção 2: Usar Vercel CLI (Alternativa)

```bash
cd /home/gusta/projetos/projetos-python/invesChat
vercel --prod
```

### Opção 3: Conectar só a pasta front (Menos Recomendado)

Se quiser apenas a pasta `front` no Vercel:

1. Crie um novo repositório GitHub apenas com a pasta `front`
2. Ou use: `git subtree push --prefix front origin deploy`

## 🔧 Variáveis de Ambiente

Certifique-se que no Vercel estão configuradas:

- `NEXT_PUBLIC_GEMINI_API_KEY` - Sua chave do Gemini
- `NEXT_PUBLIC_SUPABASE_URL` - URL do Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Chave anon do Supabase
- `NEXT_PUBLIC_BRAPI_API_KEY` - (Opcional) Chave da BrAPI

**Para adicionar:**
1. Vá em **Settings** → **Environment Variables**
2. Adicione cada uma
3. Redeploy

## 📋 Checklist de Deploy

- [ ] `vercel.json` criado na raiz do repositório
- [ ] `git push` com as mudanças
- [ ] Variáveis de ambiente configuradas no Vercel
- [ ] Redeployed
- [ ] Domínio apontado para o projeto Vercel (não para "front")

## ❓ Se ainda não funcionar

1. Limpe o cache:
   ```bash
   vercel env pull       # Baixa vars
   vercel build          # Faz build localmente
   ```

2. Verifique logs:
   ```bash
   vercel logs --prod
   ```

3. Reinicie o deployment:
   - Vá em Vercel Dashboard
   - **Deployments** → Clique no último
   - **...** → **Redeploy**
