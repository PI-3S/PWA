# Skills & Tecnologias Reais - SGC Project

**Data:** 2026-04-14

## Stack Confirmada (nao planejada)

| Categoria | Tecnologia | Versao | Status |
|-----------|-----------|--------|--------|
| Framework | React | 18.3.1 | Em uso |
| Linguagem | TypeScript | 5.8.3 | Em uso |
| Build | Vite | 5.4.19 | Em uso |
| Roteamento | React Router DOM | 6.30.1 | Em uso |
| UI Base | shadcn/ui + Radix UI | varias | Em uso |
| Estilos | Tailwind CSS | 3.4.17 | Em uso |
| Icones | Lucide React | 0.462.0 | Em uso |
| Estado/Cache | TanStack Query | 5.83.0 | Em uso (QueryClient no App) |
| Auth Backend | Firebase Auth | REST API | Em uso |
| Formulários | React Hook Form | 7.61.1 | Instalado (nao usado nas pages) |
| Validacao | Zod | 3.25.76 | Instalado (nao usado nas pages) |
| Toasts | Sonner | 1.7.4 | Em uso |
| Utilitario CSS | tailwind-merge + clsx | - | Em uso (cn()) |
| Testes Unit | Vitest + Testing Library | 3.2 + 6.6 | Configurado, sem testes reais |
| Testes E2E | Playwright | 1.57.0 | Configurado, sem testes |
| Lint | ESLint 9 + tseslint | - | Configurado (regras permissivas) |
| Package Manager | bun | - | Em uso |

## Habilidades Tecnicas Implementadas

### Autenticacao e Autorizacao
- [x] Login multi-role (super_admin, coordenador, aluno)
- [x] Refresh token automatico a cada 45min
- [x] Validacao de perfil no Login.tsx e ProtectedRoute
- [x] Redirecionamento inteligente baseado em perfil
- [x] Compatibilidade entre diferentes padroes de localStorage

### Gerenciamento de Estado
- [x] Context API para estado global de autenticacao
- [x] Persistencia de sessao com localStorage
- [x] TanStack Query Provider (mas dados sao fetch direto)

### UI/UX
- [x] Design com variaveis HSL inline para theming
- [x] Temas dinamicos por tipo de usuario (cores diferentes por painel)
- [x] Glassmorphism e efeitos visuais
- [x] Feedback visual com toasts (Sonner)
- [x] Estados de loading com Loader2
- [x] Preview de certificados em iframe

### Integracao com API
- [x] Fetch API com headers Bearer token
- [x] Tratamento de erros HTTP com toast
- [x] Tipagem TypeScript para respostas da API
- [ ] apiClient genérico existe mas NAO e utilizado
- [ ] Sem retry automatico para 401

### DevOps & Deploy
- [x] Variaveis de ambiente para API URL (.env)
- [x] Build otimizado para producao
- [x] Backend em Vercel

## Habilidades NAO Implementadas (instaladas mas nao usadas)

- [ ] React Hook Form (instalado, nao usado nas pages)
- [ ] Zod (instalado, nao usado nas pages)
- [ ] WebSockets para notificacoes real-time
- [ ] Service Workers para PWA offline
- [ ] Storybook para documentacao de componentes
- [ ] CI/CD com GitHub Actions
- [ ] Monitoramento com Sentry
- [ ] Husky para git hooks
- [ ] Prettier configurado

## Padroes Utilizados

### Padroes React
- **Context Provider** (AuthProvider)
- **Custom Hooks** (useAuth, useIsMobile, useToast)
- **Render Props** (ProtectedRoute)
- **Controlled Components** (todos os formularios)

### Padroes nao Utilizados (mas instalados)
- **React Hook Form** para formularios complexos
- **Zod** para validacao de schemas
- **Form** do shadcn/ui (wrapper de React Hook Form)

## Arquitetura Atual

- **Feature-based** structure (pages por role)
- **Fetch inline** nos componentes (sem camada de servico)
- **Estado local** via useState em cada componente
- **Auth centralizada** no AuthContext (mas com leaks)

## Coisas a Melhorar

### Curto Prazo
- [ ] Centralizar todas as chamadas HTTP (usar apiClient ou hook)
- [ ] Unificar logout entre paineis
- [ ] Corrigir componentes orfaos (FilterBar, SubmissionQueue, EvaluationDialog)
- [ ] Habilitar strictNullChecks
- [ ] Adicionar testes reais

### Medio Prazo
- [ ] Usar React Hook Form + Zod nos formularios
- [ ] Dividir Admin.tsx (875 linhas) em componentes menores
- [ ] Adicionar Prettier configurado
- [ ] Configurar Husky pre-commit hooks

### Longo Prazo
- [ ] Testes unitarios e de integracao
- [ ] Testes E2E com Playwright
- [ ] PWA completo com Service Workers
- [ ] Notificacoes em tempo real (WebSockets)
