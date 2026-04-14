# Mapa de Rotas - SGC

**Data:** 2026-04-14

## Rotas Publicas

| Rota | Componente | Descricao |
|------|-----------|-----------|
| `/` | `Index.tsx` | Home - selecao de perfil de acesso |
| `/login/:role` | `Login.tsx` | Login especifico por perfil |
| `/login` | -> `/` | Fallback, redireciona para home |

## Rotas Protegidas

| Rota | Componente | Roles Permitidas |
|------|-----------|-----------------|
| `/admin/*` | `Admin.tsx` | `super_admin` |
| `/coordenador/*` | `Coordenador.tsx` | `coordenador`, `super_admin` |
| `/aluno/*` | `Aluno.tsx` | `aluno` |
| `*` | `NotFound.tsx` | Qualquer (404) |

## Protecao (ProtectedRoute)

O componente `ProtectedRoute.tsx` faz 3 verificacoes:

1. **Loading:** enquanto carrega dados do localStorage, mostra spinner
2. **Nao autenticado:** se nao ha usuario no estado, redireciona para `/login/:perfil` baseado no localStorage
3. **Perfil nao permitido:** se o usuario nao esta em `allowedRoles`, redireciona para seu login de perfil

### allowedRoles por Rota

| Rota | allowedRoles |
|------|-------------|
| `/admin/*` | `['super_admin']` |
| `/coordenador/*` | `['coordenador', 'super_admin']` |
| `/aluno/*` | `['aluno']` |

## Rotas Internas dos Painéis

### Admin (`/admin/*`)
Nao usa sub-rotas do React Router. Gerencia secoes internas via state (`section`):
- `dashboard` - Metricas gerais
- `courses` - Gestao de cursos
- `users` - Gestao de usuarios
- `validation` - Validacao de submissoes
- `rules` - Regras de atividades
- `coordinators` - Vinculos coordenador-curso

### Coordenador (`/coordenador/*`)
Mesmo padrao do Admin - secoes via state (`activeSection`):
- `dashboard` - Metricas
- `submissoes` - Lista e avaliacao de submissoes
- `alunos` - Lista de alunos
- `cadastrar` - Cadastro de novos alunos

### Aluno (`/aluno/*`)
Mesmo padrao - secoes via state (`activeSection`):
- `progress` - Progresso e horas
- `submit` - Nova submissao
- `history` - Historico de submissoes
