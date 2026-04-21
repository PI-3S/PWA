# Catálogo de Componentes - SGC

**Data:** 2026-04-21 (ATUALIZADO)

## Páginas (src/pages/)

### Index.tsx
- **Rota:** `/`
- **Função:** Tela de seleção de perfil de acesso
- **Dependências:** lucide-react, react-router-dom
- **UI:** 3 cards com ícones (ShieldCheck, ClipboardList, GraduationCap)
- **Navega para:** `/login/:role`

### Login.tsx
- **Rota:** `/login/:role`
- **Função:** Formulário de login com validação de perfil
- **Dependências:** AuthContext, sonner, react-router-dom
- **Roles suportados:** superadmin, coordenador, aluno
- **Features:** 
  - Login com validação de perfil
  - **Esqueci minha senha** com Dialog + integração `/api/auth/forgot-password`
- **Fluxo:** signIn -> valida perfil -> redireciona

### Admin.tsx (~1730 linhas)
- **Rota:** `/admin/*`
- **Função:** Painel administrativo completo
- **Seções:**
  - Dashboard com métricas e gráficos
  - Gestão de Cursos (CRUD completo)
  - Gestão de Usuários (CRUD + gerador de senha + email)
  - Validação de Submissões (aprovar/reprovar/correção)
  - Regras de Atividades (CRUD completo)
  - Vínculos Coordenador-Curso
  - **Configurações** (email SMTP + sistema + cores)
- **Dependências:** AuthContext, useAppTheme, lucide-react, shadcn/ui, sonner
- **Features:**
  - Enrichment de dados via chamadas paralelas
  - Mapeamento robusto com fallbacks
  - Gerador de senha forte (12 chars + símbolos)
  - Modal de confirmação com copy/email
  - Teste de email SMTP

### Coordenador.tsx (~550 linhas)
- **Rota:** `/coordenador/*`
- **Função:** Painel do coordenador de curso
- **Seções:** dashboard, submissões, alunos, cadastrar
- **Dependências:** AuthContext, useAppTheme, useIsMobile, lucide-react, shadcn/ui, sonner
- **Features:**
  - Dashboard com métricas por curso
  - Validação de submissões (aprovar/reprovar/correção)
  - Cadastro de novos alunos
  - Cálculo de progresso por aluno
  - Layout responsivo mobile/desktop
  - **Enrichment de dados** via chamadas paralelas (usuários, cursos, regras)

### Aluno.tsx (~670 linhas)
- **Rota:** `/aluno/*`
- **Função:** Painel do aluno
- **Seções:** progresso, nova submissão, histórico
- **Dependências:** AuthContext, useAppTheme, useIsMobile, lucide-react, shadcn/ui, sonner
- **Features:**
  - Seletor de curso
  - Dashboard de progresso com barra visual
  - Horas por área com limites
  - **Upload de certificado redesenhado:**
    - Drag-and-drop funcional
    - Aviso de limite 4MB
    - Feedback visual claro
    - Botão para remover/trocar arquivo
  - Histórico de submissões com status
  - Observações de correção visíveis
  - Layout ocupando tela inteira

### NotFound.tsx
- **Rota:** `*` (fallback)
- **Função:** Página 404 simples

---

## Componentes de Négocio (src/components/)

### ProtectedRoute.tsx
- **Uso:** Wrapper de rotas protegidas
- **Props:** `children`, `allowedRoles?`
- **Função:** verifica auth + perfil antes de renderizar
- **Acessa localStorage:** `authToken`, `token`, `usuario`, `userData`

### NavLink.tsx [ÓRFÃO]
- **Uso:** Nenhum
- **Função:** Wrapper do NavLink do React Router com activeClassName
- **Status:** Não utilizado em nenhum lugar

### FilterBar.tsx [ÓRFÃO/QUEBRADO]
- **Imports quebrados:** `ActivityCategory`, `categoryLabels` de data.ts
- **Função original:** Barra de filtros com busca + selects

### StatusCards.tsx [ÓRFÃO]
- **Uso:** Nenhum
- **Função:** 4 cards de status (pendentes, deferidas, indeferidas, ajustes)

### SubmissionQueue.tsx [ÓRFÃO/QUEBRADO]
- **Imports quebrados:** `Submission`, `categoryLabels` de data.ts
- **Função original:** Tabela de submissões com status

### EvaluationDialog.tsx [ÓRFÃO/QUEBRADO]
- **Imports quebrados:** `Submission`, `categoryLabels`, `ActivityCategory` de data.ts
- **Função original:** Dialog de avaliação de atividades com comparativo de horas

---

## Componentes UI (src/components/ui/)

Componentes shadcn/ui padrão (35+ arquivos):
- accordion, alert-dialog, alert, aspect-ratio, avatar, badge, breadcrumb
- button, calendar, card, carousel, chart, checkbox, collapsible
- command, context-menu, dialog, drawer, dropdown-menu, form
- hover-card, input-otp, input, label, menubar, navigation-menu
- pagination, popover, progress, radio-group, resizable, scroll-area
- select, separator, sheet, sidebar, skeleton, slider, sonner
- switch, table, tabs, textarea, toggle-group, toggle, tooltip, toast, toaster, use-toast

---

## Hooks Personalizados (src/hooks/)

### useAppTheme.ts
- **Uso:** Retorna `colors` e `toggleTheme`
- **Estado:** tema atual (salvo em localStorage)
- **Função:** Gerenciar cores dinâmicas do app

### use-mobile.tsx
- **Uso:** Retorna `isMobile: boolean`
- **Breakpoint:** 768px
- **Função:** Responsividade condicional

---

## Contexts (src/contexts/)

### AuthContext.tsx
- **Exports:** `AuthProvider`, `useAuth`
- **State:** `user`, `token`, `loading`
- **Funções:** `signIn`, `signOut`, `refreshAccessToken`
- **Refresh:** a cada 45 min via Firebase securetoken API
- **Chaves localStorage:** `token`, `authToken`, `usuario`, `userData`, `refreshToken`, `tokenExpiry`

---

## Serviços (src/services/)

### api.ts [NÃO UTILIZADO]
- `apiClient` com métodos: `get`, `post`, `patch`, `delete`
- Lê `authToken` do localStorage automaticamente
- **Nenhum componente usa este módulo diretamente**
- **Nota:** Admin, Coordenador e Aluno usam fetch inline

---

## Dados (src/data/)

### data.ts
- Tipos: `UserPerfil`, `SubmissionStatus`, `User`, `Submission`
- Config: `API_CONFIG` (BASE_URL, FIREBASE_KEY, ENDPOINTS)
- Labels: `statusLabels`, `perfilLabels`

---

## Utils (src/lib/)

### utils.ts
- `cn(...inputs)` - utilitário para merge de classes Tailwind (clsx + twMerge)

### themes.ts
- Constantes de cores para temas (light/dark)
- Usado por `useAppTheme` hook

---

## Assets (src/assets/)

- `logo-white.png` - Logo do sistema
- `logo.svg` - Logo em vetores

---

## Estatísticas

| Categoria | Quantidade |
|-----------|------------|
| Páginas | 5 |
| Componentes de Negócio | 6 (4 órfãos) |
| Componentes UI (shadcn) | 35+ |
| Hooks Personalizados | 2 |
| Contexts | 1 |
| Serviços | 1 (não usado) |
| Linhas de Código | ~15,000 |