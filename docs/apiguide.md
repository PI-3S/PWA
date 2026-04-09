# SGC — Sistema de Gestão de Certificados
## Guia completo da API para desenvolvimento frontend

---

## Base URL

```
https://back-end-banco-five.vercel.app
```

---

## Autenticação

Todas as rotas (exceto login) exigem o header:

```
Authorization: Bearer TOKEN
```

O token é obtido no login e deve ser salvo no `localStorage`.

---

## Perfis de acesso

| Perfil | Área |
|--------|------|
| `super_admin` | PWA Admin |
| `coordenador` | PWA Coordenador |
| `aluno` | App Mobile / Área do Aluno |

Após o login, verificar `usuario.perfil` e bloquear acesso se o perfil não corresponder à área. Não salvar o token nem redirecionar em caso de perfil incorreto.

---

## Credenciais de teste

| Perfil | Email | Senha |
|--------|-------|-------|
| Super Admin | admin@admin.com | admin123 |
| Coordenador | coordenador@email.com | 123456 |
| Aluno | joao@email.com | 123456 |

---

## Rotas

### Autenticação

#### POST /api/auth/login
Realiza o login e retorna o token JWT.

**Body:**
```json
{
  "email": "string",
  "senha": "string"
}
```

**Retorno:**
```json
{
  "success": true,
  "token": "eyJhbGci...",
  "usuario": {
    "uid": "string",
    "nome": "string",
    "email": "string",
    "perfil": "super_admin | coordenador | aluno",
    "curso_id": "string | null"
  }
}
```

---

### Usuários

#### GET /api/usuarios
Lista usuários. Coordenador vê apenas alunos dos seus cursos. Super Admin vê todos.

**Query params opcionais:**
- `?perfil=coordenador` — filtra por perfil
- `?perfil=aluno` — filtra por perfil
- `?curso_id=ID` — filtra alunos de um curso específico

**Retorno:**
```json
{
  "success": true,
  "usuarios": [
    {
      "id": "string",
      "nome": "string",
      "email": "string",
      "perfil": "string",
      "matricula": "string | null",
      "curso_id": "string | null",
      "created_at": "string"
    }
  ]
}
```

#### POST /api/usuarios
Cria um novo usuário. Apenas `super_admin` e `coordenador` podem usar.

**Body:**
```json
{
  "nome": "string",
  "email": "string",
  "senha": "string",
  "perfil": "super_admin | coordenador | aluno",
  "matricula": "string | null",
  "curso_id": "string | null"
}
```

**Retorno:**
```json
{
  "success": true,
  "uid": "string",
  "mensagem": "Usuário criado com sucesso!"
}
```

#### PATCH /api/usuarios/:id
Atualiza dados de um usuário. Coordenador só pode atualizar alunos.

**Body (todos opcionais):**
```json
{
  "nome": "string",
  "curso_id": "string",
  "matricula": "string"
}
```

**Retorno:**
```json
{
  "success": true,
  "mensagem": "Usuário atualizado com sucesso!"
}
```

---

### Cursos

#### GET /api/cursos
Lista todos os cursos. Disponível para todos os perfis autenticados.

**Retorno:**
```json
{
  "success": true,
  "cursos": [
    {
      "id": "string",
      "nome": "string",
      "carga_horaria_minima": 200,
      "criado_por_admin_id": "string",
      "created_at": "string"
    }
  ]
}
```

#### POST /api/cursos
Cria um novo curso. Apenas `super_admin`.

**Body:**
```json
{
  "nome": "string",
  "carga_horaria_minima": 200
}
```

**Retorno:**
```json
{
  "success": true,
  "id": "string",
  "mensagem": "Curso criado com sucesso!"
}
```

---

### Regras de Atividades

#### GET /api/regras
Lista regras de atividades. Aceita filtro por curso.

**Query params opcionais:**
- `?curso_id=ID` — filtra por curso

**Retorno:**
```json
{
  "success": true,
  "regras": [
    {
      "id": "string",
      "area": "string",
      "limite_horas": 60,
      "exige_comprovante": true,
      "curso_id": "string",
      "created_at": "string"
    }
  ]
}
```

#### POST /api/regras
Cria uma nova regra. Apenas `super_admin`.

**Body:**
```json
{
  "area": "string",
  "limite_horas": 60,
  "exige_comprovante": true,
  "curso_id": "string"
}
```

**Retorno:**
```json
{
  "success": true,
  "id": "string",
  "mensagem": "Regra criada com sucesso!"
}
```

> **Atenção:** não é possível criar duas regras com a mesma área no mesmo curso.

---

### Submissões

#### GET /api/submissoes
Lista submissões filtradas automaticamente por perfil:
- `aluno` → vê apenas suas próprias submissões
- `coordenador` → vê submissões dos cursos que coordena
- `super_admin` → vê todas

**Retorno:**
```json
{
  "success": true,
  "submissoes": [
    {
      "id": "string",
      "aluno_id": "string",
      "coordenador_id": "string | null",
      "regra_id": "string",
      "status": "pendente | aprovado | reprovado",
      "data_envio": "string",
      "data_validacao": "string | null"
    }
  ]
}
```

#### POST /api/submissoes
Cria uma nova submissão. Apenas `aluno`.

**Body:**
```json
{
  "regra_id": "string",
  "tipo": "string",
  "descricao": "string | null",
  "carga_horaria_solicitada": 40
}
```

**Retorno:**
```json
{
  "success": true,
  "id": "string",
  "mensagem": "Submissão criada com sucesso!"
}
```

> **Atenção:** o aluno não pode criar duas submissões com status `pendente` ou `aprovado` para a mesma regra.

#### PATCH /api/submissoes/:id
Aprova ou reprova uma submissão. Apenas `coordenador` e `super_admin`.

**Body:**
```json
{
  "status": "aprovado | reprovado"
}
```

**Retorno:**
```json
{
  "success": true,
  "mensagem": "Submissão aprovado com sucesso!"
}
```

> **Efeito colateral:** ao aprovar ou reprovar, um e-mail é enviado automaticamente para o aluno.

---

### Certificados

#### GET /api/certificados
Lista certificados. Aceita filtro por submissão.

**Query params opcionais:**
- `?submissao_id=ID` — filtra por submissão

**Retorno:**
```json
{
  "success": true,
  "certificados": [
    {
      "id": "string",
      "submissao_id": "string",
      "nome_arquivo": "string",
      "url_arquivo": "string",
      "processado_ocr": true,
      "texto_extraido": "string | null",
      "created_at": "string"
    }
  ]
}
```

#### POST /api/certificados
Faz upload de um certificado. Apenas `aluno`. Usar `form-data`.

**Form-data:**
- `submissao_id` — string (obrigatório)
- `arquivo` — file PDF, JPG, PNG ou WEBP (obrigatório, máx. 4MB)

**Retorno:**
```json
{
  "success": true,
  "id": "string",
  "url_arquivo": "string",
  "texto_extraido": "string | null",
  "mensagem": "Certificado enviado com sucesso!"
}
```

> **Atenção:** cada submissão aceita apenas um certificado. O OCR é executado automaticamente para PDF, JPG e PNG.

---

### Vínculo Coordenador / Curso

#### GET /api/coordenadores-cursos
Lista vínculos entre coordenadores e cursos. Apenas `super_admin`.

**Query params opcionais:**
- `?curso_id=ID` — filtra por curso

**Retorno:**
```json
{
  "success": true,
  "vinculos": [
    {
      "id": "string",
      "usuario_id": "string",
      "curso_id": "string",
      "created_at": "string"
    }
  ]
}
```

#### POST /api/coordenadores-cursos
Vincula um coordenador a um curso. Apenas `super_admin`.

**Body:**
```json
{
  "usuario_id": "string",
  "curso_id": "string"
}
```

**Retorno:**
```json
{
  "success": true,
  "mensagem": "Coordenador vinculado ao curso com sucesso!"
}
```

---

### Vínculo Aluno / Curso

#### GET /api/alunos-cursos
Lista cursos do aluno logado ou de um aluno específico.

**Query params opcionais:**
- `?usuario_id=ID` — busca cursos de um aluno específico (admin/coordenador)

**Retorno:**
```json
{
  "success": true,
  "vinculos": [
    {
      "id": "string",
      "curso_id": "string",
      "curso_nome": "string",
      "created_at": "string"
    }
  ]
}
```

#### POST /api/alunos-cursos
Vincula um aluno a um curso. Apenas `coordenador` e `super_admin`.

**Body:**
```json
{
  "usuario_id": "string",
  "curso_id": "string"
}
```

#### DELETE /api/alunos-cursos/:id
Remove o vínculo de um aluno com um curso. Apenas `coordenador` e `super_admin`.

---

### Dashboard

#### GET /api/dashboard/coordenador
Retorna métricas para coordenador e super_admin.

**Retorno:**
```json
{
  "success": true,
  "metricas": {
    "total_submissoes": 8,
    "pendentes": 5,
    "aprovadas": 2,
    "reprovadas": 1,
    "por_area": [
      {
        "area": "string",
        "total": 3,
        "aprovadas": 1,
        "pendentes": 2,
        "reprovadas": 0
      }
    ],
    "por_curso": [
      {
        "curso": "string",
        "total": 3,
        "aprovadas": 1,
        "pendentes": 2,
        "reprovadas": 0
      }
    ]
  }
}
```

#### GET /api/dashboard/aluno
Retorna métricas individuais do aluno logado.

**Retorno:**
```json
{
  "success": true,
  "metricas": {
    "total_submissoes": 3,
    "pendentes": 2,
    "aprovadas": 1,
    "reprovadas": 0,
    "total_horas_aprovadas": 40,
    "carga_horaria_minima": 200,
    "progresso_percentual": 20,
    "horas_por_area": [
      {
        "area": "string",
        "horas": 40,
        "limite": 60
      }
    ]
  }
}
```

---

## Status possíveis

| Status | Descrição |
|--------|-----------|
| `pendente` | Aguardando validação do coordenador |
| `aprovado` | Validado e aprovado |
| `reprovado` | Analisado e reprovado |

> Não existem outros status. Não usar "Em Análise", "Ajuste Solicitado" ou similares.

---

## Erros comuns

| Erro | Causa |
|------|-------|
| `Token não fornecido` | Header Authorization ausente |
| `Token inválido ou expirado` | Token expirado ou mal formatado |
| `Acesso negado` | Perfil sem permissão para a rota |
| `Usuário não encontrado` | UID não existe no Firestore |
| `Você já possui uma submissão pendente ou aprovada para essa regra` | Submissão duplicada |
| `Essa submissão já possui um certificado enviado` | Upload duplicado |
| `Já existe uma regra para essa área nesse curso` | Regra duplicada |
| `Coordenador já vinculado a esse curso` | Vínculo duplicado |
| `Aluno já vinculado a esse curso` | Vínculo duplicado |

---

## Fluxo de nova submissão (aluno)

```
1. GET /api/alunos-cursos          → pega os cursos do aluno
2. GET /api/regras?curso_id=ID     → carrega as áreas disponíveis
3. POST /api/submissoes            → cria a submissão → guarda o id retornado
4. POST /api/certificados          → faz upload do certificado com o submissao_id
```

> A submissão e o upload do certificado são duas chamadas separadas. Nunca tentar enviar tudo em uma só requisição.

---

## Fluxo de validação (coordenador)

```
1. GET /api/submissoes                          → lista submissões pendentes
2. GET /api/certificados?submissao_id=ID        → busca o certificado da submissão
3. PATCH /api/submissoes/:id                    → aprova ou reprova
```

> Ao aprovar ou reprovar, o e-mail é enviado automaticamente para o aluno. Não é necessário nenhuma chamada adicional.

---

## E-mails automáticos

O sistema envia e-mails automaticamente nos seguintes eventos:

| Evento | Destinatário |
|--------|-------------|
| Aluno cria submissão | Coordenador do curso |
| Coordenador aprova submissão | Aluno |
| Coordenador reprova submissão | Aluno |

Não é necessário nenhuma chamada de API para disparar os e-mails.

---

## Banco de dados (Firestore)

Coleções existentes:

| Coleção | Descrição |
|---------|-----------|
| `usuarios` | Todos os usuários do sistema |
| `cursos` | Cursos cadastrados |
| `regras_atividade` | Regras de horas por área por curso |
| `submissoes` | Submissões dos alunos |
| `atividades_complementares` | Dados da atividade vinculada à submissão |
| `certificados` | Certificados enviados com URL e texto OCR |
| `coordenadores_cursos` | Vínculos coordenador ↔ curso |
| `alunos_cursos` | Vínculos aluno ↔ curso |
| `logs` | Registro de ações do sistema |