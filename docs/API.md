# API — Maestria SGC SENAC

**Base URL:** `https://back-end-banco-five.vercel.app` (ou `VITE_API_BASE_URL`)

Todas as requisições autenticadas incluem `Authorization: Bearer {token}`.  
Exceção: `POST /api/certificados` usa `multipart/form-data` (sem Content-Type explícito).

---

## Tabela Completa de Endpoints

| Método | Endpoint | Usado em | Upload |
|--------|----------|----------|--------|
| POST | `/api/auth/login` | Login | — |
| POST | `/api/auth/forgot-password` | Login | — |
| GET | `/api/dashboard/aluno` | Aluno | — |
| GET | `/api/dashboard/coordenador` | Admin, Coordenador | — |
| GET | `/api/cursos` | Admin, Coordenador, Aluno | — |
| POST | `/api/cursos` | Admin | — |
| PATCH | `/api/cursos/{id}` | Admin | — |
| DELETE | `/api/cursos/{id}` | Admin | — |
| GET | `/api/usuarios` | Admin, Coordenador | — |
| POST | `/api/usuarios` | Admin, Coordenador | — |
| PATCH | `/api/usuarios/{id}` | Admin | — |
| PUT | `/api/usuarios/{id}` | Admin (fallback PATCH 404/405) | — |
| DELETE | `/api/usuarios/{id}` | Admin | — |
| POST | `/api/usuarios/{id}/reset-senha` | Admin | — |
| GET | `/api/submissoes` | Admin, Coordenador, Aluno | — |
| POST | `/api/submissoes` | Aluno | — |
| PATCH | `/api/submissoes/{id}` | Admin, Coordenador | — |
| POST | `/api/certificados` | Aluno | **FormData** |
| GET | `/api/certificados?submissao_id=` | Admin, Coordenador | — |
| DELETE | `/api/certificados/{id}` | Aluno | — |
| GET | `/api/regras` | Admin, Coordenador, Aluno | — |
| POST | `/api/regras` | Admin | — |
| PATCH | `/api/regras/{id}` | Admin | — |
| DELETE | `/api/regras/{id}` | Admin | — |
| GET | `/api/coordenadores-cursos` | Admin | — |
| POST | `/api/coordenadores-cursos` | Admin | — |
| DELETE | `/api/coordenadores-cursos/{id}` | Admin | — |
| GET | `/api/alunos-cursos` | Aluno | — |
| GET | `/api/configuracoes/email_config` | Admin | — |
| POST | `/api/configuracoes/email_config` | Admin | — |
| GET | `/api/configuracoes/sistema_config` | Admin | — |
| POST | `/api/configuracoes/sistema_config` | Admin | — |
| POST | `/api/configuracoes/test-email` | Admin | — |

---

## Detalhes por Recurso

### Auth

**POST /api/auth/login**
```json
Body:  { "email": "string", "senha": "string" }
Response: {
  "success": true, "token": "string", "refreshToken": "string",
  "usuario": { "uid": "string", "nome": "string", "email": "string",
               "perfil": "super_admin|coordenador|aluno",
               "curso_id": "string|null", "matricula": "string|null" }
}
```

**POST /api/auth/forgot-password**
```json
Body:  { "email": "string" }
Response: { "mensagem": "string" }
```

---

### Dashboard

**GET /api/dashboard/aluno** — query: `?curso_id={id}`
```json
Response: { "metricas": {
  "total_submissoes": 0, "pendentes": 0, "aprovadas": 0, "reprovadas": 0,
  "total_horas_aprovadas": 0, "carga_horaria_minima": 0, "progresso_percentual": 0,
  "horas_por_area": [{ "area": "string", "horas": 0, "limite": 0 }]
}}
```

**GET /api/dashboard/coordenador**
```json
Response: { "metricas": {
  "total_submissoes": 0, "pendentes": 0, "aprovadas": 0, "reprovadas": 0,
  "por_area": [{ "area": "string", "total": 0, "aprovadas": 0, "pendentes": 0, "reprovadas": 0 }],
  "por_curso": [{ "curso": "string", "total": 0, ... }],
  "total_alunos": 0
}}
```

---

### Cursos

```json
GET  → { "cursos": [{ "id": "string", "nome": "string", "carga_horaria_minima": 200 }] }
POST/PATCH body: { "nome": "string", "carga_horaria_minima": 200 }
```
Proteção DELETE: não exclui se houver alunos ou coordenadores vinculados.

---

### Usuários

```json
GET  → { "usuarios": [{ "id", "nome", "email", "perfil", "curso_id", "matricula", "curso_nome" }] }
      Query: ?perfil=aluno|coordenador

POST body: { "nome", "email", "senha", "perfil": "aluno|coordenador", "matricula", "curso_id" }
PATCH/PUT body: { "nome", "email", "matricula", "curso_id", "perfil" }
POST /{id}/reset-senha → { "mensagem": "string" }
```
Proteção DELETE: não remove o último super_admin.

---

### Submissões

```json
GET  → { "submissoes": [{
  "id", "aluno_id", "regra_id",
  "status": "pendente|aprovado|reprovado|correcao",
  "data_envio": "ISO", "descricao": "string|null",
  "carga_horaria_solicitada": 0, "tipo": "string|null", "documento_url": "string|null"
}]}

POST body: { "regra_id", "tipo", "descricao", "carga_horaria_solicitada" }
POST → { "id": "string" }

PATCH body (aprovar/reprovar): { "status": "aprovado|reprovado" }
PATCH body (correção):  { "status": "correcao", "observacao": "string", "coordenador_id": "string" }
```

---

### Certificados

**POST /api/certificados** — FormData:
```
submissao_id: string
arquivo: File (PDF/JPG/PNG, máx 4MB)
```
Resposta inclui `texto_extraido` e `dados_ocr` (ver seção OCR em ARCHITECTURE.md).

**GET /api/certificados?submissao_id={id}**
```json
{ "certificados": [{ "id", "nome_arquivo", "url_arquivo", "texto_extraido" }] }
```

---

### Regras

```json
GET  → { "regras": [{ "id", "area", "limite_horas", "exige_comprovante", "curso_id", "curso_nome" }] }
      Query: ?curso_id={id}

POST/PATCH body: { "area", "limite_horas": 60, "exige_comprovante": true, "curso_id" }
```
Proteção DELETE: não exclui se houver submissões vinculadas.

---

### Coordenadores-Cursos

```json
GET  → { "vinculos": [{ "id", "usuario_id", "curso_id" }] }
POST body: { "usuario_id", "curso_id" }
```

---

### Alunos-Cursos

```json
GET  → { "vinculos": [{ "id", "curso_id", "curso_nome", "carga_horaria_minima" }] }
```

---

### Configurações

```json
GET/POST /api/configuracoes/email_config
Body/Response: { "config": { "host", "port", "secure", "user", "pass", "from", "ativo" } }

GET/POST /api/configuracoes/sistema_config
Body/Response: { "config": { "nome_sistema", "instituicao", "logo_url", "frontend_url", "cor_primaria", "cor_secundaria" } }

POST /api/configuracoes/test-email
Body: { "to": "email@teste.com" }
```

---

## Autenticação — Fluxo Completo

### Login

```
POST /api/auth/login → { token, refreshToken, usuario }
  → localStorage: token, refreshToken, usuario
  → localStorage (compat): authToken, userData, tokenExpiry
  → setUser() + setToken()
  → redireciona para /admin | /coordenador | /aluno
```

### Refresh Automático (45 min)

```
setInterval 45min → POST https://securetoken.googleapis.com/v1/token
  Body: grant_type=refresh_token&refresh_token={token}
  Sucesso → atualiza token + refreshToken no localStorage
  Falha   → signOut() automático
```

Requer `VITE_FIREBASE_KEY` configurada. Token Firebase expira em 60min; refresh ocorre aos 45min.

### Logout

```
signOut()
  → remove: token, refreshToken, usuario, authToken, userData, tokenExpiry
  → setToken(null), setUser(null)
  → navega para /
```

### ProtectedRoute

```
loading?          → spinner
!user?            → lê localStorage, redireciona /login/{perfil}
perfil inválido?  → redireciona para login do seu perfil
ok?               → renderiza children
```

---

## Chaves localStorage

| Chave | Tipo | Definida por | Lida por |
|-------|------|-------------|----------|
| `token` | JWT | AuthContext.signIn | AuthContext, ProtectedRoute |
| `refreshToken` | Firebase token | AuthContext.signIn | AuthContext.refreshAccessToken |
| `usuario` | JSON (User) | AuthContext.signIn | AuthContext, ProtectedRoute |
| `authToken` | JWT (cópia) | AuthContext.signIn | Admin, Aluno, Coordenador (fallback) |
| `userData` | JSON (cópia) | AuthContext.signIn | Admin (fallback) |
| `tokenExpiry` | timestamp | AuthContext.signIn | Admin |

**SessionStorage:**

| Chave | Tipo | Definida por |
|-------|------|-------------|
| `welcomed_admin` | string | Admin.tsx — evita toast duplicado |

**Problemas conhecidos:**
- `userEmail` nunca é setada mas é tentada no logout
- `tokenExpiry` só lida pelo Admin; AuthContext não a usa para validar expiração
- `token`/`authToken` e `usuario`/`userData` têm conteúdo idêntico (duplicação de compatibilidade)

---

## Perfis e Permissões

| Ação | super_admin | coordenador | aluno |
|------|:-----------:|:-----------:|:-----:|
| CRUD Cursos | ✅ | — | — |
| CRUD Regras | ✅ | — | — |
| Criar usuários | ✅ | ✅ (só alunos) | — |
| Excluir usuários | ✅ | ✅ (alunos do curso) | — |
| Configurações | ✅ | — | — |
| Validar submissões | ✅ | ✅ | — |
| Submeter certificados | — | — | ✅ |

| Perfil | Login URL | Painel URL |
|--------|-----------|------------|
| `super_admin` | `/login/superadmin` | `/admin/*` |
| `coordenador` | `/login/coordenador` | `/coordenador/*` |
| `aluno` | `/login/aluno` | `/aluno/*` |

---

## Hook useApi

Centraliza todas as chamadas autenticadas. Injetar via props nos componentes filhos.

```ts
const { apiFetch } = useApi();
const data = await apiFetch('/api/recurso');  // já retorna JSON parseado
```

**Nunca** chamar `.json()` nem verificar `.ok`/`.status` nos componentes — o hook já trata isso e lança `Error` com a mensagem do backend.

**Exceção:** Upload de certificado usa `fetch` direto porque precisa enviar `FormData` — `apiFetch` serializa JSON.
