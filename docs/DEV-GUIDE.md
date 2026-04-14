# Guia de Desenvolvimento - SGC

**Data:** 2026-04-14

## Como Rodar o Projeto

```bash
# Instalar dependencias
bun install

# Desenvolvimento
bun dev          # http://localhost:8080

# Build
bun build        # Producao
bun build:dev    # Desenvolvimento

# Lint
bun lint

# Testes
bun test         # Vitest run
bun test:watch   # Vitest watch
```

## Estrutura de Pastas

Consultar `./docs/architecture.md` para o mapa completo.

## Padroes de Codigo

### Import Path Alias
```typescript
// Use @/ para imports do src
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
```

### Autenticacao
- **SEMPRE** usar `useAuth()` do `AuthContext` para acessar `user`, `token`, `signOut`
- **NAO** ler `localStorage` diretamente para auth - usar o contexto
- Headers de API: `Authorization: Bearer ${token}`

### Chamadas de API
- **Preferir:** criar hooks ou servicos centralizados
- **Evitar:** `fetch` inline espalhado pelos componentes
- Tratar erros sempre com feedback visual (toast)

### Toasts
```typescript
import { toast } from 'sonner';
toast.success('Sucesso!');
toast.error('Erro!');
toast.warning('Atencao!');
```

### Classes CSS
- Usar classes Tailwind com `cn()` de `@/lib/utils`
- Cores usam padrao HSL inline via `style={{}}`
- Classes customizadas (`glass-card`, `futuristic-bg`) podem nao estar definidas

## Credenciais de Teste

| Perfil | Email | Senha |
|--------|-------|-------|
| Super Admin | admin@admin.com | admin123 |
| Coordenador | coordenador@email.com | 123456 |
| Aluno | joao@email.com | 123456 |

## Perfis de Acesso

| Perfil | Valor | Painel |
|--------|-------|--------|
| Super Admin | `super_admin` | `/admin` |
| Coordenador | `coordenador` | `/coordenador` |
| Aluno | `aluno` | `/aluno` |

## Adicionar Nova Rota

1. Criar pagina em `src/pages/`
2. Registrar em `src/App.tsx` com `ProtectedRoute` se necessario
3. Definir `allowedRoles` conforme perfil

## Adicionar Novo Endpoint de API

1. Consultar `./docs/apiguide.md` para o formato do endpoint
2. Se reusavel, adicionar em `src/services/api.ts`
3. Tratar erros com toast

## Environment Variables

| Variavel | Descricao | Obrigatorio |
|----------|-----------|------------|
| `VITE_API_BASE_URL` | URL da API | Nao (fallback para Vercel) |
| `VITE_FIREBASE_KEY` | Firebase Web API Key | Sim (para refresh token) |

## Coisas para Nao Fazer

- **NAO** adicionar novas leituras diretas de `localStorage` para auth
- **NAO** criar novas chaves localStorage sem documentar
- **NAO** duplicar logica de HTTP entre componentes
- **NAO** usar status alem de `pendente`, `aprovado`, `reprovado`
- **NAO** assumir que campos da API sao consistentes (verificar sempre)

## Checklist Antes de Commit

- [ ] `bun lint` passa sem erros
- [ ] Login funciona nos 3 perfis
- [ ] ProtectedRoute bloqueia acesso sem auth
- [ ] Logout limpa sessao corretamente
- [ ] API calls funcionam com token valido
