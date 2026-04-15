# API Overview - SGC

**Data:** 2026-04-14 (ATUALIZADO)

## Base URL
https://back-end-banco-five.vercel.app

text

## Documentacao Completa

Consultar `./apiguide.md` para referencia detalhada de todos os endpoints.

## Resumo dos Endpoints (ATUALIZADO)

| Metodo | Endpoint | Auth | Role | Funcao | Status |
|--------|---------|------|------|--------|--------|
| POST | `/api/auth/login` | Nao | - | Login | ✅ |
| GET | `/api/usuarios` | Sim | coord, admin | Lista usuarios | ✅ |
| POST | `/api/usuarios` | Sim | coord, admin | Cria usuario | ✅ |
| PATCH | `/api/usuarios/:id` | Sim | coord, admin | Atualiza usuario | ✅ |
| DELETE | `/api/usuarios/:id` | Sim | coord, admin | Exclui usuario | ✅ |
| GET | `/api/cursos` | Sim | Todos | Lista cursos | ✅ |
| POST | `/api/cursos` | Sim | admin | Cria curso | ✅ |
| PATCH | `/api/cursos/:id` | Sim | admin | Atualiza curso | ✅ |
| DELETE | `/api/cursos/:id` | Sim | admin | Exclui curso | ✅ |
| GET | `/api/regras` | Sim | Todos | Lista regras | ✅ |
| POST | `/api/regras` | Sim | admin | Cria regra | ✅ |
| PATCH | `/api/regras/:id` | Sim | admin | Atualiza regra | ✅ |
| DELETE | `/api/regras/:id` | Sim | admin | Exclui regra | ✅ |
| GET | `/api/submissoes` | Sim | Todos | Lista submissoes | ✅ |
| POST | `/api/submissoes` | Sim | aluno | Cria submissao | ✅ |
| PATCH | `/api/submissoes/:id` | Sim | coord, admin | Aprova/reprova | ✅ |
| GET | `/api/certificados` | Sim | Todos | Lista certificados | ✅ |
| POST | `/api/certificados` | Sim | aluno | Upload certificado | ✅ |
| GET | `/api/coordenadores-cursos` | Sim | admin | Lista vinculos | ✅ |
| POST | `/api/coordenadores-cursos` | Sim | admin | Cria vinculo | ✅ |
| DELETE | `/api/coordenadores-cursos/:id` | Sim | admin | Remove vinculo | ✅ |
| GET | `/api/alunos-cursos` | Sim | Todos | Lista vinculos | ✅ |
| POST | `/api/alunos-cursos` | Sim | coord, admin | Vincula aluno | ✅ |
| DELETE | `/api/alunos-cursos/:id` | Sim | coord, admin | Remove vinculo | ✅ |
| GET | `/api/dashboard/coordenador` | Sim | coord, admin | Metricas | ✅ |
| GET | `/api/dashboard/aluno` | Sim | aluno | Metricas | ✅ |
| 🆕 GET | `/api/configuracoes/:id` | Sim | admin | Busca config | ✅ |
| 🆕 POST | `/api/configuracoes/:id` | Sim | admin | Salva config | ✅ |
| 🆕 POST | `/api/configuracoes/test-email` | Sim | admin | Testa email | ✅ |

## 🆕 Novos Endpoints (Abril 2026)

### Configurações
```javascript
// GET /api/configuracoes/email_config
// Response: { success: true, config: { host, port, user, pass, from, ativo } }

// POST /api/configuracoes/email_config
// Body: { host, port, user, pass, from, ativo }
// Response: { success: true, mensagem: "Configuração salva!" }

// POST /api/configuracoes/test-email
// Body: { to: "email@teste.com" }
// Response: { success: true, mensagem: "Email enviado!" }
Cursos (endpoints adicionados)
javascript
// PATCH /api/cursos/:id
// Body: { nome?, carga_horaria_minima? }

// DELETE /api/cursos/:id
// Proteção: Não exclui se houver alunos ou coordenadores vinculados
Regras (endpoints adicionados)
javascript
// PATCH /api/regras/:id
// Body: { area?, limite_horas?, exige_comprovante?, curso_id? }

// DELETE /api/regras/:id
// Proteção: Não exclui se houver submissões vinculadas
Usuários (endpoint adicionado)
javascript
// DELETE /api/usuarios/:id
// Proteção: Não exclui último super_admin
// Remove vínculos automaticamente (alunos_cursos, coordenadores_cursos)
Como Cada Pagina Consome a API
Admin.tsx ✅
Usa apiFetch interno:

/api/dashboard/coordenador - metricas

/api/cursos - CRUD completo

/api/usuarios - CRUD completo

/api/submissoes - validacao

/api/regras - CRUD completo

/api/coordenadores-cursos - vinculos

/api/certificados - preview

🆕 /api/configuracoes - email e sistema

Coordenador.tsx (A REVISAR)
/api/dashboard/coordenador - metricas

/api/submissoes - aprovar/reprovar

/api/usuarios - lista/cadastra alunos

/api/cursos - lista cursos

/api/certificados - visualiza

Aluno.tsx (A REVISAR)
/api/alunos-cursos - seus cursos

/api/dashboard/aluno - progresso

/api/regras - regras do curso

/api/submissoes - cria/lista

/api/certificados - upload

Problemas Resolvidos ✅
~~Campos inconsistentes~~ → Mapeamento robusto

~~Dashboard vazio Super Admin~~ → Corrigido no backend

~~PATCH/DELETE inexistentes~~ → Todos implementados

~~Configurações hardcoded~~ → Firestore