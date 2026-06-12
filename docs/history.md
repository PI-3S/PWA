# Histórico de Desenvolvimento — Maestria SGC SENAC

## Timeline

### Fase 1 — Setup e Autenticação (07–09/04/2026)

**07/04** — Setup inicial: Vite + React + TypeScript, Tailwind CSS + shadcn/ui, React Router v6, Context API para auth.

**08/04** — Área Admin v1: dashboard com métricas, CRUD de cursos, gestão de usuários, validação de submissões, preview de certificados, regras, vínculos coordenador-curso.

**09/04** — Estabilização de auth:
- `AuthContext`: compatibilidade multi-chave localStorage, `authToken`/`userData` para Admin, `tokenExpiry`, `signOut` completo
- `Login.tsx`: delay 100ms antes do redirect, limpeza localStorage em perfil inválido
- `ProtectedRoute`: redirect inteligente por perfil, fallback entre chaves localStorage
- `App.tsx`: adicionado `/*` nas rotas protegidas, fallback `/login → /`
- Resolvidos: "Token não fornecido", redirect travado, toast conflitante

---

### Fase 2 — CRUD Completo e Configurações (14/04/2026)

**Backend:** PATCH+DELETE para cursos, usuários, regras, coordenadores-cursos. Nova rota `/api/configuracoes/*` para email e sistema. Email refatorado para buscar config do Firestore.

**Frontend (Admin.tsx):**
- Ordem correta dos hooks (`useCallback` antes `useEffect`)
- Mapeamento robusto com fallbacks por campo
- Gerador de senha segura (12 chars, maiúscula + minúscula + número + símbolo)
- Modal de confirmação com credenciais + botão copiar + envio por email
- Nova seção Configurações (SMTP, parâmetros do sistema)
- Dashboard corrigido para Super Admin

Resolvidos: dashboard vazio, CRUD incompleto, configurações hardcoded, Admin sem senha ao criar usuário, "Cannot access before initialization", campos vazios na validação.

---

### Fase 3 — Revisão Completa Frontend (21/04/2026)

**Admin:** `loadSubmissoes` com chamadas paralelas + enrichment (Promise.all + Maps).

**Coordenador:** import React corrigido, hooks na ordem certa, mapeamento robusto, fetchSubmissoes paralelo, cálculo de progresso, layout tela inteira.

**Aluno:** import React corrigido, layout corrigido, upload redesenhado (drag-and-drop funcional, limite 4MB, feedback visual, botão remover arquivo).

**Login:** funcionalidade "Esqueci minha senha" com dialog + `POST /api/auth/forgot-password`.

Resolvidos: "React is not defined" (Coord + Aluno), layout centralizado, upload confuso, validação sem aluno_nome/curso_nome, login sem recuperação de senha.

---

### Fase 4 — OCR e Refatoração de Componentes (07/05/2026)

**Backend:** `extrairCamposEstruturados()` em `ocr.js` (regex para nome, carga horária, data, instituição, tipo + score de confiança). Endpoint DELETE para certificados. `POST /api/certificados` retorna `dados_ocr`.

**Novos componentes:**
- `OcrPreview.tsx` — visualização lado a lado (doc + dados), indicador de confiança, edição manual, toggle texto completo, alerta confiança baixa
- Admin.tsx, Coordenador.tsx, Aluno.tsx divididos em subcomponentes (pastas `admin/`, `aluno/`, `coordenador/`)

**Coordenador:** Dashboard simplificado (ações diretas removidas → botão "Avaliar" navega para Submissões). `RegrasSection` corrigida (tela azul, normalização de dados, categoriaBadge com null checks).

Resolvidos: tela azul OCR preview, accentGreen indefinido, categoriaBadge undefined, dashboard com ações desnecessárias.

---

### Fase 5 — Tema + Refatoração de Utilitários (2026-06)

**Theme fixes:** Todos os componentes e pages migrados de classes Tailwind hardcoded para inline styles via `useAppTheme()` e `ACCENT.*`. Afetados: HistoricoSection, ProgressoSection, SubmissaoSection, CadastrarSection, RegrasSection (coord), SubmissoesSection, AlunosSection, UsuariosSection, ValidacaoSection, Footer, ThemeSwitcher, ProtectedRoute, Login.

**Novos utilitários centralizados:**
- `src/lib/toast.ts` — `toastSuccess` / `toastError` (antes duplicados em 3 pages)
- `src/hooks/useApi.ts` — `apiFetch` com Bearer token e logout automático 401/403 (antes duplicado)
- `src/lib/constants.ts` — `ACCENT` colors por perfil (antes duplicado em cada page)

**Refatoração de pages:** Admin.tsx, Coordenador.tsx, Aluno.tsx reescritos para usar os utilitários centralizados. Removidas todas as duplicações de `toastStyle/Success/Error`, `apiFetch useCallback`, `handleLogout` verboso e `accentXxx` locais.

---

## Estatísticas

| Métrica | Valor |
|---------|-------|
| Total de commits | 80+ |
| Linhas de código | ~15.000 |
| Componentes criados | 50+ |
| Bugs resolvidos | 40+ |
| Features implementadas | 45+ |
| Endpoints API | 35+ |

---

## Lições Aprendidas

1. **Compatibilidade localStorage:** Padrão único ou fallbacks explícitos — nunca misturar sem documentar
2. **Redirecionamentos:** Delay mínimo evita race conditions entre setState e navigate
3. **Ordem dos hooks:** `useCallback` sempre ANTES do `useEffect` que o utiliza
4. **Mapeamento robusto:** API pode retornar campos com nomes diferentes — sempre múltiplos fallbacks
5. **Enrichment eficiente:** `Promise.all` + `Map` para lookup O(1) em vez de `.find()` O(n)
6. **CRUD completo:** Todo recurso precisa de POST, GET, PATCH, DELETE desde o início
7. **Proteção ao excluir:** Verificar vínculos antes de qualquer DELETE
8. **Configurações dinâmicas:** Firestore > `.env` para coisas que mudam em produção
9. **Tema via inline styles:** Classes Tailwind hardcoded ignoram o tema — usar `colors.*` sempre
10. **Cores de tema:** Verificar se a cor existe antes de usar (`panelBg` vs `cardBg`)
11. **OCR:** Regex com fallbacks + score de confiança + sempre permitir correção manual
12. **Drag-and-drop upload:** Feedback visual + limite de tamanho + botão remover são obrigatórios para UX
13. **Componentização:** Pages acima de ~400 linhas devem ser divididas em subcomponentes
14. **Duplicação:** `toastStyle`, `apiFetch`, accent colors eram idênticos em 3 arquivos — extrair para `lib/` e `hooks/`

---

## Status Atual

| Área | Status |
|------|--------|
| Autenticação | Completo |
| Login + recuperação de senha | Completo |
| Admin (todas as seções) | Completo |
| Coordenador (todas as seções) | Completo |
| Aluno (todas as seções) | Completo |
| Backend endpoints | Completo |
| OCR | Completo |
| Tema dark/light | Completo |
| Refatoração utilitários | Completo |
| Testes automatizados | Pendente |

---

## Tarefas Futuras (Baixa Prioridade)

- [ ] Remover componentes órfãos (FilterBar, SubmissionQueue, EvaluationDialog)
- [ ] Habilitar `strictNullChecks` no tsconfig
- [ ] Adicionar testes unitários com Vitest
- [ ] Testes E2E com Playwright
- [ ] Usar React Hook Form + Zod nos formulários
- [ ] Notificações em tempo real (WebSockets)
- [ ] Modo offline completo (PWA Service Workers)
- [ ] Exportação de relatórios
- [ ] CI/CD com GitHub Actions
