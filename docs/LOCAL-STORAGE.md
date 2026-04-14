# Chaves localStorage - SGC

**Data:** 2026-04-14

## Chaves Ativas

| Chave | Tipo | Setado Por | Lido Por | Expira |
|-------|------|-----------|----------|--------|
| `token` | string (JWT) | AuthContext.signIn() | AuthContext, ProtectedRoute, Admin (fallback) | Implicito (backend) |
| `authToken` | string (JWT) | AuthContext.signIn() | api.ts, Admin, Aluno, Coordenador | Implicito (backend) |
| `refreshToken` | string (Firebase) | AuthContext.signIn() | AuthContext.refreshAccessToken() | Revogavel pelo Firebase |
| `usuario` | JSON (User) | AuthContext.signIn() | AuthContext, ProtectedRoute, Admin (fallback) | Nao |
| `userData` | JSON (User) | AuthContext.signIn() | Admin | Nao |
| `tokenExpiry` | string (timestamp) | AuthContext.signIn() | Admin | 24h (hardcoded) |

## Chaves Removidas no signOut

Todas as 6 chaves acima sao removidas no logout, mais:
- `userEmail` - removida mas **nunca setada**

## Chave sessionStorage

| Chave | Tipo | Setado Por | Funcao |
|-------|------|-----------|--------|
| `welcomed_admin` | string | Admin.tsx | Evitar toast duplicado de boas-vindas |

## Fluxo de Dados no Login

```
signIn(email, password)
  -> POST /api/auth/login
  -> Response: { success, token, refreshToken, usuario }
  -> localStorage.setItem('token', data.token)
  -> localStorage.setItem('refreshToken', data.refreshToken)
  -> localStorage.setItem('usuario', JSON.stringify(data.usuario))
  -> localStorage.setItem('authToken', data.token)          // compatibilidade
  -> localStorage.setItem('userData', JSON.stringify(data.usuario))  // compatibilidade
  -> localStorage.setItem('tokenExpiry', Date.now + 24h)   // compatibilidade
```

## Interface User (salva em usuario/userData)

```typescript
interface User {
  uid: string;
  nome: string;
  email: string;
  perfil: 'super_admin' | 'coordenador' | 'aluno';
  curso_id: string | null;
  matricula?: string | null;
}
```

## Problemas Conhecidos

1. **`userEmail` nunca e setada** - o Admin tenta ler mas sempre retorna null
2. **`tokenExpiry` so e lido pelo Admin** - AuthContext nao usa para validar expiracao
3. **Duplicacao** - `token`/`authToken` e `usuario`/userData` contem os mesmos dados
4. **`localStorage.clear()` no Coordenador** - limpa TUDO incluindo chaves de outros apps se houver
