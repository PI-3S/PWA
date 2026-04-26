# Documentação Técnica do Frontend — Sistema de Gestão de Atividades Complementares (Maestria)

## 1. Visão Geral do Projeto

### 1.1 O que é o sistema

O **Maestria** é um sistema web de gestão de atividades complementares acadêmicas desenvolvido para o SENAC. O sistema permite que alunos submetam certificados de atividades complementares (extensão, pesquisa, monitoria, etc.), que coordenadores validem essas submissões e que administradores gerenciem usuários, cursos e regras do sistema.

### 1.2 Problema que resolve

- **Alunos**: Submetem atividades complementares e acompanham o status de validação.
- **Coordenadores**: Analisam, aprovam, reprovam ou solicitam correção de submissões dos alunos vinculados aos seus cursos.
- **Super Admin**: Gerencia cursos, usuários, regras de atividade, vínculos de coordenadores e configurações globais do sistema (email e parâmetros gerais).

### 1.3 Stack Tecnológica Completa com Versões

| Tecnologia | Versão | Papel |
|---|---|---|
| **React** | 18.3.1 | Framework UI |
| **TypeScript** | 5.8.3 | Tipagem estática |
| **Vite** | 5.4.19 | Bundler e dev server |
| **React Router DOM** | 6.30.1 | Roteamento de páginas |
| **TanStack Query** | 5.83.0 | Gerenciamento de estado servidor (React Query) |
| **Tailwind CSS** | 3.4.17 | Framework CSS utilitário |
| **Radix UI** | (diversos) | Componentes UI acessíveis (shadcn/ui) |
| **Lucide React** | 0.462.0 | Biblioteca de ícones |
| **Sonner** | 1.7.4 | Notificações toast |
| **Zod** | 3.25.76 | Validação de esquemas |
| **React Hook Form** | 7.61.1 | Gerenciamento de formulários |
| **clsx / tailwind-merge** | 2.6.0 / 2.6.0 | Utilitários de concatenação de classes |
| **Recharts** | 2.15.4 | Gráficos (dashboards) |
| **date-fns** | 3.6.0 | Manipulação de datas |
| **Vitest** | 3.2.4 | Testes unitários |
| **Playwright** | 1.57.0 | Testes E2E |
| **ESLint** | 9.32.0 | Linting de código |

---

## 2. Estrutura de Pastas

```
src/
├── assets/                  # Arquivos estáticos (logos, imagens)
│   └── logo-white.png
├── components/
│   ├── ProtectedRoute.tsx   # HOC de proteção de rotas por perfil
│   ├── themeswitcher.tsx    # Componente de toggle dark/light
│   └── ui/                  # Biblioteca shadcn/ui (componentes base Radix)
│       ├── accordion.tsx
│       ├── alert-dialog.tsx
│       ├── alert.tsx
│       ├── aspect-ratio.tsx
│       ├── avatar.tsx
│       ├── badge.tsx
│       ├── breadcrumb.tsx
│       ├── button.tsx
│       ├── calendar.tsx
│       ├── card.tsx
│       ├── carousel.tsx
│       ├── chart.tsx
│       ├── checkbox.tsx
│       ├── collapsible.tsx
│       ├── context-menu.tsx
│       ├── dialog.tsx
│       ├── drawer.tsx
│       ├── dropdown-menu.tsx
│       ├── form.tsx
│       ├── hover-card.tsx
│       ├── input-otp.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── menubar.tsx
│       ├── navigation-menu.tsx
│       ├── pagination.tsx
│       ├── popover.tsx
│       ├── progress.tsx
│       ├── radio-group.tsx
│       ├── resizable.tsx
│       ├── scroll-area.tsx
│       ├── select.tsx
│       ├── separator.tsx
│       ├── sheet.tsx
│       ├── sidebar.tsx
│       ├── skeleton.tsx
│       ├── slider.tsx
│       ├── sonner.tsx         # Wrapper sonner/toast
│       ├── switch.tsx
│       ├── table.tsx
│       ├── tabs.tsx
│       ├── textarea.tsx
│       ├── toggle-group.tsx
│       ├── toggle.tsx
│       ├── tooltip.tsx
│       └── use-toast.ts
├── contexts/
│   ├── AuthContext.tsx       # Estado de autenticação global (token, user, signIn, signOut)
│   └── ThemeContext.tsx      # Estado de tema global (dark/light)
├── data/
│   └── data.ts               # Configurações da API, tipos globais (User, Submission, API_CONFIG)
├── hooks/
│   ├── use-mobile.tsx        # Hook que detecta se a viewport é mobile (< 768px)
│   └── useapptheme.ts         # Hook que retorna o tema atual com paleta de cores completa
├── lib/
│   └── utils.ts              # Utilitários (função cn() para merge de classes)
├── pages/
│   ├── Admin.tsx             # Painel do Super Admin
│   ├── Aluno.tsx             # Painel do Aluno
│   ├── Coordenador.tsx        # Painel do Coordenador
│   ├── Index.tsx              # Tela de seleção de perfil (home)
│   ├── Login.tsx              # Tela de login com parâmetro de role
│   └── NotFound.tsx           # Página 404
├── services/
│   └── api.ts                # Configurações e utilitários da API
├── test/
│   ├── example.test.ts        # Teste de exemplo
│   └── setup.ts               # Configuração de setup para testes
├── App.tsx                   # Componente raiz — define todas as rotas
├── index.css                 # Estilos globais (CSS base, Tailwind)
├── main.tsx                  # Entry point React
└── vite-env.d.ts             # Definições de tipos do Vite
```

### Descrição das Responsabilidades

| Pasta | Responsabilidade |
|---|---|
| `assets/` | Logo e imagens estáticas |
| `components/ui/` | Componentes shadcn/ui baseados em Radix UI — abstração sobre componentes primitivos acessíveis |
| `components/` | Componentes customizados globais (ProtectedRoute, ThemeSwitcher) |
| `contexts/` | React Context — estado global de autenticação e tema |
| `data/` | Tipos TypeScript e constantes de configuração da API |
| `hooks/` | Hooks customizados reutilizáveis |
| `lib/` | Funções utilitárias compartilhadas |
| `pages/` | Páginas/rotas do sistema — uma por perfil |
| `services/` | Configurações centralizadas de API |
| `test/` | Testes unitários e de setup |

---

## 3. Páginas e Funcionalidades

### 3.1 Index.tsx — Seleção de Perfil

Página inicial pública (`/`). Permite ao usuário escolher qual perfil deseja acessar, direcionando para a página de login apropriada.

**Funcionalidades:**
- Exibe 3 cards de seleção de perfil: Super Admin, Coordenador, Aluno.
- Cada card mostra ícone, nome e descrição breve da área.
- Ao clicar, navega para `/login/{role}`.
- Toggle de tema (dark/light) no canto superior esquerdo.
- Efeito visual de glow e gradiente personalizado por perfil.
- Responsivo — em telas pequenas exibe grid de 1 coluna.

**URL:** `/`

---

### 3.2 Login.tsx — Autenticação com Recuperação de Senha

Página de login que aceita parâmetro de role pela URL (`/login/:role`). Cada role exibe um tema visual diferente (cor, ícone).

**Funcionalidades:**
- Campos: Email e Senha (com input estilo `font-mono`).
- Validação: email obrigatório com `@`, senha mínimo 6 caracteres.
- **Recuperação de senha**: dialog com campo de email que chama `POST /api/auth/forgot-password`.
- Após login bem-sucedido, valida se o perfil retornado pela API corresponde ao role escolhido — se não, rejeita o acesso.
- Redirecionamento pós-login:
  - `superadmin` → `/admin`
  - `coordenador` → `/coordenador`
  - `aluno` → `/aluno`
- Feedback com toast (Sonner) para erros e sucesso.
- Link "Voltar" para a página inicial.

**URLs:** `/login/:role` (rota pública)

---

### 3.3 Admin.tsx — Painel do Super Admin

Painel administrativo completo com navegação lateral (sidebar) fixa e área de conteúdo dinâmica baseada na `section` ativa.

**Perfis permitidos:** `super_admin`

#### Seções:

| Seção | Descrição |
|---|---|
| **Dashboard** | Métricas globais: total de submissões, pendentes, aprovadas e reprovadas. Gráficos de barras por curso e por área. |
| **Gestão de Cursos** | CRUD completo de cursos (nome, carga horária mínima). Tabela com ações de editar e excluir. |
| **Gestão de Usuários** | Lista todos os usuários com busca por nome/email e filtro por perfil (aluno/coordenador). Criação de novo usuário com geração de senha forte. Reset de senha via `POST /api/usuarios/:id/reset-senha`. Diálogo de confirmação com credenciais após criação. |
| **Validação** | Lista todas as submissões com filtros por status e curso. Expansão de linha para ver descrição, certificado (link + OCR extraído) e ações: Aprovar, Reprovar, Solicitar Correção (com observação obrigatória). |
| **Regras de Atividades** | CRUD de regras por curso: área, limite de horas, se exige comprovante. Exibição em cards. |
| **Coordenadores** | Gerencia vínculos usuário↔curso. Cria e remove vínculos de coordenadores a cursos. |
| **Configurações** | **Email**: servidor SMTP, porta, usuário, senha, remetente, ativar/desativar, botão de teste. **Sistema**: nome do sistema, instituição, URL frontend, URL logo, cores primária/secundária. |

**Sidebar:** Exibe logo, itens de navegação com ícone, avatar do usuário com nome e botão "Sair".

**Responsividade:** Layout fixo em desktop; em mobile a sidebar colapsa e o tema switcher fica no header.

---

### 3.4 Coordenador.tsx — Painel do Coordenador

Painel de coordenação com navegação lateral e área de conteúdo dinâmica.

**Perfis permitidos:** `coordenador`, `super_admin`

#### Seções:

| Seção | Descrição |
|---|---|
| **Dashboard** | Métricas: total de submissões, pendentes, aprovadas, reprovadas e total de alunos. "Fila de Prioridade" — lista as 5 submissões pendentes mais antigas com ações rápidas (Aprovar, Correção, Reprovar). |
| **Submissões** | Lista completa de submissões com filtros por curso e status. Cada linha é expansível via `ChevronDown/ChevronUp` e exibe: descrição, certificados anexados com link para PDF e OCR extraído, e botões de decisão. |
| **Alunos** | Tabela com todos os alunos vinculados. Exibe nome, matrícula, curso e barra de progresso individual de horas aprovadas vs. carga mínima do curso. |
| **Cadastrar** | Formulário para criar novo aluno: nome, matrícula, email, senha e curso. Envia `POST /api/usuarios` com `perfil: 'aluno'`. |

**Responsividade mobile:** Sidebar colapsável com overlay, header sticky com toggle de tema.

---

### 3.5 Aluno.tsx — Painel do Aluno

Painel do aluno com navegação lateral.

**Perfis permitidos:** `aluno`

#### Seções:

| Seção | Descrição |
|---|---|
| **Meu Progresso** | Selector de curso (caso o aluno esteja em múltiplos). Barra de progresso visual (horas aprovadas / carga mínima). Cards de métricas (total envios, pendentes, aprovadas, reprovadas). Quebra por área de atividade com barras individuais. |
| **Nova Submissão** | Fluxo em 2 etapas: **Passo 1** — seleciona área (regra), informa horas do certificado e descrição opcional. **Passo 2** — upload de arquivo (PDF, JPG, PNG — máximo 4 MB) com drag-and-drop. Ao finalizar, redireciona para Histórico. |
| **Histórico** | Tabela com todas as submissões do aluno. Exibe data, tipo, horas e status (badge colorido). Linhas com status `correcao` exibem observação do coordenador. |

**Responsividade:** Sidebar mobile com menu hamburger e overlay.

---

## 4. Componentes e Hooks

### 4.1 ProtectedRoute

**Arquivo:** `src/components/ProtectedRoute.tsx`

**O que faz:** Componente de ordem superior (HOC) que protege rotas do React Router com base no estado de autenticação e perfil do usuário.

**Lógica:**
1. Se `loading === true` → exibe spinner de carregamento (tela cheia com borda azul girando).
2. Se `user === null` → tenta ler o perfil salvo no localStorage para redirecionar para `/login/{perfil}` correto; caso não consiga, vai para `/`.
3. Se `allowedRoles` foi informado e `user.perfil` não está na lista → redireciona para a rota de login do perfil do usuário.
4. Se tudo ok → renderiza `children`.

**Uso em App.tsx:**
```tsx
<ProtectedRoute allowedRoles={['super_admin']}>
  <Admin />
</ProtectedRoute>
<ProtectedRoute allowedRoles={['coordenador', 'super_admin']}>
  <Coordenador />
</ProtectedRoute>
<ProtectedRoute allowedRoles={['aluno']}>
  <Aluno />
</ProtectedRoute>
```

---

### 4.2 useAppTheme

**Arquivo:** `src/hooks/useapptheme.ts`

**O que faz:** Hook que combina o tema atual do `ThemeContext` (`dark` ou `light`) com a paleta de cores correspondente (`ThemeColors`). Retorna `{ theme, colors }`.

**Paletas disponíveis:**
- `darkTheme` — fundo escuro com tons de azul/cinza (`hsl(220, ...)`).
- `lightTheme` — fundo claro com tons de cinza/bege.

Cada paleta define 28 chaves de cor: `panelBg`, `pageBg`, `cardBg`, `inputBg`, `sidebarBg`, `tableBg`, `logoFilter`, etc.

**Uso típico:**
```tsx
const { colors } = useAppTheme();
// colors.inputBg, colors.textPrimary, etc.
```

---

### 4.3 useIsMobile

**Arquivo:** `src/hooks/use-mobile.tsx`

**O que faz:** Hook que detecta se a largura da viewport é menor que 768px. Usa `window.matchMedia` com listener de `change` para atualizar reativamente. Retorna `boolean` (ou `undefined` durante o SSR/hydration inicial).

**Ponto de quebra:** 768px.

**Uso:**
```tsx
const isMobile = useIsMobile();
// true em mobile, false em desktop
```

---

### 4.4 AuthContext

**Arquivo:** `src/contexts/AuthContext.tsx`

**O que faz:** React Context que gerencia todo o ciclo de vida da autenticação.

**Interface:**
```ts
interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => void;
}
```

**Funcionalidades:**
- **`signIn`** — faz `POST /api/auth/login`, salva `token`, `refreshToken` e `usuario` no localStorage (e chaves de compatibilidade `authToken`, `userData`, `tokenExpiry`), atualiza estado.
- **`signOut`** — remove todas as chaves de localStorage e zera estado.
- **Refresh automático de token** — a cada 45 minutos, se houver `refreshToken` salvo e `FIREBASE_KEY` configurada, renova o token via API Google `securetoken.googleapis.com`.
- **Hydration** — ao iniciar, lê localStorage e restaura sessão (com `try/catch` para dados corrompidos).

**Provedor:** `<AuthProvider>` envolve toda a aplicação em `App.tsx`.

---

## 5. Fluxo de Autenticação

### 5.1 Login

```
Usuário acessa /login/:role
  → Digita email + senha
  → submit → signIn(email, password)
    → POST /api/auth/login { email, senha }
    → Se sucesso:
        → Salva token + refreshToken + usuario no localStorage
        → Atualiza estado user/token
        → Valida perfil returned === perfil chosen
        → Redireciona para /admin | /coordenador | /aluno
    → Se erro:
        → Toast com mensagem de erro
```

### 5.2 Refresh de Token

```
AuthContext inicia com useEffect
  → Intervalo de 45 minutos
  → Se token existe:
      → POST https://securetoken.googleapis.com/v1/token?key={FIREBASE_KEY}
        Body: grant_type=refresh_token + refresh_token
      → Se retorna id_token:
          → Atualiza localStorage (token + refreshToken)
          → Atualiza estado token
      → Se falha:
          → signOut() — token revogado
```

### 5.3 Logout

```
Usuário clica "Sair" (handleLogout)
  → LocalStorage: remove token, refreshToken, usuario,
                  authToken, userData, tokenExpiry
  → signOut() → zera estado user/token
  → Navega para /
```

### 5.4 Proteção de Rotas

```
Usuário tenta acessar /admin
  → ProtectedRoute verifica:
      → loading? → spinner
      → user null? → tenta ler localStorage, redireciona
      → perfil não permitido? → redireciona para login do seu perfil
      → ok? → renderiza children
```

---

## 6. Integração com a API

### 6.1 Base URL

```ts
// src/data/data.ts
BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://back-end-banco-five.vercel.app'
```

Todas as chamadas usam `${API_CONFIG.BASE_URL}{path}`.

### 6.2 Tabela de Endpoints

| Método | Endpoint | Usado em | Descrição |
|---|---|---|---|
| `POST` | `/api/auth/login` | Login.tsx, AuthContext | Autentica usuário com email/senha |
| `POST` | `/api/auth/forgot-password` | Login.tsx | Solicita recuperação de senha |
| `GET` | `/api/dashboard/coordenador` | Admin.tsx, Coordenador.tsx | Métricas do dashboard |
| `GET` | `/api/dashboard/aluno` | Aluno.tsx | Métricas do aluno (suporta `?curso_id=`) |
| `GET` | `/api/cursos` | Admin.tsx, Coordenador.tsx, Aluno.tsx | Lista todos os cursos |
| `POST` | `/api/cursos` | Admin.tsx | Cria curso |
| `PATCH` | `/api/cursos/:id` | Admin.tsx | Atualiza curso |
| `DELETE` | `/api/cursos/:id` | Admin.tsx | Exclui curso |
| `GET` | `/api/usuarios` | Admin.tsx, Coordenador.tsx | Lista usuários (suporta `?perfil=`) |
| `POST` | `/api/usuarios` | Admin.tsx, Coordenador.tsx | Cria usuário/aluno |
| `PATCH` | `/api/usuarios/:id` | Admin.tsx | Atualiza usuário |
| `PUT` | `/api/usuarios/:id` | Admin.tsx | Atualiza usuário (fallback) |
| `DELETE` | `/api/usuarios/:id` | Admin.tsx | Exclui usuário |
| `POST` | `/api/usuarios/:id/reset-senha` | Admin.tsx | Reseta senha de usuário |
| `GET` | `/api/submissoes` | Admin.tsx, Coordenador.tsx, Aluno.tsx | Lista submissões |
| `POST` | `/api/submissoes` | Coordenador.tsx, Aluno.tsx | Cria submissão |
| `PATCH` | `/api/submissoes/:id` | Admin.tsx, Coordenador.tsx | Atualiza status (aprovado/reprovado/correcao) |
| `GET` | `/api/regras` | Admin.tsx, Coordenador.tsx, Aluno.tsx | Lista regras (suporta `?curso_id=`) |
| `POST` | `/api/regras` | Admin.tsx | Cria regra |
| `PATCH` | `/api/regras/:id` | Admin.tsx | Atualiza regra |
| `DELETE` | `/api/regras/:id` | Admin.tsx | Exclui regra |
| `GET` | `/api/coordenadores-cursos` | Admin.tsx | Lista vínculos coordenador↔curso |
| `POST` | `/api/coordenadores-cursos` | Admin.tsx | Cria vínculo |
| `DELETE` | `/api/coordenadores-cursos/:id` | Admin.tsx | Remove vínculo |
| `GET` | `/api/certificados` | Admin.tsx, Coordenador.tsx, Aluno.tsx | Lista certificados (query: `?submissao_id=`) |
| `POST` | `/api/certificados` | Aluno.tsx | Upload de certificado (multipart/form-data) |
| `GET` | `/api/configuracoes/email_config` | Admin.tsx | Busca config de email |
| `POST` | `/api/configuracoes/email_config` | Admin.tsx | Salva config de email |
| `GET` | `/api/configuracoes/sistema_config` | Admin.tsx | Busca config do sistema |
| `POST` | `/api/configuracoes/sistema_config` | Admin.tsx | Salva config do sistema |
| `POST` | `/api/configuracoes/test-email` | Admin.tsx | Envia email de teste |
| `GET` | `/api/alunos-cursos` | Aluno.tsx | Lista cursos vinculados ao aluno logado |

### 6.3 Autenticação das Requisições

Todas as requisições autenticadas incluem o header:
```
Authorization: Bearer {token}
Content-Type: application/json
```

Exceção: `POST /api/certificados` usa `multipart/form-data` (sem `Content-Type` explícito para permitir que o browser defina o boundary).

---

## 7. Decisões Técnicas

### 7.1 Por que Context API para autenticação

A autenticação precisa ser acessível em **toda a árvore de componentes** sem prop drilling: o `user` e o `token` são necessários no `ProtectedRoute`, nos menus de sidebar (para exibir o nome), nos diálogos de logout e em praticamente todas as páginas que fazem requisições.

A Context API é suficiente porque:
- É nativamente integrada ao React — sem dependência extra.
- O volume de dados é pequeno (um objeto `User` + uma string `token`).
- O padrão provider/consumer é simples e previsível.
- `TanStack Query` não substitui isso — ele gerencia cache de dados **servidor**, não estado de autenticação.

### 7.2 Por que fetch inline nos componentes

O sistema utiliza `fetch` direto nos componentes (com `useCallback` para memoização) em vez de um service layer abstrato por alguns motivos:

- **Transparência** — cada página tem controle total sobre suas requisições, headers e tratamento de erro.
- **Simplicidade** — para um sistema de tamanho médio, um service layer adicional adicionaria complexidade sem benefício prático.
- **Flexibilidade** — cada seção pode usar `Promise.all` para carregar dados paralelos com estruturas de resposta ligeiramente diferentes.
- **Debugging** — é trivial seguir o fluxo de rede olhando o código fonte da página.

TanStack Query está presente (`@tanstack/react-query`) mas **não é utilizado ativamente** no código atual — o `QueryClient` é configurado no `App.tsx`, indicando preparação para migração futura de `useCallback + fetch` para queries.

### 7.3 Temas Dinâmicos por Perfil

Cada perfil (Admin, Coordenador, Aluno) possui uma **cor de destaque** fixa:

| Perfil | Cor Primária |
|---|---|
| Super Admin | `hsl(210, 80%, 55%)` — azul |
| Coordenador | `hsl(30, 95%, 55%)` — laranja |
| Aluno | `hsl(160, 70%, 45%)` — verde |

Além disso, o sistema possui **tema global dark/light** (`ThemeContext`) que altera toda a paleta de cores da interface (background, cards, inputs, sidebar, etc.). A combinação de tema global + cor de destaque por perfil permite:
- Alternar entre dark/light sem perder identidade visual do perfil.
- Cada perfil manter sua cor de acento mesmo ao trocar o tema.

As cores são armazenadas em CSS variables customizadas (HSL) e aplicadas via `style={{ }}` inline nos componentes, garantindo que cada perfil tenha identidade visual distinta na mesma estrutura de layout.
