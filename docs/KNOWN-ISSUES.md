# Problemas Conhecidos - SGC

**Data:** 2026-04-14 (ATUALIZADO)

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
- **Solução:** Mapeamento robusto com múltiplos fallbacks

### 10. handleLogout do Admin limpava chave errada
- **Status:** ✅ RESOLVIDO
- **Solução:** Corrigido para `welcomed_admin`

---

## ⚠️ PROBLEMAS AINDA ATIVOS

### Críticos

#### 1. Componentes Órfãos com Imports Quebrados
- **Arquivos:** `FilterBar.tsx`, `SubmissionQueue.tsx`, `EvaluationDialog.tsx`
- **Problema:** Importam tipos que não existem mais
- **Solução:** Reescrever ou remover

#### 2. Coordenador.tsx e Aluno.tsx não revisados
- **Problema:** Podem conter mesmos bugs que foram corrigidos no Admin
- **Solução:** Aplicar mesmas correções

### Médios

#### 3. signOut com page reload
- **Local:** `AuthContext.tsx:146`
- **Solução:** Usar `navigate` do react-router

#### 4. ProtectedRoute sem try/catch
- **Local:** `ProtectedRoute.tsx:25-27`
- **Solução:** Envolver `JSON.parse` em try/catch

#### 5. apiClient não utilizado
- **Solução:** Unificar chamadas HTTP

### Baixos

#### 6. Configurações TypeScript permissivas
#### 7. Testes inexistentes
#### 8. CSS classes indefinidas

---

## 📋 Checklist para Coordenador.tsx e Aluno.tsx

- [ ] Verificar ordem dos hooks
- [ ] Adicionar mapeamento robusto de campos
- [ ] Verificar CRUD completo
- [ ] Testar dashboard
- [ ] Adicionar proteções de exclusão