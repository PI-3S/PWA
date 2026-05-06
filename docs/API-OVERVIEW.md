# API Overview

Todas as chamadas feitas pelo frontend às APIs do back-end. `BASE_URL` padrão: `https://back-end-banco-five.vercel.app`.

---

## Auth

### `POST /api/auth/login`
**Usado em:** `Login.tsx`

**Body (JSON):**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `email` | `string` | Email do usuário |
| `senha` | `string` | Senha em texto plano |

**Resposta esperada:**
```json
{
  "success": true,
  "token": "string",
  "refreshToken": "string",
  "usuario": {
    "uid": "string",
    "nome": "string",
    "email": "string",
    "perfil": "super_admin" | "coordenador" | "aluno",
    "curso_id": "string | null",
    "matricula": "string | null"
  }
}
```

---

### `POST /api/auth/forgot-password`
**Usado em:** `Login.tsx` (diálogo "Esqueci minha senha")

**Body (JSON):**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `email` | `string` | Email do usuário (em lowercase) |

**Resposta esperada:**
```json
{ "mensagem": "string" }  // ou { "error": "string" }
```

---

## Dashboard

### `GET /api/dashboard/aluno`
**Usado em:** `Aluno.tsx` (`fetchDashboard`)

**Query params:** `?curso_id={id}` (opcional)

**Headers:** `Authorization: Bearer {token}`

**Resposta esperada:**
```json
{
  "metricas": {
    "total_submissoes": "number",
    "pendentes": "number",
    "aprovadas": "number",
    "reprovadas": "number",
    "total_horas_aprovadas": "number",
    "carga_horaria_minima": "number",
    "progresso_percentual": "number",
    "horas_por_area": [
      { "area": "string", "horas": "number", "limite": "number" }
    ]
  }
}
```
> Fallback: o código também aceita a resposta direta sem o wrapper `metricas`.

---

### `GET /api/dashboard/coordenador`
**Usado em:** `Admin.tsx` (`loadDashboard`), `Coordenador.tsx` (`fetchDashboard`)

**Headers:** `Authorization: Bearer {token}`

**Resposta esperada:**
```json
{
  "metricas": {
    "total_submissoes": "number",
    "pendentes": "number",
    "aprovadas": "number",
    "reprovadas": "number",
    "por_area": [
      {
        "area": "string", "total": "number",
        "aprovadas": "number", "pendentes": "number", "reprovadas": "number"
      }
    ],
    "por_curso": [
      {
        "curso": "string", "total": "number",
        "aprovadas": "number", "pendentes": "number", "reprovadas": "number"
      }
    ],
    "total_alunos": "number",
    "quantidade_alunos": "number"
  }
}
```
> Fallback: aceita a resposta direta sem o wrapper `metricas`.

---

## Cursos

### `GET /api/cursos`
**Usado em:** `Admin.tsx`, `Coordenador.tsx`, `Aluno.tsx`

**Headers:** `Authorization: Bearer {token}`

**Resposta esperada:**
```json
{
  "cursos": [
    {
      "id": "string",
      "nome": "string",
      "carga_horaria_minima": "number"
    }
  ]
}
```
> Fallback: aceita `Array` direto.

---

### `POST /api/cursos`
**Usado em:** `Admin.tsx` (`handleSaveCourse`)

**Headers:** `Authorization: Bearer {token}`

**Body (JSON):**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `nome` | `string` | Nome do curso |
| `carga_horaria_minima` | `number` | Carga horária mínima (default 200) |

---

### `PATCH /api/cursos/{id}`
**Usado em:** `Admin.tsx` (`handleSaveCourse`)

**Headers:** `Authorization: Bearer {token}`

**Body (JSON):** mesmo do `POST`

---

### `DELETE /api/cursos/{id}`
**Usado em:** `Admin.tsx` (`handleDeleteCourse`)

**Headers:** `Authorization: Bearer {token}`

---

## Usuários

### `GET /api/usuarios`
**Usado em:** `Admin.tsx` (`loadUsuarios`, `loadSubmissoes`), `Coordenador.tsx` (`fetchSubmissoes`, `fetchAlunos`)

**Query params:** `?perfil={perfil}` (Admin.tsx `loadUsuarios` com filtro `roleFilter`)

**Headers:** `Authorization: Bearer {token}`

**Resposta esperada:**
```json
{
  "usuarios": [
    {
      "id": "string",
      "nome": "string",
      "email": "string",
      "perfil": "aluno" | "coordenador" | "super_admin",
      "curso_id": "string | null",
      "matricula": "string | null",
      "curso_nome": "string | null"
    }
  ]
}
```
> Fallback: aceita `Array` direto ou `data`.

---

### `POST /api/usuarios`
**Usado em:** `Admin.tsx` (`handleCreateUser`), `Coordenador.tsx` (`handleCadastrar`)

**Headers:** `Authorization: Bearer {token}`

**Body (JSON):**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `nome` | `string` | Nome completo |
| `email` | `string` | Email (enviado em lowercase) |
| `senha` | `string` | Senha (mínimo 6 caracteres) |
| `perfil` | `string` | `aluno` ou `coordenador` |
| `matricula` | `string \| null` | Número de matrícula |
| `curso_id` | `string \| null` | ID do curso |

---

### `PATCH /api/usuarios/{id}`
**Usado em:** `Admin.tsx` (`handleEditUser`) — tenta primeiro

**Headers:** `Authorization: Bearer {token}`

**Body (JSON):**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `nome` | `string` | Nome completo |
| `email` | `string` | Email |
| `matricula` | `string` | Número de matrícula |
| `curso_id` | `string` | ID do curso |
| `perfil` | `string` | Perfil |

---

### `PUT /api/usuarios/{id}`
**Usado em:** `Admin.tsx` (`handleEditUser`) — fallback quando PATCH retorna 404/405

**Headers:** `Authorization: Bearer {token}`

**Body (JSON):** mesmo do `PATCH`

---

### `DELETE /api/usuarios/{id}`
**Usado em:** `Admin.tsx` (`handleDeleteUser`)

**Headers:** `Authorization: Bearer {token}`

---

### `POST /api/usuarios/{id}/reset-senha`
**Usado em:** `Admin.tsx` (`handleResetSenha`)

**Headers:** `Authorization: Bearer {token}`

**Resposta esperada:**
```json
{ "mensagem": "string" }
```

---

## Submissões

### `GET /api/submissoes`
**Usado em:** `Admin.tsx` (`loadSubmissoes`), `Aluno.tsx` (`fetchSubmissoes`)

**Headers:** `Authorization: Bearer {token}`

**Resposta esperada:**
```json
{
  "submissoes": [
    {
      "id": "string",
      "aluno_id": "string",
      "regra_id": "string",
      "status": "pendente" | "aprovado" | "reprovado" | "correcao",
      "data_envio": "string (ISO)",
      "data_validacao": "string (ISO) | null",
      "descricao": "string | null",
      "carga_horaria_solicitada": "number",
      "tipo": "string | null",
      "documento_url": "string | null"
    }
  ]
}
```
> Fallback: aceita `Array` direto, `data`.

---

### `POST /api/submissoes`
**Usado em:** `Aluno.tsx` (`handleStep1`)

**Headers:** `Authorization: Bearer {token}`

**Body (JSON):**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `regra_id` | `string` | ID da regra/área |
| `tipo` | `string` | Tipo da atividade |
| `descricao` | `string` | Descrição (opcional) |
| `carga_horaria_solicitada` | `number` | Horas solicitadas |

**Resposta esperada:**
```json
{ "id": "string" }
```

---

### `PATCH /api/submissoes/{id}`
**Usado em:** `Admin.tsx` (`handleStatusChange`, `handleCorrecao`), `Coordenador.tsx` (`handleDecision`)

**Headers:** `Authorization: Bearer {token}`

**Body (JSON) — `handleStatusChange` (Admin):**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `status` | `"aprovado"` \| `"reprovado"` | Novo status |

**Body (JSON) — `handleCorrecao` / `handleDecision` (Coordenador):**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `status` | `"correcao"` | Status de correção |
| `observacao` | `string` | Observação do coordenador |
| `coordenador_id` | `string` | UID do coordenador (somente `handleDecision`) |

---

## Certificados

### `POST /api/certificados`
**Usado em:** `Aluno.tsx` (`handleUpload`)

**Headers:** `Authorization: Bearer {token}` (sem `Content-Type: application/json`)

**Body (FormData):**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `submissao_id` | `string` | ID da submissão criada |
| `arquivo` | `File` | Arquivo do certificado (máx. 4MB) |

**Resposta esperada:** `res.ok` (status 2xx) indica sucesso.

---

### `GET /api/certificados?submissao_id={id}`
**Usado em:** `Admin.tsx` (`loadCertificado`), `Coordenador.tsx` (`fetchCertificados`)

**Headers:** `Authorization: Bearer {token}`

**Resposta esperada:**
```json
{
  "certificados": [
    {
      "id": "string",
      "nome_arquivo": "string",
      "url_arquivo": "string",
      "texto_extraido": "string | null"
    }
  ]
}
```

---

## Regras

### `GET /api/regras`
**Usado em:** `Admin.tsx` (`loadSubmissoes`, `loadRegras`), `Coordenador.tsx` (`fetchSubmissoes`), `Aluno.tsx` (`fetchRegras`)

**Query params:** `?curso_id={id}` (Aluno.tsx)

**Headers:** `Authorization: Bearer {token}`

**Resposta esperada:**
```json
{
  "regras": [
    {
      "id": "string",
      "area": "string",
      "limite_horas": "number",
      "exige_comprovante": "boolean",
      "curso_id": "string",
      "curso_nome": "string | null"
    }
  ]
}
```
> Fallback: aceita `Array` direto.

---

### `POST /api/regras`
**Usado em:** `Admin.tsx` (`handleSaveRule`)

**Headers:** `Authorization: Bearer {token}`

**Body (JSON):**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `area` | `string` | Nome da área de atividade |
| `limite_horas` | `number` | Limite de horas (default 60) |
| `exige_comprovante` | `boolean` | Se exige comprovante |
| `curso_id` | `string` | ID do curso |

---

### `PATCH /api/regras/{id}`
**Usado em:** `Admin.tsx` (`handleEditRule`)

**Headers:** `Authorization: Bearer {token}`

**Body (JSON):** mesmo do `POST`

---

### `DELETE /api/regras/{id}`
**Usado em:** `Admin.tsx` (`handleDeleteRule`)

**Headers:** `Authorization: Bearer {token}`

---

## Vínculos Coordenador-Curso

### `GET /api/coordenadores-cursos`
**Usado em:** `Admin.tsx` (`loadCoordCursos`)

**Headers:** `Authorization: Bearer {token}`

**Resposta esperada:**
```json
{
  "vinculos": [
    {
      "id": "string",
      "usuario_id": "string",
      "curso_id": "string"
    }
  ]
}
```

---

### `POST /api/coordenadores-cursos`
**Usado em:** `Admin.tsx` (`handleCreateCoordVinculo`)

**Headers:** `Authorization: Bearer {token}`

**Body (JSON):**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `usuario_id` | `string` | ID do usuário coordenador |
| `curso_id` | `string` | ID do curso |

---

### `DELETE /api/coordenadores-cursos/{id}`
**Usado em:** `Admin.tsx` (`handleRemoveCoordVinculo`)

**Headers:** `Authorization: Bearer {token}`

---

## Aluno-Curso

### `GET /api/alunos-cursos`
**Usado em:** `Aluno.tsx` (`fetchCursos`)

**Headers:** `Authorization: Bearer {token}`

**Resposta esperada:**
```json
{
  "vinculos": [
    {
      "id": "string",
      "curso_id": "string",
      "curso_nome": "string",
      "carga_horaria_minima": "number"
    }
  ]
}
```
> Fallback: aceita `Array`, `cursos`.

---

## Configurações (Admin)

### `GET /api/configuracoes/email_config`
**Usado em:** `Admin.tsx` (`loadEmailConfig`)

**Headers:** `Authorization: Bearer {token}`

**Resposta esperada:**
```json
{
  "config": {
    "host": "string",
    "port": "number",
    "secure": "boolean",
    "user": "string",
    "pass": "string",
    "from": "string",
    "ativo": "boolean"
  }
}
```

---

### `POST /api/configuracoes/email_config`
**Usado em:** `Admin.tsx` (`saveEmailConfig`)

**Headers:** `Authorization: Bearer {token}`

**Body (JSON):** mesmo formato da resposta de `GET`.

---

### `GET /api/configuracoes/sistema_config`
**Usado em:** `Admin.tsx` (`loadSistemaConfig`)

**Headers:** `Authorization: Bearer {token}`

**Resposta esperada:**
```json
{
  "config": {
    "nome_sistema": "string",
    "instituicao": "string",
    "logo_url": "string",
    "frontend_url": "string",
    "cor_primaria": "string",
    "cor_secundaria": "string"
  }
}
```

---

### `POST /api/configuracoes/sistema_config`
**Usado em:** `Admin.tsx` (`saveSistemaConfig`)

**Headers:** `Authorization: Bearer {token}`

**Body (JSON):** mesmo formato da resposta de `GET`.

---

### `POST /api/configuracoes/test-email`
**Usado em:** `Admin.tsx` (`testEmailConfig`)

**Headers:** `Authorization: Bearer {token}`

**Body (JSON):**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `to` | `string` | Email destinatário para teste |

---

## Tabela Resumida

| Método | Endpoint | Usado em | Upload |
|--------|----------|----------|--------|
| POST | `/api/auth/login` | Login | Não |
| POST | `/api/auth/forgot-password` | Login | Não |
| GET | `/api/dashboard/aluno` | Aluno | — |
| GET | `/api/dashboard/coordenador` | Admin, Coordenador | — |
| GET | `/api/cursos` | Admin, Coordenador, Aluno | — |
| POST | `/api/cursos` | Admin | Não |
| PATCH | `/api/cursos/{id}` | Admin | Não |
| DELETE | `/api/cursos/{id}` | Admin | — |
| GET | `/api/usuarios` | Admin, Coordenador | — |
| POST | `/api/usuarios` | Admin, Coordenador | Não |
| PATCH | `/api/usuarios/{id}` | Admin | Não |
| PUT | `/api/usuarios/{id}` | Admin | Não |
| DELETE | `/api/usuarios/{id}` | Admin | — |
| POST | `/api/usuarios/{id}/reset-senha` | Admin | Não |
| GET | `/api/submissoes` | Admin, Aluno | — |
| POST | `/api/submissoes` | Aluno | Não |
| PATCH | `/api/submissoes/{id}` | Admin, Coordenador | Não |
| POST | `/api/certificados` | Aluno | **Sim (FormData)** |
| GET | `/api/certificados?submissao_id=` | Admin, Coordenador | — |
| GET | `/api/regras` | Admin, Coordenador, Aluno | — |
| POST | `/api/regras` | Admin | Não |
| PATCH | `/api/regras/{id}` | Admin | Não |
| DELETE | `/api/regras/{id}` | Admin | — |
| GET | `/api/coordenadores-cursos` | Admin | — |
| POST | `/api/coordenadores-cursos` | Admin | Não |
| DELETE | `/api/coordenadores-cursos/{id}` | Admin | — |
| GET | `/api/alunos-cursos` | Aluno | — |
| GET | `/api/configuracoes/email_config` | Admin | — |
| POST | `/api/configuracoes/email_config` | Admin | Não |
| GET | `/api/configuracoes/sistema_config` | Admin | — |
| POST | `/api/configuracoes/sistema_config` | Admin | Não |
| POST | `/api/configuracoes/test-email` | Admin | Não |
