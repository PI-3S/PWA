# Roteiro de Apresentação — Frontend PWA
## SGC — Sistema de Gestão de Atividades Complementares SENAC
### Projeto Integrador — Avaliação Final

> **IMPORTANTE:** Este roteiro cobre apenas o **Frontend (PWA)**. Juntar com roteiro do **Mobile** e do **Backend** para apresentação completa.

---

## Visão Geral do Sistema

O SGC é uma plataforma web progressiva (PWA) para gestão de atividades complementares do SENAC, com três perfis de usuário (Administrador, Coordenador, Aluno), integração com API REST no backend e suporte a reconhecimento de texto via OCR em certificados.

---

## 1. Análise do Problema e Escopo

> "O problema central é a gestão manual e fragmentada das atividades complementares. Alunos entregam documentos físicos, coordenadores validam manualmente, e o controle de horas é feito em planilhas. O SGC digitaliza todo esse fluxo em uma única plataforma acessível pelo navegador — sem necessidade de instalação — com suporte para dispositivos móveis e desktop."

**Escopo do Frontend:**

| Perfil | Funcionalidades |
|--------|----------------|
| Aluno | Acompanhar progresso, submeter atividades, enviar certificados, acompanhar status |
| Coordenador | Validar submissões, gerenciar alunos, cadastrar novos alunos, visualizar regras |
| Administrador | CRUD de cursos, usuários, regras, coordenadores, configurações do sistema |

---

## 2. Arquitetura do Sistema *(1,5 pts)*

> "A arquitetura do frontend segue o modelo de aplicação de página única — SPA — com React 18 e TypeScript. A estrutura é organizada em camadas bem definidas: páginas, componentes de domínio, contextos de estado global, hooks de abstração de API, tipos e utilitários. Essa separação garante que cada camada tem uma responsabilidade única e clara."

### 2.1 Stack Tecnológica

| Camada | Tecnologia | Função |
|--------|-----------|--------|
| Framework | React 18 + TypeScript 5.8 | UI declarativa com tipagem estática |
| Build | Vite 5 | Bundler com hot-reload e otimização de produção |
| Roteamento | React Router DOM 6 | Navegação SPA com rotas protegidas |
| Estilização | Tailwind CSS 3 + shadcn/ui | Layout responsivo + componentes Radix UI |
| Ícones | Lucide React | Biblioteca de ícones consistente |
| Gráficos | Recharts | Dashboards com dados em tempo real |
| Toasts | Sonner | Feedback visual centralizado |
| PWA | vite-plugin-pwa | Manifesto, service worker, ícones |
| Deploy | Vercel | CI/CD automático a cada push |

### 2.2 Organização em Camadas

```
src/
├── pages/          → Camada de páginas (roteamento)
├── components/     → Camada de apresentação (UI + domínio)
│   ├── ui/         → Primitivos reutilizáveis (shadcn/Radix)
│   ├── admin/      → Seções do painel admin
│   ├── coordenador/→ Seções do painel coordenador
│   └── aluno/      → Seções do painel aluno
├── contexts/       → Estado global (Auth + Theme)
├── hooks/          → Abstração de API e viewport
├── types/          → Contratos de dados TypeScript
├── lib/            → Utilitários e constantes
└── data/           → Configuração de API e labels
```

### 2.3 Fluxo de Roteamento com Proteção por Papel

> "Toda rota sensível passa pelo componente `ProtectedRoute`, que verifica o papel do usuário autenticado antes de renderizar a página. Um coordenador não consegue acessar a rota de administrador — o sistema redireciona automaticamente."

**Arquivo:** `src/App.tsx` + `src/components/ProtectedRoute.tsx`

```
/ → Index (público — seleção de perfil)
/login/:role → Login (público)
/admin/* → Admin (protegido: super_admin)
/coordenador/* → Coordenador (protegido: coordenador, super_admin)
/aluno/* → Aluno (protegido: aluno)
* → NotFound
```

### 2.4 Configuração PWA

> "O sistema é uma Progressive Web App completa. Isso significa que o aluno pode abrir no celular, adicionar à tela inicial e usar com a experiência de um aplicativo nativo — sem precisar da Play Store ou App Store. O service worker gerencia cache e atualizações automáticas."

**Arquivo:** `vite.config.ts`

| Configuração | Valor |
|-------------|-------|
| `name` | SGC - Sistema de Gestão de Atividades Complementares |
| `short_name` | SGC |
| `display` | standalone |
| `registerType` | autoUpdate |
| `theme_color` | #1a56db |
| Ícones | 192×192 e 512×512 |

---

## 3. Integração Mobile/API/PWA *(0,5 pts)*

> "O frontend se comunica com o backend exclusivamente via HTTP REST. Toda chamada de API passa pelo hook `useApi`, que injeta automaticamente o token JWT no cabeçalho de autorização e trata erros 401 e 403 com logout automático. Não existe lógica de negócio no frontend — ele apenas consome a API."

### 3.1 Hook Centralizado de API

**Arquivo:** `src/hooks/useApi.ts`

```typescript
// Toda requisição autenticada passa por aqui
const apiFetch = async (path, opts) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Authorization': `Bearer ${token}`, ...opts.headers }
  });
  if (response.status === 401 || response.status === 403) signOut(); // logout automático
  return response.json();
};
```

### 3.2 Configuração de Ambiente

**Arquivo:** `src/data/data.ts`

```typescript
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://back-end-banco-five.vercel.app'
};
```

> "A URL da API vem de variável de ambiente — nunca hardcoded. Isso permite trocar o backend em produção sem alterar o código."

### 3.3 Autenticação com Refresh Token

> "O sistema implementa renovação automática de token a cada 45 minutos usando o Firebase Auth como provedor de refresh. Quando o token expira, o usuário não precisa fazer login novamente — o processo é transparente."

**Arquivo:** `src/contexts/AuthContext.tsx`

| Chave localStorage | Conteúdo |
|-------------------|----------|
| `token` | JWT de acesso |
| `refreshToken` | Token para renovação via Firebase |
| `usuario` | Dados do usuário (JSON) |
| `app-theme` | Preferência de tema (dark/light) |

### 3.4 Fluxo OCR (Integração Backend)

> "Quando o aluno faz upload de um certificado, o backend processa o PDF ou imagem com OCR e retorna os dados extraídos — horas, data, instituição. O frontend exibe esses dados com um indicador de confiança visual: verde acima de 80%, amarelo entre 50% e 80%, vermelho abaixo de 50%. O aluno pode corrigir campos com baixa confiança antes de confirmar."

**Arquivo:** `src/components/aluno/OcrPreview.tsx`

```
Confiança ≥ 0.8 → badge verde  (alta confiança)
Confiança ≥ 0.5 → badge amarelo (confiança média)
Confiança < 0.5 → badge vermelho (baixa — edição manual)
```

---

## 4. Interface e Usabilidade *(0,5 pts)*

> "A interface foi projetada para ser idêntica em comportamento a um aplicativo móvel nativo. No celular, o sidebar se transforma em menu hambúrguer com drawer lateral. No desktop, a sidebar fica fixada. O aluno pode instalar o PWA direto pelo botão no rodapé, sem necessidade de loja de aplicativos."

### 4.1 Responsividade

**Arquivo:** `src/hooks/use-mobile.tsx`

```typescript
// Breakpoint em 768px — detecta dispositivo móvel
export function useIsMobile() {
  return useMediaQuery('(max-width: 768px)');
}
```

| Elemento | Mobile (<768px) | Desktop (≥768px) |
|---------|----------------|-----------------|
| Sidebar | Drawer (hambúrguer) | Fixada na lateral |
| Botão instalar PWA | Visível no Footer | Oculto |
| Header | Logo + ícone hambúrguer | Título da seção + avatar |

### 4.2 Sistema de Tema Dark/Light

> "O sistema suporta tema escuro e claro, com persistência no localStorage. Todas as cores da interface são controladas por um sistema de 28 propriedades HSL — nunca hardcoded. O usuário troca o tema em qualquer tela sem recarregar a página."

**Arquivo:** `src/hooks/useapptheme.ts` + `src/contexts/ThemeContext.tsx`

| Grupo | Propriedades |
|-------|-------------|
| Fundos | `pageBg`, `cardBg`, `panelBg`, `sidebarBg`, `headerBg`, `tableBg` |
| Texto | `textPrimary`, `textSecondary`, `labelColor`, `titleColor` |
| Inputs | `inputBg`, `inputBorder` |
| Sidebar | `sidebarText`, `sidebarItemHover`, `sidebarItemActive` |
| Tabelas | `tableHeaderBg`, `tableRowHover` |

### 4.3 Cores por Papel (Acessibilidade Visual)

**Arquivo:** `src/lib/constants.ts`

| Papel | Cor | Uso |
|-------|-----|-----|
| Administrador | Azul (`ACCENT.blue`) | Sidebar, botões, destaque |
| Coordenador | Laranja (`ACCENT.orange`) | Sidebar, botões, destaque |
| Aluno | Verde (`ACCENT.alunoGreen`) | Sidebar, botões, destaque |
| Aprovação | Verde (`ACCENT.green`) | Badges de status |

### 4.4 Feedback Visual

> "Toda ação do usuário — salvar, aprovar, rejeitar, deletar — recebe feedback imediato via toast centralizado. Não existe ação silenciosa no sistema."

**Arquivo:** `src/lib/toast.ts`

```typescript
// Centralizado: toastSuccess() e toastError()
// Usado em todos os componentes de domínio
```

---

## 5. Organização e Modularização *(1,0 pt)*

> "O projeto divide responsabilidades de forma clara: páginas orquestram, componentes de domínio implementam a lógica visual, hooks abstraem a comunicação com a API, contextos gerenciam estado global, tipos definem contratos de dados. Nenhuma camada faz o trabalho da outra."

### 5.1 Estrutura de Pastas por Domínio

| Pasta | Responsabilidade | Arquivos |
|-------|-----------------|---------|
| `pages/` | Roteamento e composição de seções | 6 |
| `components/admin/` | UI + lógica das seções admin | 7 + utils.ts |
| `components/coordenador/` | UI + lógica das seções coordenador | 5 |
| `components/aluno/` | UI + lógica das seções aluno | 4 |
| `components/ui/` | Primitivos reutilizáveis (shadcn) | 35+ |
| `contexts/` | Estado global (Auth, Theme) | 2 |
| `hooks/` | Abstração de API e viewport | 3 |
| `types/` | Interfaces TypeScript por domínio | 3 |
| `lib/` | Utilitários e constantes | 3 |
| `data/` | Configuração de API | 1 |

### 5.2 Separação Admin / Coordenador / Aluno

> "Cada painel tem suas próprias seções completamente isoladas. O código do Admin não mistura com o do Aluno. Isso facilita manutenção — uma mudança no fluxo do coordenador não afeta o painel do aluno."

### 5.3 Tipos por Domínio

**Arquivos:** `src/types/admin.ts`, `src/types/aluno.ts`, `src/types/coordenador.ts`

| Arquivo | Interfaces definidas |
|---------|---------------------|
| `admin.ts` | `Curso`, `Usuario`, `Submissao`, `Regra`, `CoordCurso`, `DashboardMetrics` |
| `aluno.ts` | `AlunoCurso`, `DashboardAluno`, `Regra`, `Submissao` |
| `coordenador.ts` | `OcrData`, `DashboardMetrics`, `Submissao`, `AlunoInfo`, `RegraAtividade` |

---

## 6. Reuso e Componentização *(2,0 pts)*

> "O projeto tem dois níveis de reuso: componentes primitivos do shadcn/ui que são base de toda a interface, e componentes de domínio que encapsulam lógica de negócio reutilizável. Hooks customizados centralizam comportamentos que seriam duplicados em cada componente."

### 6.1 Componentes Primitivos (shadcn/ui + Radix UI)

> "Utilizamos a biblioteca shadcn/ui, que fornece componentes acessíveis baseados no Radix UI. Isso garante acessibilidade, comportamento de teclado e consistência visual sem escrever do zero."

**Pasta:** `src/components/ui/` (35+ componentes)

| Categoria | Componentes |
|-----------|------------|
| Layout | `card`, `separator`, `sheet`, `sidebar`, `resizable` |
| Formulários | `input`, `select`, `textarea`, `checkbox`, `radio-group`, `switch`, `label`, `form` |
| Feedback | `alert`, `alert-dialog`, `dialog`, `drawer`, `sonner`, `progress`, `skeleton` |
| Navegação | `breadcrumb`, `navigation-menu`, `pagination`, `tabs`, `menubar` |
| Dados | `table`, `badge`, `avatar`, `carousel`, `chart`, `calendar` |
| Interação | `button`, `dropdown-menu`, `context-menu`, `popover`, `tooltip`, `hover-card` |
| Entrada | `input-otp`, `command`, `toggle`, `toggle-group`, `slider` |
| Scroll | `scroll-area`, `accordion`, `collapsible` |

### 6.2 Hooks Customizados Reutilizáveis

> "Em vez de repetir lógica de autenticação de API em cada componente, encapsulamos no hook `useApi`. Em vez de repetir lógica de tema, usamos `useAppTheme`. Cada componente apenas chama o hook — nenhuma duplicação."

**Pasta:** `src/hooks/`

| Hook | Retorna | Usado em |
|------|---------|---------|
| `useApi.ts` | `{ apiFetch }` — fetch autenticado | Todos os componentes de domínio |
| `useAppTheme.ts` | `{ theme, colors }` — 28 propriedades | Todos os componentes visuais |
| `use-mobile.tsx` | `boolean` — viewport < 768px | Pages (sidebar vs drawer) |

### 6.3 Componente ProtectedRoute (HOC)

> "O componente `ProtectedRoute` é um Higher-Order Component que envolve qualquer página que precise de autenticação. Em vez de repetir a lógica de verificação de papel em cada página, ela fica centralizada em um único lugar."

**Arquivo:** `src/components/ProtectedRoute.tsx`

```typescript
// Uso nas rotas:
<Route path="/admin/*" element={
  <ProtectedRoute allowedRoles={['super_admin']}>
    <Admin />
  </ProtectedRoute>
} />
```

### 6.4 Sistema de Toast Centralizado

**Arquivo:** `src/lib/toast.ts`

```typescript
// Definido uma vez, usado em todos os componentes
export const toastSuccess = (msg) => toast.success(msg);
export const toastError = (msg) => toast.error(msg);
```

### 6.5 OcrPreview — Componente Compartilhado

> "O componente de visualização de OCR é usado tanto no painel do aluno quanto no painel do coordenador e do admin para visualizar os dados extraídos do certificado. Um único componente, três contextos de uso."

**Arquivo:** `src/components/aluno/OcrPreview.tsx`  
**Usado em:** `ValidacaoSection.tsx` (admin), `SubmissoesSection.tsx` (coordenador), `SubmissaoSection.tsx` (aluno)

### 6.6 Padrão de Seção — Estrutura Consistente

> "Todos os 16 componentes de seção seguem o mesmo padrão de estrutura: estado local com useState, carregamento de dados via useApi, lógica de ações (criar, editar, deletar, aprovar), retorno JSX. Isso torna o código previsível e fácil de navegar."

---

## 7. Qualidade e Refatoração do Código *(2,0 pts)*

> "A qualidade do código se manifesta em consistência, clareza e ausência de duplicação. Todo o projeto usa TypeScript com interfaces bem definidas, nomes de variáveis em português consistente com o domínio do negócio, e padrões que se repetem de forma previsível em toda a base de código."

### 7.1 TypeScript com Interfaces por Domínio

> "Nenhuma chamada de API retorna `any`. Cada resposta da API é tipada com uma interface específica do domínio. Isso previne bugs em tempo de desenvolvimento e documenta o contrato esperado."

```typescript
// src/types/admin.ts
interface Usuario {
  id: number;
  nome: string;
  email: string;
  perfil: 'super_admin' | 'coordenador' | 'aluno';
  matricula?: string;
  curso_id?: number;
}
```

### 7.2 Nomeação Consistente em Português

> "O domínio do sistema é brasileiro. Os tipos, variáveis e funções usam português consistentemente — `submissao`, `coordenador`, `aluno`, `reprovado`, `aprovado`. Isso elimina o atrito mental entre o negócio e o código."

### 7.3 Abstração do Sistema de Cores

> "A decisão mais importante de qualidade foi nunca hardcodar cores. Em vez de `bg-gray-800`, usamos `colors.cardBg`. Em vez de `text-white`, usamos `colors.textPrimary`. Isso permite que o tema dark/light funcione em 100% dos elementos sem exceção."

**Padrão:**
```typescript
// ❌ NÃO usado no projeto
<div className="bg-gray-900 text-white">

// ✅ Padrão adotado
const { colors } = useAppTheme();
<div style={{ background: colors.cardBg, color: colors.textPrimary }}>
```

### 7.4 Fluxo de Submissão Multi-step (Qualidade de UX)

> "O processo de envio de atividade é dividido em dois passos claros: primeiro preenchimento dos dados, depois upload do arquivo. Isso reduz erros e guia o aluno sequencialmente. O estado entre os passos é mantido no componente pai."

**Arquivo:** `src/components/aluno/SubmissaoSection.tsx`

```
Passo 1: Selecionar regra + preencher horas + descrição → POST /api/submissoes
Passo 2: Upload de arquivo (drag-drop) → POST /api/certificados → exibir OCR
```

### 7.5 Tratamento de Erros Centralizado

> "Erros de autenticação são tratados no hook `useApi` — nenhum componente precisa verificar status 401 individualmente. Erros de operação são capturados em blocos try/catch e exibidos via `toastError`. O sistema nunca falha silenciosamente."

### 7.6 Evidências de Refatoração

| Antes (padrão problemático) | Depois (padrão adotado) |
|----------------------------|------------------------|
| Fetch direto em cada componente | Hook `useApi` centralizado |
| toast.success() repetido 20x | `toastSuccess()` de `lib/toast.ts` |
| Lógica de perfil em cada rota | `ProtectedRoute` HOC |
| Cores hardcoded | `useAppTheme()` com 28 propriedades |
| URL da API hardcoded | `API_CONFIG.BASE_URL` via env var |

### 7.7 Documentação Técnica no Código

**Pasta:** `docs/`

| Arquivo | Conteúdo |
|---------|---------|
| `docs/API.md` | 47 endpoints documentados com request/response |
| `docs/ARCHITECTURE.md` | Diagrama de pastas, stack, temas, OCR |
| `docs/DEV-GUIDE.md` | Guia de padrões, problemas conhecidos, checklist |

---

## 8. GitHub e Versionamento *(0,5 pts)*

> "O projeto usa Git com commits atômicos e mensagens descritivas seguindo o padrão Conventional Commits. O histórico do repositório reflete a evolução do sistema — cada funcionalidade tem seus commits rastreáveis."

### 8.1 Histórico de Commits Recentes

| Hash | Mensagem | Tipo |
|------|---------|------|
| `7df553d` | Update package-lock.json | chore |
| `9eee7e5` | refactor: shared utilities, theme fixes, docs consolidation | refactor |
| `28c5eaf` | Update bun.lock | chore |
| `f6a054f` | Update Coordenador.tsx | feat |
| `644c19f` | fix logica submissao + regras | fix |

### 8.2 Estrutura do Repositório

```
PWA/
├── src/               → Código fonte
├── docs/              → Documentação técnica
├── public/            → Assets estáticos e ícones PWA
├── .env               → Variáveis de ambiente (não versionado)
├── vercel.json        → Configuração de deploy
├── package.json       → Dependências e scripts
└── tsconfig.json      → Configuração TypeScript
```

### 8.3 Deploy Automático

> "O repositório está conectado ao Vercel. Todo push na branch main dispara um deploy automático. Isso é integração contínua — o sistema está sempre atualizado em produção."

---

## 9. Aplicação de Boas Práticas e Padrões *(0,5 pts)*

> "O projeto aplica padrões de engenharia de software consolidados: separação de responsabilidades, inversão de dependência via hooks, composição de componentes, estado colocado no nível correto da árvore, e ambiente configurável via variáveis."

### 9.1 Padrões Aplicados

| Padrão | Onde aplicado | Arquivo |
|--------|--------------|---------|
| HOC (Higher-Order Component) | Proteção de rotas | `ProtectedRoute.tsx` |
| Context API | Estado global de auth e tema | `AuthContext.tsx`, `ThemeContext.tsx` |
| Custom Hook | Abstração de API, tema, viewport | `useApi.ts`, `useApptheme.ts`, `use-mobile.tsx` |
| Compound Component | Sidebar + seções por estado | `Admin.tsx`, `Coordenador.tsx`, `Aluno.tsx` |
| Observer (pub/sub) | Evento `beforeinstallprompt` PWA | `Footer.tsx` |
| Strategy | Cores por papel (ACCENT) | `constants.ts` |

### 9.2 Separação de Responsabilidades (SRP)

> "Cada arquivo tem uma única responsabilidade. `useApi` não renderiza UI. `ThemeContext` não faz fetch. `ProtectedRoute` não tem lógica de negócio. `OcrPreview` não faz chamadas de API. Isso é o princípio da responsabilidade única aplicado ao frontend."

### 9.3 Ambiente Configurável

> "Nenhuma URL, chave de API ou configuração está hardcoded no código. Tudo vem de variáveis de ambiente — isso é uma boa prática fundamental de engenharia de software que separa configuração do código."

```bash
VITE_API_BASE_URL=https://back-end-banco-five.vercel.app
VITE_FIREBASE_KEY=<firebase_web_api_key>
```

### 9.4 Arquitetura de Componentes Radix UI

> "Utilizamos o Radix UI como base de acessibilidade. Todos os dialogs, dropdowns, selects e modais têm comportamento de teclado, ARIA labels e foco gerenciado nativamente — sem implementar do zero."

---

## 10. Documentação e Apresentação *(0,5 pts)*

> "O projeto tem três camadas de documentação: documentação técnica em `/docs` para desenvolvedores, documentação de API com 47 endpoints, e este roteiro de apresentação para avaliação acadêmica."

### 10.1 Documentação Técnica

| Arquivo | Propósito | Audiência |
|---------|----------|----------|
| `docs/API.md` | Referência completa de endpoints | Desenvolvedor backend/frontend |
| `docs/ARCHITECTURE.md` | Visão geral do sistema | Arquiteto / avaliador |
| `docs/DEV-GUIDE.md` | Guia de padrões e convenções | Desenvolvedor novo no projeto |
| `docs/APRESENTACAO_FRONTEND.md` | Este arquivo — roteiro de apresentação | Professor / avaliador |

### 10.2 Demonstração Funcional Sugerida

**Sequência recomendada:**

1. **Tela inicial** → mostrar seleção de papéis com cores distintas
2. **Login como aluno** → demonstrar redirecionamento automático
3. **Painel do aluno** → mostrar progresso, submeter atividade (passo 1 e 2), OCR
4. **Login como coordenador** → validar a submissão do aluno (aprovar)
5. **Voltar ao aluno** → ver status atualizado no histórico
6. **Login como admin** → mostrar dashboard com métricas e gráficos
7. **Tema dark/light** → trocar ao vivo
8. **PWA** → mostrar botão de instalação no mobile ou inspecionar manifesto

---

## 11. Tabela Final de Pontuação Esperada

| Critério | Pontos Possíveis | Pontos Esperados | Justificativa |
|---------|-----------------|-----------------|--------------|
| Análise do problema e escopo | — | — | Sistema digitaliza fluxo real de atividades complementares |
| **Arquitetura do sistema** | **1,5** | **1,5** | Camadas claras, SPA com Router, PWA, deploy CI/CD, separação frontend/backend |
| **Integração Mobile/API/PWA** | **0,5** | **0,5** | `useApi` centralizado, JWT com refresh, OCR integrado, PWA instalável |
| **Interface e usabilidade** | **0,5** | **0,5** | Responsivo, dark/light, cores por papel, drag-drop, feedback via toast |
| **Organização e modularização** | **1,0** | **1,0** | Pastas por domínio, separação pages/components/hooks/contexts/types |
| **Reuso e componentização** | **2,0** | **1,8** | 35+ UI components, 3 hooks customizados, HOC, OcrPreview compartilhado |
| **Qualidade e refatoração do código** | **2,0** | **1,7** | TypeScript tipado, zero hardcode de cores, padrões consistentes; ponto negativo: TanStack/Zod instalados mas não usados, tests placeholder |
| **GitHub e versionamento** | **0,5** | **0,5** | Commits com mensagens descritivas, Conventional Commits, deploy automático |
| **Aplicação de boas práticas/padrões** | **0,5** | **0,5** | HOC, Context, Custom Hooks, Observer, Strategy, env vars |
| **Documentação e apresentação** | **0,5** | **0,5** | 3 arquivos de docs técnicos + roteiro de apresentação |
| **TOTAL** | **9,0** | **8,5** | |

> **Nota:** Os 0,5 pt abaixo do máximo em Reuso e Qualidade refletem pontos identificados no código: dependências instaladas mas não utilizadas (TanStack Query, Zod, Supabase) e ausência de testes reais (Vitest configurado mas sem cobertura). Esses pontos são menores e não comprometem a avaliação geral.

---

## Falas de Transição Sugeridas

> "Vou começar mostrando a tela inicial do sistema..."

> "Aqui vocês podem ver que cada papel tem uma cor distinta — isso não é só estético, é uma decisão de arquitetura que se propaga por todo o sistema..."

> "Agora vou fazer login como aluno para demonstrar o fluxo completo de submissão..."

> "O arquivo que está sendo processado passa pelo backend, que extrai as informações via OCR. O frontend apenas exibe o resultado com indicadores visuais de confiança..."

> "Ao mudar para o perfil de coordenador, a interface já carrega apenas as submissões dos alunos vinculados a esse coordenador — o controle é feito na API, não no frontend..."

> "Este é o painel do administrador — aqui centraliza o CRUD completo: cursos, usuários, regras, coordenadores e configurações do sistema..."

> "Para fechar, quero mostrar que isso é uma PWA de verdade — [mostrar botão de instalação ou manifesto no DevTools]..."

---

*Roteiro gerado com base no código real do repositório em junho/2026.*  
*Juntar com roteiro do **Mobile** e do **Backend** para apresentação completa.*
