# Problemas Conhecidos - SGC

**Data:** 2026-04-21 (ATUALIZADO)

## ✅ PROBLEMAS RESOLVIDOS

### 1. CRUD de Cursos - PATCH e DELETE inexistentes
- **Status:** ✅ RESOLVIDO
- **Solução:** Endpoints adicionados em `routes/cursos.js`

### 2. Super Admin não via dados no Dashboard
- **Status:** ✅ RESOLVIDO
- **Solução:** Adicionada verificação `if (perfil === 'super_admin')` no backend

### 3. Configurações de Email hardcoded
- **Status:** ✅ RESOLVIDO
- **Solução:** Coleção `configuracoes` no Firestore + painel admin

### 4. Admin não via senha ao criar usuário
- **Status:** ✅ RESOLVIDO
- **Solução:** Gerador de senha + modal + envio automático de email

### 5. Erro "Cannot access before initialization"
- **Status:** ✅ RESOLVIDO
- **Solução:** `useCallback` movido para antes do `useEffect`

### 6. Regras - PATCH e DELETE inexistentes
- **Status:** ✅ RESOLVIDO
- **Solução:** Endpoints adicionados em `routes/regras.js`

### 7. Usuários - DELETE inexistente
- **Status:** ✅ RESOLVIDO
- **Solução:** Endpoint adicionado com proteções

### 8. Coordenadores (vínculos) - DELETE inexistente
- **Status:** ✅ RESOLVIDO
- **Solução:** Endpoint adicionado em `routes/coordenadores_cursos.js`

### 9. Campos vazios na tabela de validação
- **Status:** ✅ RESOLVIDO
- **Solução:** Mapeamento robusto com múltiplos fallbacks + chamadas paralelas à API

### 10. handleLogout do Admin limpava chave errada
- **Status:** ✅ RESOLVIDO
- **Solução:** Corrigido para `welcomed_admin`

### 11. React is not defined (Coordenador.tsx)
- **Status:** ✅ RESOLVIDO
- **Solução:** Adicionado `React` ao import statement

### 12. React is not defined (Aluno.tsx)
- **Status:** ✅ RESOLVIDO
- **Solução:** Adicionado `React` ao import statement (usado em React.Fragment)

### 13. Aluno.tsx layout centralizado (não ocupava tela inteira)
- **Status:** ✅ RESOLVIDO
- **Solução:** Removido `max-w-[1400px] mx-auto`, adicionado `min-h-screen w-full flex`

### 14. Upload de arquivo no Aluno.tsx confuso
- **Status:** ✅ RESOLVIDO
- **Solução:** Redesenhada área de upload com drag-and-drop, aviso de limite 4MB, feedback visual claro

### 15. Admin.tsx Validação sem aluno_nome/curso_nome/area
- **Status:** ✅ RESOLVIDO
- **Solução:** `loadSubmissoes` agora faz chamadas paralelas e enriquece dados com Maps

### 16. Login sem opção "Esqueci minha senha"
- **Status:** ✅ RESOLVIDO
- **Solução:** Adicionado Dialog com recuperação de senha via `/api/auth/forgot-password`

---

## ⚠️ PROBLEMAS AINDA ATIVOS

### Baixos

#### 1. signOut com page reload
- **Local:** `AuthContext.tsx:146`
- **Solução:** Usar `navigate` do react-router

#### 2. ProtectedRoute sem try/catch
- **Local:** `ProtectedRoute.tsx:25-27`
- **Solução:** Envolver `JSON.parse` em try/catch

#### 3. apiClient não utilizado
- **Solução:** Unificar chamadas HTTP

#### 4. Configurações TypeScript permissivas
#### 5. Testes inexistentes
#### 6. CSS classes indefinidas

---

## 📋 Componentes Órfãos (pendente remoção/refatoração)

- `FilterBar.tsx` - imports quebrados
- `SubmissionQueue.tsx` - imports quebrados
- `EvaluationDialog.tsx` - imports quebrados
- `NavLink.tsx` - não utilizado

---

**Nota:** Todos os problemas críticos e médios foram resolvidos. O sistema está estável para uso.