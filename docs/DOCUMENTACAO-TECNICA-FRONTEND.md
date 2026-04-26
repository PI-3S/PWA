# Documentação Técnica do Frontend — SGC SENAC

## 1. Visão Geral do Sistema

### 1.1 O que é

O **SGC (Sistema de Gestão de Certificados)** é uma aplicação web PWA desenvolvida para o SENAC que permite o gerenciamento de atividades complementares acadêmicas. Alunos submetem certificados de atividades (extensão, pesquisa, monitoria, etc.), coordenadores validam essas submissões e administradores gerenciam cursos, usuários e regras do sistema.

### 1.2 Problema que resolve

- **Alunos**: Submetem atividades complementares e acompanham o status de validação em tempo real.
- **Coordenadores**: Analisam, aprovam, reprovam ou solicitam correção de submissões dos alunos vinculados aos seus cursos, com suporte a múltiplos cursos.
- **Super Admin**: Gerencia cursos, usuários, regras de atividade, vínculos de coordenadores e configurações globais.

### 1.3 Perfis de Usuário

| Perfil | Descrição |
|--------|-----------|
| `aluno` | Submete certificados, acompanha progresso e histórico |
| `coordenador` | Avalia submissões dos alunos do seu curso |
| `super_admin` | Gerencia todo o sistema (admin) |

---

## 2. Stack Tecnológica

### 2.1 Dependências Principais

| Tecnologia | Versão | Papel |
|-----------|--------|-------|
| React | 18.3.1 | Framework UI |
| TypeScript | 5.8.3 | Tipagem estática |
| Vite | 5.4.19 | Bundler e dev server |
| vite-plugin-pwa | 0.21.x | Progressive Web App |
| React Router DOM | 6.x | Roteamento |
| Tailwind CSS | 3.4.x | Estilização utilitária |
| shadcn/ui (Radix UI) | 1.x | Componentes acessíveis |
| Lucide React | 0.462.0 | Ícones |
| Sonner | 1.7.4 | Notificações toast |
| React Hook Form + Zod | 7.x / 3.25.x | Validação de formulários |
| next-themes | 0.3.0 | Theme switching |
| Firebase (Auth) | SDK Web | Autenticação via token JWT |

---

## 3. Estrutura de Pastas

```
src/
├── components/
│   ├── Footer.tsx                    # Rodapé com botão PWA install
│   ├── ProtectedRoute.tsx           # Wrapper de rotas protegidas
│   ├── themeswitcher.tsx            # Troca de tema claro/escuro
│   ├── ui/                          # Componentes shadcn/ui
│   │   ├── button.tsx, input.tsx, select.tsx, dialog.tsx...
│   │   └── sonner.tsx, use-toast.ts # Sistema de notificações
│   ├── admin/                        # Componentes do Admin (super_admin)
│   │   ├── DashboardSection.tsx
│   │   ├── CoordenadoresSection.tsx
│   │   ├── CursosSection.tsx
│   │   ├── RegrasSection.tsx
│   │   ├── UsuariosSection.tsx
│   │   ├── ValidacaoSection.tsx
│   │   ├── ConfiguracoesSection.tsx
│   │   └── utils.ts
│   ├── aluno/                        # Componentes do Aluno (refatorados)
│   │   ├── ProgressoSection.tsx      # Barra de progresso + métricas
│   │   ├── SubmissaoSection.tsx      # Formulário 2 passos + upload
│   │   └── HistoricoSection.tsx      # Tabela de submissões
│   └── coordenador/                  # Componentes do Coordenador
│       ├── DashboardSection.tsx
│       ├── SubmissoesSection.tsx
│       ├── CadastrarSection.tsx
│       └── AlunosSection.tsx
├── contexts/
│   ├── AuthContext.tsx              # Auth + token refresh automático
│   └── ThemeContext.tsx             # Tema claro/escuro
├── data/
│   └── data.ts                      # Config da API + constantes globais
├── hooks/
│   ├── useapptheme.ts              # Hook de cores do tema
│   └── use-mobile.tsx             # Detecção mobile
├── lib/
│   └── utils.ts                    # Utilitários cn() para shadcn
├── pages/
│   ├── Admin.tsx                   # Área do super_admin
│   ├── Aluno.tsx                   # Área do aluno
│   ├── Coordenador.tsx             # Área do coordenador
│   ├── Index.tsx                   # Landing page
│   ├── Login.tsx                   # Página de login
│   └── NotFound.tsx                # 404
├── services/
│   └── api.ts                      # Cliente HTTP genérico (get/post/patch/delete)
├── types/
│   ├── admin.ts                    # Interfaces do Admin
│   ├── aluno.ts                    # Interfaces do Aluno (DashboardAluno, Submissao, Regra, etc.)
│   └── coordenador.ts              # Interfaces do Coordenador (DashboardMetrics, Submissao, etc.)
├── App.tsx                         # Router + Providers
├── main.tsx                        # Entry point
└── vite-env.d.ts
```

---

## 4. Componentes Refatorados (Aluno)

### 4.1 ProgressoSection.tsx

**Props recebidas:**
```ts
apiFetch: (path: string, opts?: RequestInit) => Promise<any>
cursos: AlunoCurso[]
selectedCurso: string
onSelectCurso: (id: string) => void
toastError: (msg: string) => void
colors: ReturnType<typeof useAppTheme>['colors']
accentGreen: string
accentGreenDim: string
```

**Estados internos:** `dashboard` (DashboardAluno | null), `isLoading`

**Funcionalidade:**
- Seletor de curso (disparado via `onSelectCurso` → atualiza `selectedCurso` no pai → componente refaz fetch)
- Barra de progresso com gradiente
- 4 cards de métricas (Total Envios, Pendentes, Aprovadas, Reprovadas)
- Grid de horas por área com barra de preenchimento
- Busca seu próprio dashboard via `apiFetch('/api/dashboard/aluno?curso_id=X')` quando `selectedCurso` muda

### 4.2 SubmissaoSection.tsx

**Props recebidas:**
```ts
apiFetch: (path: string, opts?: RequestInit) => Promise<any>
apiBase: string
token: string
regras: Regra[]
toastSuccess: (msg: string) => void
toastError: (msg: string) => void
onSuccess: () => void
colors: ReturnType<typeof useAppTheme>['colors']
accentGreen: string
```

**Estados internos:** `step` (1|2), `subForm`, `createdSubId`, `file`, `dragActive`, `submitting`

**Funcionalidade:**
- **Passo 1:** Seletor de área (preenche `tipo` automaticamente), input de horas, descrição opcional
- **Passo 2:** Drag-and-drop para upload de PDF/JPG/PNG (max 4MB), preview do arquivo
- `handleUpload` usa `fetch` direto (não `apiFetch`) porque precisa enviar `FormData` — o `apiFetch` serializa JSON e não funciona para uploads de arquivo
- Após envio sucesso, chama `onSuccess()` que volta para histórico

### 4.3 HistoricoSection.tsx

**Props recebidas:**
```ts
submissoes: Submissao[]
isLoading: boolean
colors: ReturnType<typeof useAppTheme>['colors']
accentGreen: string
```

**Estados internos:** nenhum (só renderização)

**Funcionalidade:**
- Tabela com colunas: Data, Tipo, Horas, Status
- Badge colorido para cada status (aprovado/reprovado/pendente/correção)
- Linha extra com observação do coordenador quando status = `correcao`
- Estado vazio com mensagem amigável

### 4.4 Padronização de apiFetch nos componentes

Todos os componentes usam `apiFetch`via props. O `apiFetch` **já retorna JSON parseado** — nunca chamar `.json()` nem verificar `.ok`/`.status` nos componentes.

**ERRADO:** `const res = await apiFetch(...); const data = await res.json();`
**CERTO:** `const data = await apiFetch(...); // usa data diretamente`

---

## 5. Páginas e Funcionalidades por Perfil

### 5.1 Login (src/pages/Login.tsx)

- Form com email + senha
- Redireciona para `/admin`, `/coordenador` ou `/aluno` conforme `perfil` do usuário
- Validação com React Hook Form + Zod
- Notificações com Sonner

### 5.2 Admin — super_admin (src/pages/Admin.tsx)

- `apiFetch` local com tratamento de 401/403 → logout automático
- Menu lateral com navegação por seções (Dashboard, Coordenadores, Cursos, Regras, Usuários, Validação, Configurações)
- Cada seção é um componente em `src/components/admin/`
- Busca inicial de dados ao carregar

**Seções:**
| Seção | Descrição |
|-------|-----------|
| DashboardSection | Métricas globais + fila de validação |
| CoordenadoresSection | CRUD de coordenadores |
| CursosSection | CRUD de cursos |
| RegrasSection | CRUD de regras por curso |
| UsuariosSection | Lista + busca de usuários |
| ValidacaoSection | Vincular coordenadores a cursos |
| ConfiguracoesSection | Parâmetros globais |

### 5.3 Coordenador (src/pages/Coordenador.tsx)

- `apiFetch` local via props para componentes filhos
- Menu lateral com Dashboard, Submissões, Cadastrar Aluno, Alunos
- Sidebar colapsável em mobile

**Seções:**
| Seção | Descrição |
|-------|-----------|
| DashboardSection | Métricas + fila de prioridade |
| SubmissoesSection | Filtro por curso/status, tabela com decisão |
| CadastrarSection | Form de cadastro de aluno (criação Firebase Auth + DB) |
| AlunosSection | Lista de alunos do coordenador |

### 5.4 Aluno (src/pages/Aluno.tsx)

- **Refatorado** — pai fino (~280 linhas) que делегит para componentes filhos
- `apiFetch` local com wrapper que faz fetch direto (sem useCallback desnecessário)
- `mapSubmissao` utility para normalizar campos variantes da API
- Navegação por `activeSection` ('progress' | 'submit' | 'history')

---

## 6. Fluxo de Autenticação

### 6.1 Login

1. Usuário preenche email + senha → `signIn(email, password)`
2. `AuthContext` faz POST em `/api/auth/login`
3. Backend retorna `{ success, token, refreshToken, usuario }`
4. Tokens salvos em `localStorage` (`token`, `refreshToken`, `authToken`)
5. `setUser(data.usuario)` e `setToken(data.token)`

### 6.2 Manutenção de Sessão

- Intervalo de **45 minutos** verifica e renova o token via Firebase `refreshToken`
- Se `refreshToken` é inválido/revogado → `signOut()` automático
- Se qualquer requisição retorna 401/403 → logout + toast de "Sessão expirada"

### 6.3 Logout

- Remove todas as chaves de `localStorage` (originais + compatibilidade)
- `setToken(null)` e `setUser(null)`

---

## 7. PWA — Implementação

### 7.1 Configuração (vite.config.ts)

```ts
VitePWA({
  registerType: "autoUpdate",
  manifest: {
    name: "SGC - Sistema de Gestão de Atividades Complementares",
    short_name: "SGC",
    description: "Sistema de Gestão de Atividades Complementares SENAC",
    theme_color: "#1a56db",
    background_color: "#1a1f2e",
    display: "standalone",
    start_url: "/",
    icons: [
      { src: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" }
    ]
  }
})
```

**Nota importante:** `name`, `short_name`, etc. devem estar **dentro de `manifest: {}`**. Passar no nível superior do `VitePWA({})` é ignorado pelo plugin v0.21.x.

### 7.2 Ícones

Gerados com **sharp** a partir de `src/assets/logo-white.png`:
- `public/icons/icon-192x192.png` — 192x192px
- `public/icons/icon-512x512.png` — 512x512px

```ts
// Geração
sharp('src/assets/logo-white.png')
  .resize(192, 192, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png().toFile('public/icons/icon-192x192.png')
```

### 7.3 Botão de Instalar (Footer.tsx)

- **Mobile only** — usa `useIsMobile`
- Escuta `window.beforeinstallprompt` e guarda em estado
- Só mostra quando `deferredPrompt` existe E app ainda não está instalado (`display-mode: standalone`)
- Ao clicar: `deferredPrompt.prompt()` → `userChoice` → limpa estado se aceito

### 7.4 Service Worker

- `registerType: autoUpdate` — service worker se atualiza automaticamente
- Workbox `generateSW` mode — service worker gerado pelo plugin
- Precache de assets críticos (HTML, JS, CSS, logo)

---

## 8. Endpoints Consumidos pelo Frontend

### 8.1 Autenticação

| Método | Endpoint | Descrição | Retorno |
|--------|----------|-----------|---------|
| POST | `/api/auth/login` | Login com email + senha | `{ success, token, refreshToken, usuario }` |
| POST | `/api/auth/logout` | Logout | — |

### 8.2 Aluno

| Método | Endpoint | Descrição | Retorno |
|--------|----------|-----------|---------|
| GET | `/api/alunos-cursos` | Lista cursos do aluno | `AlunoCurso[]` |
| GET | `/api/dashboard/aluno?curso_id=X` | Métricas do aluno | `DashboardAluno` |
| GET | `/api/regras?curso_id=X` | Regras do curso | `Regra[]` |
| GET | `/api/submissoes` | Histórico do aluno | `Submissao[]` |
| POST | `/api/submissoes` | Criar submissão | `{ id }` |
| POST | `/api/certificados` | Upload de certificado (FormData) | `{ success }` |

### 8.3 Coordenador

| Método | Endpoint | Descrição | Retorno |
|--------|----------|-----------|---------|
| GET | `/api/dashboard/coordenador` | Métricas do coord. | `DashboardMetrics` |
| GET | `/api/submissoes` | Lista submissões | `Submissao[]` |
| GET | `/api/usuarios` | Lista usuarios | `Usuario[]` |
| GET | `/api/regras` | Lista regras | `Regra[]` |
| GET | `/api/cursos` | Lista cursos | `Curso[]` |
| GET | `/api/certificados?submissao_id=X` | Certificados de uma submissão | `Certificado[]` |
| PATCH | `/api/submissoes/{id}` | Aprovar/reprovar/correção | `{ success }` |
| POST | `/api/usuarios` | Cadastrar aluno | `{ uid }` |

### 8.4 Admin

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/admin/dashboard` | Métricas globais |
| GET | `/api/coordenadores` | Lista coordenadores |
| POST | `/api/coordenadores` | Criar coordenador |
| PATCH | `/api/coordenadores/{id}` | Atualizar coordenador |
| DELETE | `/api/coordenadores/{id}` | Remover coordenador |
| GET | `/api/cursos` | Lista cursos |
| POST | `/api/cursos` | Criar curso |
| PATCH | `/api/cursos/{id}` | Atualizar curso |
| DELETE | `/api/cursos/{id}` | Remover curso |
| GET | `/api/regras` | Lista regras |
| POST | `/api/regras` | Criar regra |
| PATCH | `/api/regras/{id}` | Atualizar regra |
| DELETE | `/api/regras/{id}` | Remover regra |
| GET | `/api/admin/usuarios` | Lista usuarios |
| GET | `/api/admin/validacoes` | Lista vínculos pendentes |
| POST | `/api/admin/validacoes` | Criar vínculo |
| DELETE | `/api/admin/validacoes/{id}` | Remover vínculo |

---

## 9. Decisões Técnicas

### 9.1 apiFetch retorna JSON diretamente

O wrapper `apiFetch` usado em todas as páginas já faz `res.json()` internamente. Componentes **não devem** chamar `.json()` nem verificar `.ok`/`.status`. Erros são lançados como `Error` com a `mensagem` do backend.

**Antes (ERRADO):**
```ts
const res = await apiFetch('/api/x');
const data = await res.json();
```

**Depois (CERTO):**
```ts
const data = await apiFetch('/api/x');
```

### 9.2 Refatoração do Aluno.tsx

O arquivo `Aluno.tsx` foi refatorado de ~733 linhas para ~280 linhas, extraindo três componentes independentes em `src/components/aluno/`. Cada seção gerencia seus próprios estados internos. O pai mantém apenas: autenticação, `activeSection`, `cursos`/`selectedCurso` (compartilhados por Progresso e Submissão), e o `apiFetch` wrapper.

### 9.3 FormData para upload (não usa apiFetch)

O endpoint `/api/certificados` recebe `FormData` (multipart). O `apiFetch` serializa JSON (`JSON.stringify`), o que é incompatível com FormData. Por isso `SubmissaoSection` usa `fetch` direto com `apiBase` + `token` para esse endpoint.

### 9.4 Tema via CSS Variables

O sistema usa `useAppTheme` que retorna cores como variáveis CSS (`colors.textPrimary`, `colors.cardBg`, etc.). Isso permite trocar o tema sem re-render — basta trocar os valores no `ThemeContext`.

### 9.5 Compatibilidade de localStorage

O `AuthContext` mantém duas chaves de localStorage para兼容 com diferentes páginas:
- Originais: `token`, `refreshToken`, `usuario`
- Compatibilidade Admin: `authToken`, `userData`, `tokenExpiry`

### 9.6 Refresh Token Automático

O token Firebase expira em 60 min. O `AuthContext` renova automaticamente a cada 45 min via `setInterval`. Se a renovação falhar, faz logout automático.

---

## 10. Variáveis de Ambiente

| Variável | Descrição |
|----------|-----------|
| `VITE_API_BASE_URL` | URL base do backend (padrão: `https://back-end-banco-five.vercel.app`) |
| `VITE_FIREBASE_KEY` | Web API Key do Firebase para renovação de token |

---

## 11. Build e Deploy

```bash
npm run build   # Production build em dist/
npm run dev     # Dev server na porta 8080
```

O deploy é feito na **Vercel** (frontend). O backend fica em `https://back-end-banco-five.vercel.app`.
