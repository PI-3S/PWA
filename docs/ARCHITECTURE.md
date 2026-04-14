# Arquitetura do Projeto - SGC

## Stack Tecnologica

| Categoria | Tecnologia | Versao |
|-----------|-----------|--------|
| Framework | React | 18.3.1 |
| Linguagem | TypeScript | 5.8.3 |
| Build | Vite | 5.4.19 |
| Roteamento | React Router DOM | 6.30.1 |
| UI Base | shadcn/ui + Radix UI | varias |
| Estilos | Tailwind CSS | 3.4.17 |
| Icons | Lucide React | 0.462.0 |
| Estado/Cache | TanStack Query | 5.83.0 |
| Auth Backend | Firebase Auth | via API REST |
| Formulario | React Hook Form + Zod | 7.61 / 3.25 |
| Toasts | Sonner | 1.7.4 |
| Testes | Vitest + Testing Library | 3.2 / 6.6 |
| E2E | Playwright | 1.57.0 |
| Package Manager | bun | - |

## Estrutura de Pastas

```
PWA/
├── docs/                          # Documentacao
│   ├── INDEX.md                   # Indice de docs
│   ├── apiguide.md                # Guia da API REST
│   └── ...                        # Demais docs
├── public/                        # Assets estaticos
│   ├── favicon.ico
│   ├── placeholder.svg
│   └── robots.txt
├── src/
│   ├── assets/                    # Imagens (logo-white.png)
│   ├── components/
│   │   ├── ui/                    # Componentes shadcn/ui (35+ arquivos)
│   │   ├── ProtectedRoute.tsx     # Guardas de rota
│   │   ├── FilterBar.tsx          # [ORFAO] Barras de filtro
│   │   ├── StatusCards.tsx        # [ORFAO] Cards de status
│   │   ├── SubmissionQueue.tsx    # [ORFAO] Fila de submissoes
│   │   ├── EvaluationDialog.tsx   # [ORFAO] Dialogo de avaliacao
│   │   └── NavLink.tsx            # Wrapper NavLink
│   ├── contexts/
│   │   └── AuthContext.tsx        # Provedor de autenticacao
│   ├── data/
│   │   └── data.ts                # Tipos, interfaces, config API
│   ├── hooks/
│   │   ├── use-toast.ts           # Hook de toast (shadcn)
│   │   └── use-mobile.tsx         # Hook de deteccao mobile
│   ├── lib/
│   │   └── utils.ts               # Utilitario cn() (clsx + twMerge)
│   ├── pages/
│   │   ├── Index.tsx              # Home - selecao de perfil
│   │   ├── Login.tsx              # Login por role (/login/:role)
│   │   ├── Admin.tsx              # Painel Super Admin
│   │   ├── Coordenador.tsx        # Painel Coordenador
│   │   ├── Aluno.tsx              # Painel Aluno
│   │   ├── NotFound.tsx           # 404
│   │   └── Professor.tsx          # [REMOVIDA] Pagina com dados mock
│   ├── services/
│   │   └── api.ts                 # apiClient (NAO UTILIZADO)
│   ├── test/
│   │   ├── setup.ts               # Setup do Vitest
│   │   └── example.test.ts        # [PLACEHOLDER]
│   ├── App.tsx                    # Rotas e providers
│   ├── App.css                    # Estilos globais
│   ├── index.css                  # Tailwind + variaveis CSS
│   ├── main.tsx                   # Entry point
│   └── vite-env.d.ts              # Tipos Vite
├── index.html                     # HTML base
├── vite.config.ts                 # Config Vite
├── tailwind.config.ts             # Config Tailwind
├── tsconfig.json                  # Config TypeScript
├── eslint.config.js               # Config ESLint
├── vitest.config.ts               # Config Vitest
├── playwright.config.ts           # Config Playwright
├── postcss.config.js              # Config PostCSS
├── components.json                # Config shadcn/ui
├── package.json                   # Dependencias
├── history.md                     # Historico de desenvolvimento
├── TASKS.md                       # Lista de tarefas
└── skills.md                      # Skills e tecnologias
```

## Fluxo de Dados Simplificado

```
Index.tsx (selecao de perfil)
    -> Login.tsx (/login/:role)
        -> AuthContext.signIn()
            -> POST /api/auth/login
            -> Salva token + usuario no localStorage
        -> ProtectedRoute verifica perfil
            -> Redireciona para /admin, /coordenador ou /aluno
```

## Backend

- **URL:** `https://back-end-banco-five.vercel.app`
- **Stack:** Node.js + Firestore (Firebase)
- **Autenticacao:** JWT via Firebase Auth
- **CORS:** Configurado no servidor
- **Documentacao completa:** `./docs/apiguide.md`

## Padroes Arquiteturais

- **Autenticacao:** Context API (AuthContext)
- **Dados da API:** Fetch direto nos componentes (sem camada de servico)
- **Cache:** TanStack Query (QueryClient no App.tsx)
- **Estado de UI:** useState local em cada componente
- **Rotas protegidas:** Componente ProtectedRoute com allowedRoles
