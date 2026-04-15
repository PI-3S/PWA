## 📁 6. `ROUTES.md` (ATUALIZADO)

```markdown
# Mapa de Rotas - SGC

**Data:** 2026-04-14 (ATUALIZADO)

## Rotas Publicas

| Rota | Componente | Descricao |
|------|-----------|-----------|
| `/` | `Index.tsx` | Home - selecao de perfil |
| `/login/:role` | `Login.tsx` | Login por perfil |
| `/login` | → `/` | Fallback |

## Rotas Protegidas

| Rota | Componente | Roles Permitidas |
|------|-----------|-----------------|
| `/admin/*` | `Admin.tsx` | `super_admin` |
| `/coordenador/*` | `Coordenador.tsx` | `coordenador`, `super_admin` |
| `/aluno/*` | `Aluno.tsx` | `aluno` |
| `*` | `NotFound.tsx` | Qualquer |

## Rotas Internas dos Painéis

### Admin (`/admin/*`)
Gerencia seções via state (`section`):
- `dashboard` - Métricas gerais ✅
- `courses` - Gestão de cursos ✅
- `users` - Gestão de usuários ✅
- `validation` - Validação de submissões ✅
- `rules` - Regras de atividades ✅
- `coordinators` - Vínculos coordenador-curso ✅
- 🆕 `settings` - Configurações do sistema ✅

### Coordenador (`/coordenador/*`)
Seções via state (`activeSection`):
- `dashboard` - Métricas
- `submissoes` - Lista e avaliação
- `alunos` - Lista de alunos
- `cadastrar` - Cadastro de alunos

### Aluno (`/aluno/*`)
Seções via state (`activeSection`):
- `progress` - Progresso e horas
- `submit` - Nova submissão
- `history` - Histórico