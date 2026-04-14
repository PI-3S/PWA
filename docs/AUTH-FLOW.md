# Fluxo de Autenticacao - SGC

**Data:** 2026-04-14

## Visao Geral

Autenticacao via Firebase Auth (backend customizado), com JWT e refresh token automatico.

---

## Fluxo de Login

```
1. Usuario acessa / -> Index.tsx mostra selecao de perfil
2. Clica em um perfil -> navega para /login/:role
3. Preenche email/senha -> submit no form
4. Login.tsx chama AuthContext.signIn(email, password)
5. signIn faz POST /api/auth/login com { email, senha }
6. Se sucesso:
   - Salva token e usuario no localStorage (multiplas chaves)
   - Atualiza estado do AuthContext (setToken, setUser)
   - Login.tsx le localStorage para validar perfil
   - Se perfil bate com a rota -> toast.success + navigate para o painel
   - Se nao -> limpa localStorage + toast.error
7. ProtectedRoute verifica o perfil e libera/bloqueia acesso
```

## Endpoints de Auth

### Login
```
POST /api/auth/login
Body: { "email": "string", "senha": "string" }
Response: {
  "success": true,
  "token": "eyJhbGci...",
  "refreshToken": "...",
  "usuario": { "uid", "nome", "email", "perfil", "curso_id" }
}
```

### Refresh Token
```
POST https://securetoken.googleapis.com/v1/token?key={FIREBASE_KEY}
Body: grant_type=refresh_token&refresh_token={savedRefreshToken}
Response: { "id_token": "...", "refresh_token": "..." }
```

## Chaves localStorage

| Chave | Conteudo | Setado Por | Lido Por |
|-------|----------|-----------|----------|
| `token` | JWT token | AuthContext.signIn | AuthContext, ProtectedRoute |
| `authToken` | JWT token (compatibilidade) | AuthContext.signIn | Admin, Aluno, Coordenador, api.ts |
| `refreshToken` | Refresh token Firebase | AuthContext.signIn | AuthContext.refreshAccessToken |
| `usuario` | User JSON | AuthContext.signIn | AuthContext, ProtectedRoute, Admin |
| `userData` | User JSON (compatibilidade) | AuthContext.signIn | Admin |
| `tokenExpiry` | Timestamp (Date.now + 24h) | AuthContext.signIn | Admin |
| `userEmail` | Email do usuario | NUNCA SETADO | Admin (fallback) |

> **Nota:** `userEmail` nunca e setado pelo fluxo atual. O Admin tenta ler mas sempre retorna vazio.

## Refresh Token Automatico

- **Intervalo:** a cada 45 minutos
- **Endpoint:** Google securetoken API
- **Firebase Key:** `VITE_FIREBASE_KEY` do `.env`
- **Fallback:** se falhar, faz signOut

## Perfis

| Perfil | Valor no DB | Rota de Login | Rota do Painel |
|--------|------------|--------------|---------------|
| Super Admin | `super_admin` | `/login/superadmin` | `/admin/*` |
| Coordenador | `coordenador` | `/login/coordenador` | `/coordenador/*` |
| Aluno | `aluno` | `/login/aluno` | `/aluno/*` |

## Logout

Limpa todas as chaves localStorage e redireciona:
- AuthContext.signOut -> `window.location.href = '/'` (page reload)
- Admin handleLogout -> `navigate('/')` (sem reload)
- Aluno signOut -> `navigate('/')` (via AuthContext)
- Coordenador handleLogout -> `localStorage.clear()` + `navigate('/')`

> **Inconsistencia:** cada pagina faz logout de forma diferente.
