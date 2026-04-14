# Problemas Conhecidos - SGC

**Data:** 2026-04-14

## Criticos

### 1. Componentes Orfaos com Imports Quebrados
- **Arquivos:** `FilterBar.tsx`, `SubmissionQueue.tsx`, `EvaluationDialog.tsx`
- **Problema:** Importam `ActivityCategory`, `categoryLabels` que nao existem mais em `data.ts`
- **Impacto:** Nao compilam se importados
- **Solucao:** Reescrever imports ou remover arquivos

### 2. Autenticacao Inconsistente entre Painéis
- **Problema:** Cada painel faz auth de forma diferente
  - Admin: `getToken()` + `getUser()` proprios
  - Coordenador: `getToken()` + `getUser()` proprios
  - Aluno: `useAuth()` do contexto
- **Impacto:** Comportamento inconsistente, bugs dificeis de rastrear
- **Solucao:** Centralizar tudo no AuthContext

### 3. `userEmail` Nunca e Setada
- **Local:** `Admin.tsx:108` tenta ler `localStorage.getItem('userEmail')`
- **Problema:** Nenhuma parte do codigo seta essa chave
- **Impacto:** Fallback para nome de usuario sempre falha

## Medium

### 4. signOut Faz Page Reload
- **Local:** `AuthContext.tsx:146`
- **Problema:** `window.location.href = '/login'` recarrega pagina
- **Solucao:** Usar `navigate` ou `useNavigate` do react-router

### 5. ProtectedRoute sem try/catch
- **Local:** `ProtectedRoute.tsx:25-27`
- **Problema:** `JSON.parse` sem tratamento de erro
- **Solucao:** Envolver em try/catch

### 6. Token Refresh Silenciosamente Falho
- **Local:** `AuthContext.tsx:29-56`
- **Problema:** Se `FIREBASE_KEY` nao definido, falha sem feedback
- **Solucao:** Validar env vars e notificar usuario

### 7. Admin Aceita Perfil `admin` Inexistente
- **Local:** `Admin.tsx:156`
- **Problema:** Verifica `perfil !== 'super_admin' && perfil !== 'admin'`
- **Impacto:** Perfil `admin` nao existe no sistema

### 8. Duplicacao de Logica HTTP
- **Problema:** 3 formas diferentes de fazer requests
- **Solucao:** Unificar usando `apiClient` ou criar hook `useApi`

### 9. Logout Inconsistente
- **Admin:** limpa chaves especificas + `navigate('/')`
- **Coordenador:** `localStorage.clear()` + `navigate('/')`
- **Aluno:** `signOut()` do AuthContext -> page reload
- **Solucao:** Usar sempre `signOut()` do AuthContext

## Baixa

### 10. Configuracoes TypeScript Permissivas
- `strictNullChecks: false`, `noImplicitAny: false`
- Permite erros silenciosos

### 11. ESLint Desabilitado para Unused Vars
- Codigo morto nao e detectado

### 12. README.md Vazio
- Placeholder "TODO: Document your project here"

### 13. Testes Inexistentes
- So placeholder `expect(true).toBe(true)`

### 14. CSS Classes Indefinidas
- `futuristic-bg`, `glass-card`, `scan-line`, `text-glow`, `animate-pulse-slow` usadas mas nao definidas

### 15. handleLogout do Admin Limpa Chave Errada
- `Admin.tsx:430`: `sessionStorage.removeItem('welcomed')` deveria ser `'welcomed_admin'`

### 16. apiClient Nao Utilizado
- `src/services/api.ts` exporta modulo generico que ninguem usa

### 17. NavLink.tsx Nao Utilizado
- Componente wrapper sem uso

---

## Prioridade de Correcao Sugerida

1. Centralizar autenticacao no AuthContext (resolve #2, #3, #7, #9)
2. Proteger ProtectedRoute com try/catch (resolve #5)
3. Usar apiClient ou criar hook unificado (resolve #8)
4. Corrigir signOut para nao recarregar pagina (resolve #4)
5. Validar FIREBASE_KEY no startup (resolve #6)
6. Habilitar `strictNullChecks` gradualmente (resolve #10)
