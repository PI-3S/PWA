# Fluxo de Autenticação - Frontend

Este documento documenta o fluxo completo de autenticação, chaves localStorage e mapa de rotas do frontend.

---

## Fluxo de Autenticação

### 1. Login

```
Usuário → Login Page → AuthContext.signIn()
                ↓
        POST /api/auth/login
                ↓
        { success, token, refreshToken, usuario }
                ↓
        Salva no localStorage
                ↓
        Atualiza estado (token, user)
                ↓
        Redireciona para rota protegida
```

### 2. Refresh Automático de Token

```
A cada 45 minutos → refreshAccessToken()
                ↓
        POST https://securetoken.googleapis.com/v1/token
                ↓
        { id_token, refresh_token }
                ↓
        Atualiza localStorage e estado
                ↓
        Se falhar → signOut()
```

### 3. Logout

```
Usuário → signOut()
                ↓
        Remove todas as chaves do localStorage
                ↓
        Limpa estado (token, user)
                ↓
        Redireciona para home
```

### 4. Verificação de Rota Protegida

```
Acesso à rota → ProtectedRoute
                ↓
        loading? → Spinner
                ↓
        !user? → Redireciona para login do perfil
                ↓
        allowedRoles && !allowedRoles.includes(user.perfil)?
                ↓
        Redireciona para rota do perfil
                ↓
        Renderiza children
```

---

## Chaves localStorage

### Chaves Principais

| Chave | Tipo | Descrição | Onde é definida |
|-------|------|-----------|-----------------|
| `token` | string | Token de acesso JWT | AuthContext.signIn() |
| `refreshToken` | string | Token de refresh do Firebase | AuthContext.signIn() |
| `usuario` | JSON | Dados do usuário logado | AuthContext.signIn() |

### Chaves de Compatibilidade (Admin)

| Chave | Tipo | Descrição | Onde é definida |
|-------|------|-----------|-----------------|
| `authToken` | string | Cópia do token (compatibilidade Admin) | AuthContext.signIn() |
| `userData` | JSON | Cópia dos dados do usuário (compatibilidade Admin) | AuthContext.signIn() |
| `tokenExpiry` | string | Timestamp de expiração (24h) | AuthContext.signIn() |
| `userEmail` | string | Email do usuário (removido no logout) | - |

### Chaves de Sessão (SessionStorage)

| Chave | Tipo | Descrição | Onde é definida |
|-------|------|-----------|-----------------|
| `welcomed_admin` | string | Flag de boas-vindas do Admin | Admin.tsx |

---

## Mapa Completo de Rotas

### Rotas Públicas

| Rota | Componente | Descrição |
|------|------------|-----------|
| `/` | Index | Página inicial (seleção de perfil) |
| `/login/:role` | Login | Página de login com parâmetro de role |
| `/login` | Navigate | Redireciona para `/` |

### Rotas Protegidas

| Rota | Componente | Perfis Permitidos | Descrição |
|------|------------|-------------------|-----------|
| `/coordenador/*` | Coordenador | `coordenador`, `super_admin` | Painel do coordenador |
| `/aluno/*` | Aluno | `aluno` | Painel do aluno |
| `/admin/*` | Admin | `super_admin` | Painel do administrador |

### Rota de Erro

| Rota | Componente | Descrição |
|------|------------|-----------|
| `*` | NotFound | Página 404 |

---

## Perfis de Usuário

| Perfil | Rota de Login | Rota Principal | Acesso a |
|--------|--------------|----------------|-----------|
| `super_admin` | `/login/superadmin` | `/admin/*` | Todas as rotas |
| `coordenador` | `/login/coordenador` | `/coordenador/*` | `/coordenador/*` |
| `aluno` | `/login/aluno` | `/aluno/*` | `/aluno/*` |

---

## Componentes de Autenticação

### AuthContext

**Localização:** `src/contexts/AuthContext.tsx`

**Interface:**
```typescript
interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => void;
}
```

**Funcionalidades:**
- Carrega dados do localStorage ao inicializar
- Renova token automaticamente a cada 45 minutos
- Faz login via API
- Faz logout removendo todas as chaves

### ProtectedRoute

**Localização:** `src/components/ProtectedRoute.tsx`

**Props:**
```typescript
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserPerfil[];
}
```

**Comportamento:**
1. Exibe spinner enquanto carrega
2. Redireciona para login do perfil se não autenticado
3. Redireciona para rota do perfil se não tiver permissão
4. Renderiza children se autenticado e autorizado

---

## Endpoints de Autenticação

### Login

| Método | URL | Body | Response |
|--------|-----|------|----------|
| POST | `/api/auth/login` | `{ email, senha }` | `{ success, token, refreshToken, usuario }` |

### Refresh Token (Firebase)

| Método | URL | Body | Response |
|--------|-----|------|----------|
| POST | `https://securetoken.googleapis.com/v1/token?key={FIREBASE_KEY}` | `grant_type=refresh_token&refresh_token={token}` | `{ id_token, refresh_token }` |

---

## Diagrama de Fluxo

```
┌─────────────┐
│   Index     │
│  (Home)     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Login     │
│  (:role)    │
└──────┬──────┘
       │
       ▼
┌─────────────────────────┐
│   AuthContext.signIn()  │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│  POST /api/auth/login   │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│  Salva localStorage     │
│  - token                │
│  - refreshToken         │
│  - usuario              │
│  - authToken (compat)    │
│  - userData (compat)    │
│  - tokenExpiry          │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│  ProtectedRoute         │
│  (verifica perfil)      │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│  Rota Protegida         │
│  (/admin/*)             │
│  (/coordenador/*)       │
│  (/aluno/*)             │
└─────────────────────────┘
       │
       │ (a cada 45min)
       ▼
┌─────────────────────────┐
│  refreshAccessToken()   │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│  Firebase Token API      │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│  Atualiza localStorage  │
└─────────────────────────┘
```

---

## Notas Importantes

### Compatibilidade
- O sistema mantém chaves duplicadas (`token`/`authToken`, `usuario`/`userData`) para compatibilidade com o componente Admin
- O ProtectedRoute verifica ambas as chaves ao determinar o perfil para redirecionamento

### Segurança
- Tokens são armazenados no localStorage (não seguro para produção, considerar cookies httpOnly)
- Refresh automático evita expiração de sessão durante uso
- Logout remove todas as chaves para evitar sessões residuais

### Firebase
- Utiliza Firebase Authentication para refresh de tokens
- Requer `FIREBASE_KEY` configurada em `API_CONFIG`
- Tokens do Firebase duram 60 minutos, refresh ocorre aos 45 minutos