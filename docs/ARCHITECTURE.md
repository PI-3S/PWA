# Arquitetura — Maestria SGC SENAC

## 1. O que é

**Maestria** é uma PWA de gestão de atividades complementares acadêmicas. Alunos submetem certificados, coordenadores validam, super admins gerenciam cursos/usuários/regras.

---

## 2. Stack

| Categoria | Tecnologia | Versão |
|-----------|-----------|--------|
| Framework | React | 18.3.1 |
| Linguagem | TypeScript | 5.8.3 |
| Build | Vite | 5.4.19 |
| PWA | vite-plugin-pwa | 0.21.x |
| Roteamento | React Router DOM | 6.30.1 |
| Estilos | Tailwind CSS | 3.4.17 |
| UI Base | shadcn/ui + Radix UI | — |
| Ícones | Lucide React | 0.462.0 |
| Cache/Estado | TanStack Query | 5.83.0 |
| Auth | Firebase Auth (JWT) | REST API |
| Formulários | React Hook Form | 7.61.1 |
| Validação | Zod | 3.25.76 |
| Toasts | Sonner | 1.7.4 |
| Gráficos | Recharts | 2.15.4 |
| Datas | date-fns | 3.6.0 |
| Testes unit | Vitest + Testing Library | 3.2 / 6.6 |
| Testes E2E | Playwright | 1.57.0 |
| Linting | ESLint 9 | — |
| Package Manager | bun | — |

**Nota:** TanStack Query, React Hook Form e Zod estão instalados mas não usados ativamente nas pages — apenas o QueryClient está configurado no App.tsx.

---

## 3. Estrutura de Pastas

```
src/
├── assets/                  # logo-white.png
├── components/
│   ├── Footer.tsx           # Rodapé + botão PWA install (mobile only)
│   ├── ProtectedRoute.tsx   # HOC proteção de rotas por perfil
│   ├── themeswitcher.tsx    # Toggle dark/light
│   ├── ui/                  # shadcn/ui (35+ componentes Radix)
│   ├── admin/               # Seções do painel Admin
│   │   ├── DashboardSection.tsx
│   │   ├── CursosSection.tsx
│   │   ├── UsuariosSection.tsx
│   │   ├── ValidacaoSection.tsx
│   │   ├── RegrasSection.tsx
│   │   ├── CoordenadoresSection.tsx
│   │   ├── ConfiguracoesSection.tsx
│   │   └── utils.ts
│   ├── aluno/               # Seções do painel Aluno
│   │   ├── ProgressoSection.tsx
│   │   ├── SubmissaoSection.tsx
│   │   ├── HistoricoSection.tsx
│   │   └── OcrPreview.tsx
│   └── coordenador/         # Seções do painel Coordenador
│       ├── DashboardSection.tsx
│       ├── SubmissoesSection.tsx
│       ├── AlunosSection.tsx
│       ├── CadastrarSection.tsx
│       └── RegrasSection.tsx
├── contexts/
│   ├── AuthContext.tsx      # Auth global: token, user, signIn, signOut, refresh 45min
│   └── ThemeContext.tsx     # Tema dark/light global
├── data/
│   └── data.ts             # API_CONFIG.BASE_URL + tipos globais (User, etc.)
├── hooks/
│   ├── useApi.ts           # Hook centralizado apiFetch (Bearer token, logout 401/403)
│   ├── useapptheme.ts      # Hook: { theme, colors } — paleta de 28 propriedades HSL
│   └── use-mobile.tsx      # Hook: viewport < 768px
├── lib/
│   ├── constants.ts        # ACCENT colors por perfil (blue/orange/green/alunoGreen)
│   ├── toast.ts            # toastSuccess / toastError centralizados
│   └── utils.ts            # cn() para merge de classes
├── pages/
│   ├── Admin.tsx           # Painel super_admin
│   ├── Coordenador.tsx     # Painel coordenador
│   ├── Aluno.tsx           # Painel aluno
│   ├── Index.tsx           # Home — seleção de perfil
│   ├── Login.tsx           # Login com parâmetro :role
│   └── NotFound.tsx        # 404
├── services/
│   └── api.ts              # apiClient genérico — NÃO USADO pelas pages
├── types/
│   ├── admin.ts            # Interfaces do Admin
│   ├── aluno.ts            # Interfaces do Aluno (DashboardAluno, Submissao, Regra)
│   └── coordenador.ts      # Interfaces do Coordenador (DashboardMetrics, OcrData)
├── test/
│   ├── setup.ts
│   └── example.test.ts     # Placeholder (sem testes reais)
├── App.tsx                 # Router + Providers
├── index.css               # Tailwind + variáveis CSS (root = dark)
└── main.tsx
```

---

## 4. Rotas

### Públicas

| Rota | Componente | Descrição |
|------|------------|-----------|
| `/` | Index | Seleção de perfil |
| `/login/:role` | Login | Login por role |
| `/login` | Navigate | → `/` |

### Protegidas

| Rota | Componente | Roles permitidas |
|------|------------|------------------|
| `/admin/*` | Admin | `super_admin` |
| `/coordenador/*` | Coordenador | `coordenador`, `super_admin` |
| `/aluno/*` | Aluno | `aluno` |
| `*` | NotFound | — |

### Seções internas (via state, não rotas reais)

**Admin:** `dashboard` · `courses` · `users` · `validation` · `rules` · `coordinators` · `settings`

**Coordenador:** `dashboard` · `submissoes` · `regras` · `alunos` · `cadastrar`

**Aluno:** `progress` · `submit` · `history`

---

## 5. Sistema de Temas

O sistema de temas usa **inline styles** via `useAppTheme()` — não CSS variables nem `dark:` do Tailwind.

```tsx
const { colors } = useAppTheme();
// colors.textPrimary, colors.cardBg, colors.sidebarBg, etc.
```

- `ThemeContext` define `dark` ou `light`
- `useAppTheme` retorna a paleta de 28 propriedades HSL correspondente
- Classes Tailwind hardcoded (`bg-emerald-600`, `text-gray-400`) **não** respondem ao tema — usar sempre `style={{ color: colors.xxx }}`

### Cores de destaque por perfil (`src/lib/constants.ts`)

```ts
ACCENT.blue        // hsl(210, 80%, 55%)  — Admin
ACCENT.orange      // hsl(30, 95%, 55%)   — Coordenador
ACCENT.green       // hsl(152, 60%, 50%)  — aprovação (Admin/Coord)
ACCENT.alunoGreen  // hsl(160, 70%, 55%)  — Aluno
ACCENT.alunoGreenDim // hsl(160, 70%, 40%) — gradiente barra Aluno
```

---

## 6. Catálogo de Seções por Painel

### Admin

| Seção | Endpoints | Funcionalidades |
|-------|-----------|----------------|
| Dashboard | GET `/api/dashboard/coordenador` | Métricas globais, gráficos por curso/área |
| Gestão de Cursos | CRUD `/api/cursos` | Criar/editar/excluir cursos |
| Gestão de Usuários | CRUD `/api/usuarios` | Busca, filtros, geração de senha, reset, envio email |
| Validação | GET+PATCH `/api/submissoes`, GET `/api/certificados` | Aprovar/reprovar/correção + OCR preview |
| Regras | CRUD `/api/regras` | Regras por curso (área, limite horas, exige comprovante) |
| Coordenadores | CRUD `/api/coordenadores-cursos` | Vínculos usuário↔curso |
| Configurações | GET+POST `/api/configuracoes/*` | SMTP, parâmetros do sistema, teste de email |

### Coordenador

| Seção | Funcionalidades |
|-------|----------------|
| Dashboard | 5 cards de métricas + fila de prioridade (5 mais recentes) |
| Submissões | Filtro curso/status, expandir linha, PDF, OCR, aprovar/reprovar/correção |
| Alunos | Lista com barra de progresso individual |
| Cadastrar | Form cadastro de aluno |
| Regras | CRUD de regras (view do coordenador) |

### Aluno

| Seção | Funcionalidades |
|-------|----------------|
| Meu Progresso | Seletor de curso, barra de progresso, 4 cards, horas por área |
| Nova Submissão | Passo 1: área+horas+descrição; Passo 2: upload PDF/JPG/PNG drag-and-drop |
| Histórico | Tabela com badges de status, observação de correção |

---

## 7. OCR

Upload de certificado via `POST /api/certificados` (FormData) dispara extração OCR no backend:

```json
{
  "dados_ocr": {
    "nome": "string | null",
    "carga_horaria": "string | null",
    "data": "string | null",
    "instituicao": "string | null",
    "tipo": "string | null",
    "confianca": 0.0-1.0
  }
}
```

Componente `OcrPreview.tsx` exibe dados extraídos com indicador de confiança (≥0.8 verde, ≥0.5 amarelo, <0.5 vermelho) e modo de edição manual.

---

## 8. PWA

```ts
VitePWA({
  registerType: "autoUpdate",
  manifest: {
    name: "SGC - Sistema de Gestão de Atividades Complementares",
    short_name: "SGC",
    theme_color: "#1a56db",
    background_color: "#1a1f2e",
    display: "standalone",
    start_url: "/",
    icons: [
      { src: "/icons/icon-192x192.png", sizes: "192x192" },
      { src: "/icons/icon-512x512.png", sizes: "512x512", purpose: "any maskable" }
    ]
  }
})
```

Botão de instalar no `Footer.tsx` — mobile only, usa `beforeinstallprompt`.
