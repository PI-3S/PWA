# Guia de Desenvolvimento — Maestria SGC SENAC

## 1. Setup

```bash
bun install     # instalar dependências
bun dev         # http://localhost:8080
bun build       # build produção
bun lint        # verificar lint
```

### Variáveis de Ambiente

| Variável | Descrição |
|----------|-----------|
| `VITE_API_BASE_URL` | URL base do backend (padrão: `https://back-end-banco-five.vercel.app`) |
| `VITE_FIREBASE_KEY` | Web API Key do Firebase para refresh de token |

### Credenciais de Teste

| Perfil | Email | Senha |
|--------|-------|-------|
| Super Admin | admin@admin.com | admin123 |
| Coordenador | coordenador@email.com | 123456 |
| Aluno | joao@email.com | 123456 |

---

## 2. Padrões de Código

### Ordem dos Hooks (CRÍTICO)

`useCallback` **sempre antes** do `useEffect` que o utiliza.

```tsx
// CERTO
const loadData = useCallback(async () => { ... }, [apiFetch]);
useEffect(() => { loadData(); }, [loadData]);

// ERRADO — "Cannot access before initialization"
useEffect(() => { loadData(); }, [loadData]);
const loadData = useCallback(async () => { ... }, [apiFetch]);
```

### Mapeamento Robusto de Campos da API

A API pode retornar campos com nomes diferentes por endpoint — sempre usar múltiplos fallbacks:

```ts
const mapped = data.map(item => ({
  aluno_nome: item.aluno_nome || item.nome_aluno || item.aluno?.nome || '—',
  curso_nome: item.curso_nome || item.nome_curso || item.curso?.nome || '—',
  horas: item.horas_solicitadas || item.carga_horaria_solicitada || 0,
}));
```

### Uso do apiFetch

```ts
// CERTO — apiFetch já retorna JSON parseado
const data = await apiFetch('/api/recurso');

// ERRADO — não chamar .json() nem checar .ok
const res = await apiFetch('/api/recurso');
const data = await res.json();
```

### Tema — Inline Styles

Nunca usar classes Tailwind hardcoded para cores (`bg-emerald-600`, `text-gray-400`). Usar sempre:

```tsx
const { colors } = useAppTheme();
// style={{ color: colors.textPrimary }}
// style={{ background: colors.cardBg }}

import { ACCENT } from '@/lib/constants';
// style={{ color: ACCENT.orange }}
```

### Toast

```ts
import { toastSuccess, toastError } from '@/lib/toast';
toastSuccess('Salvo com sucesso!');
toastError('Erro ao carregar dados.');
```

### Upload de Arquivo

`apiFetch` serializa JSON — não funciona para FormData. Para `/api/certificados` usar `fetch` direto:

```ts
const res = await fetch(`${apiBase}/api/certificados`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` },
  body: formData,  // sem Content-Type — browser define o boundary
});
```

### CRUD Completo

Todo recurso deve ter: `POST`, `GET`, `PATCH`, `DELETE`.

Proteção ao excluir — sempre verificar vínculos antes do DELETE:

```js
const vinculos = await db.collection('filhos').where('pai_id', '==', id).limit(1).get();
if (!vinculos.empty) return res.status(400).json({ error: 'Existem registros vinculados' });
```

### Checklist Antes de Commit

- [ ] `bun lint` passa
- [ ] Login funciona nos 3 perfis
- [ ] CRUD completo (POST, GET, PATCH, DELETE)
- [ ] Ordem dos hooks está correta
- [ ] Mapeamento de campos usa fallbacks
- [ ] Cores via `colors.*` ou `ACCENT.*`, não Tailwind hardcoded

---

## 3. Qualidade de Código

### Configurações Permissivas (não afetam funcionamento)

- `tsconfig.json`: `strictNullChecks: false`, `noImplicitAny: false`, `noUnusedLocals: false`
- `eslint.config.js`: `@typescript-eslint/no-unused-vars: off`

### Testes

- `src/test/example.test.ts` é placeholder (`expect(true).toBe(true)`)
- Nenhuma page, componente ou contexto tem testes reais
- Vitest e Playwright estão configurados mas sem testes escritos

---

## 4. Problemas Conhecidos

### Componentes Órfãos

Os seguintes componentes em `src/components/` têm imports quebrados e não são usados:

| Componente | Import inválido |
|------------|----------------|
| `FilterBar.tsx` | `ActivityCategory`, `categoryLabels` |
| `SubmissionQueue.tsx` | `Submission` (campos diferentes), `categoryLabels`, `statusLabels` |
| `EvaluationDialog.tsx` | `Submission` (campos diferentes), `ActivityCategory` |
| `NavLink.tsx` | Funciona mas não é importado em lugar nenhum |

### Arquivo de Serviço Não Usado

`src/services/api.ts` define `apiClient` (get/post/patch/delete) mas nenhum arquivo o importa. As pages usam `useApi` + `API_CONFIG.BASE_URL` de `@/data/data`.

### useEffects com Dependências

`AuthContext.tsx` linha ~90: `refreshAccessToken` não está no deps array do interval. Funciona corretamente em runtime (interval é recriado quando `token` muda), mas linter reclamaria.

### console.log em Produção

- `AuthContext.tsx`: `console.error` para FIREBASE_KEY ausente, `console.log` para sessão renovada
- `NotFound.tsx`: `console.error` intencional para rastreamento de 404s

### signOut usa page reload

`AuthContext.tsx:146`: `window.location.href = '/login'` recarrega a página inteira. Poderia usar `navigate()`. Baixa prioridade — funciona.

### Duplicação localStorage

`token`/`authToken` e `usuario`/`userData` têm conteúdo idêntico. Mantidos por compatibilidade histórica entre pages.

---

## 5. Melhorias Futuras

### Curto Prazo

- Remover ou corrigir componentes órfãos (FilterBar, SubmissionQueue, EvaluationDialog)
- Habilitar `strictNullChecks` no tsconfig
- Remover TODO obsoleto em AuthContext linha ~19 (feature já implementada)

### Médio Prazo

- Usar React Hook Form + Zod nos formulários (estão instalados mas não usados)
- Adicionar testes unitários reais com Vitest
- Configurar Prettier + Husky pre-commit hooks
- Migrar `fetch` inline para usar `useApi` + TanStack Query

### Longo Prazo

- Testes E2E com Playwright
- Notificações em tempo real (WebSockets)
- Modo offline completo (PWA Service Workers)
- Exportação de relatórios
