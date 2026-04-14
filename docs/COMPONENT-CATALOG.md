# Catalogo de Componentes - SGC

**Data:** 2026-04-14

## Paginas (src/pages/)

### Index.tsx
- **Rota:** `/`
- **Funcao:** Tela de selecao de perfil de acesso
- **Dependencias:** lucide-react, react-router-dom
- **UI:** 3 cards com icones (ShieldCheck, ClipboardList, GraduationCap)
- **Navega para:** `/login/:role`

### Login.tsx
- **Rota:** `/login/:role`
- **Funcao:** Formulario de login com validacao de perfil
- **Dependencias:** AuthContext, sonner, react-router-dom
- **Roles suportados:** superadmin, coordenador, aluno
- **Fluxo:** signIn -> valida perfil -> redireciona

### Admin.tsx (~875 linhas)
- **Rota:** `/admin/*`
- **Funcao:** Painel administrativo completo
- **Secoes:** dashboard, cursos, usuarios, validacao, regras, coordenadores
- **Dependencias:** fetch direto, lucide-react, shadcn/ui, sonner
- **Auth:** verificacao propria + ProtectedRoute
- **Nota:** componente muito grande, deveria ser dividido

### Coordenador.tsx (~480 linhas)
- **Rota:** `/coordenador/*`
- **Funcao:** Painel do coordenador de curso
- **Secoes:** dashboard, submissoes, alunos, cadastrar
- **Dependencias:** fetch direto, lucide-react, shadcn/ui, sonner
- **Features:** aprovar/reprovar submissoes, cadastrar alunos, ver certificados

### Aluno.tsx (~320 linhas)
- **Rota:** `/aluno/*`
- **Funcao:** Painel do aluno
- **Secoes:** progresso, nova submissao, historico
- **Dependencias:** AuthContext, fetch direto, lucide-react, shadcn/ui, sonner
- **Features:** ver horas, submeter certificados, acompanhar status

### NotFound.tsx
- **Rota:** `*` (fallback)
- **Funcao:** Pagina 404 simples

---

## Componentes de Negocio (src/components/)

### ProtectedRoute.tsx
- **Uso:** Wrapper de rotas protegidas
- **Props:** `children`, `allowedRoles?`
- **Funcao:** verifica auth + perfil antes de renderizar

### NavLink.tsx [ORFAO]
- **Uso:** Nenhum
- **Funcao:** Wrapper do NavLink do React Router com activeClassName
- **Status:** Nao utilizado em nenhum lugar

### FilterBar.tsx [ORFAO/QUEBRADO]
- **Imports quebrados:** `ActivityCategory`, `categoryLabels` de data.ts
- **Funcao original:** Barra de filtros com busca + selects

### StatusCards.tsx [ORFAO]
- **Uso:** Nenhum
- **Funcao:** 4 cards de status (pendentes, deferidas, indeferidas, ajustes)

### SubmissionQueue.tsx [ORFAO/QUEBRADO]
- **Imports quebrados:** `Submission`, `categoryLabels` de data.ts
- **Funcao original:** Tabela de submissoes com status

### EvaluationDialog.tsx [ORFAO/QUEBRADO]
- **Imports quebrados:** `Submission`, `categoryLabels`, `ActivityCategory` de data.ts
- **Funcao original:** Dialog de avaliacao de atividades com comparativo de horas

---

## Componentes UI (src/components/ui/)

Componentes shadcn/ui padrao (35+ arquivos):
- accordion, alert-dialog, alert, aspect-ratio, avatar, badge, breadcrumb
- button, calendar, card, carousel, chart, checkbox, collapsible
- command, context-menu, dialog, drawer, dropdown-menu, form
- hover-card, input-otp, input, label, menubar, navigation-menu
- pagination, popover, progress, radio-group, resizable, scroll-area
- select, separator, sheet, sidebar, skeleton, slider, sonner
- switch, table, tabs, textarea, toggle-group, toggle, tooltip, toast, toaster, use-toast

---

## Contexts (src/contexts/)

### AuthContext.tsx
- **Exports:** `AuthProvider`, `useAuth`
- **State:** `user`, `token`, `loading`
- **Funcoes:** `signIn`, `signOut`, `refreshAccessToken`
- **Refresh:** a cada 45 min via Firebase securetoken API

---

## Hooks (src/hooks/)

### use-toast.ts
- Hook de toast do shadcn/ui

### use-mobile.tsx
- Hook que retorna `boolean` baseado em largura de tela (breakpoint 768px)

---

## Servicos (src/services/)

### api.ts [NAO UTILIZADO]
- `apiClient` com metodos: `get`, `post`, `patch`, `delete`
- Le `authToken` do localStorage automaticamente
- **Nenhum componente usa este modulo**

---

## Dados (src/data/)

### data.ts
- Tipos: `UserPerfil`, `SubmissionStatus`, `User`, `Submission`
- Config: `API_CONFIG` (BASE_URL, FIREBASE_KEY, ENDPOINTS)
- Labels: `statusLabels`, `perfilLabels`

---

## Utils (src/lib/)

### utils.ts
- `cn(...inputs)` - utilitario para merge de classes Tailwind (clsx + twMerge)
