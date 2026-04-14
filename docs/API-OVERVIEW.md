# API Overview - SGC

**Data:** 2026-04-14

## Base URL

```
https://back-end-banco-five.vercel.app
```

## Documentacao Completa

Consultar `./docs/apiguide.md` para referencia detalhada de todos os endpoints.

## Resumo dos Endpoints

| Metodo | Endpoint | Auth | Role | Funcao |
|--------|---------|------|------|--------|
| POST | `/api/auth/login` | Nao | - | Login |
| GET | `/api/usuarios` | Sim | coord, admin | Lista usuarios |
| POST | `/api/usuarios` | Sim | coord, admin | Cria usuario |
| PATCH | `/api/usuarios/:id` | Sim | coord, admin | Atualiza usuario |
| GET | `/api/cursos` | Sim | Todos | Lista cursos |
| POST | `/api/cursos` | Sim | admin | Cria curso |
| GET | `/api/regras` | Sim | Todos | Lista regras |
| POST | `/api/regras` | Sim | admin | Cria regra |
| GET | `/api/submissoes` | Sim | Todos (filtrado) | Lista submissoes |
| POST | `/api/submissoes` | Sim | aluno | Cria submissao |
| PATCH | `/api/submissoes/:id` | Sim | coord, admin | Aprova/reprova |
| GET | `/api/certificados` | Sim | Todos | Lista certificados |
| POST | `/api/certificados` | Sim | aluno | Upload cert (form-data) |
| GET | `/api/coordenadores-cursos` | Sim | admin | Lista vinculos |
| POST | `/api/coordenadores-cursos` | Sim | admin | Cria vinculo |
| GET | `/api/alunos-cursos` | Sim | Todos | Lista vinculos aluno-curso |
| POST | `/api/alunos-cursos` | Sim | coord, admin | Vincula aluno-curso |
| DELETE | `/api/alunos-cursos/:id` | Sim | coord, admin | Remove vinculo |
| GET | `/api/dashboard/coordenador` | Sim | coord, admin | Metricas coordenador |
| GET | `/api/dashboard/aluno` | Sim | aluno | Metricas aluno |

## Como Cada Pagina Consome a API

### Admin.tsx
Usa `apiFetch` interno com `getToken()`:
- `/api/dashboard/coordenador` - metricas
- `/api/cursos` - CRUD cursos
- `/api/usuarios` - gestao usuarios
- `/api/submissoes` - validacao
- `/api/regras` - regras
- `/api/coordenadores-cursos` - vinculos
- `/api/certificados` - preview certificados

### Coordenador.tsx
Usa `fetch` direto com `authHeaders()`:
- `/api/dashboard/coordenador` - metricas
- `/api/submissoes` - lista e aprova/reprova
- `/api/usuarios` - lista alunos
- `/api/cursos` - lista cursos
- `/api/certificados` - certificados
- `/api/usuarios` POST - cadastrar aluno

### Aluno.tsx
Usa `fetch` direto com `authHeaders()`:
- `/api/alunos-cursos` - cursos do aluno
- `/api/dashboard/aluno` - metricas
- `/api/regras` - regras do curso
- `/api/submissoes` - cria e lista
- `/api/certificados` POST - upload arquivo

## Problemas na Integracao

1. **Campos inconsistentes:** `carga_horaria_solicitada` vs `horas_solicitadas`
2. **Respostas diferentes:** alguns retornam `{ success, data }`, outros `{ data }` direto
3. **apiClient nao usado:** servico generico existe mas nao e utilizado
4. **Sem retry automatico:** se token expirar durante request, nao ha retry com refresh
