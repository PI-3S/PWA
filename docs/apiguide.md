### 🆕 Cursos - Atualizar e Excluir

#### PATCH /api/cursos/:id
Atualiza um curso existente. Apenas `super_admin`.

**Body (todos opcionais):**
```json
{
  "nome": "string",
  "carga_horaria_minima": 200
}
DELETE /api/cursos/:id
Exclui um curso. Apenas super_admin.

Proteção: Não exclui se houver alunos ou coordenadores vinculados.

🆕 Regras - Atualizar e Excluir
PATCH /api/regras/:id
Atualiza uma regra. Apenas super_admin.

DELETE /api/regras/:id
Exclui uma regra. Apenas super_admin.

Proteção: Não exclui se houver submissões vinculadas.

🆕 Usuários - Excluir
DELETE /api/usuarios/:id
Exclui um usuário. super_admin e coordenador (apenas alunos do seu curso).

Proteção: Não exclui o último super_admin.

🆕 Coordenadores-Cursos - Remover Vínculo
DELETE /api/coordenadores-cursos/:id
Remove um vínculo. Apenas super_admin.

🆕 Configurações do Sistema
GET /api/configuracoes/:id
Busca configuração. Apenas super_admin.

Exemplo: /api/configuracoes/email_config

POST /api/configuracoes/:id
Salva configuração. Apenas super_admin.

POST /api/configuracoes/test-email
Envia email de teste. Apenas super_admin.

Body:

json
{
  "to": "email@teste.com"
}
text

### Para `AUTH-FLOW.md`:

**Substitua TODO o conteúdo** pelo que está correto (o conteúdo de `BACKEND-ROUTES-COMPLETE.md` está no lugar errado).

O `AUTH-FLOW.md` deveria ter:

```markdown
# Fluxo de Autenticacao - SGC

**Data:** 2026-04-14 (ATUALIZADO)

## Visao Geral
Autenticacao via Firebase Auth com JWT e refresh token automático.

## Perfis
| Perfil | Valor no DB | Rota Login | Rota Painel |
|--------|------------|-----------|-------------|
| Super Admin | `super_admin` | `/login/superadmin` | `/admin/*` |
| Coordenador | `coordenador` | `/login/coordenador` | `/coordenador/*` |
| Aluno | `aluno` | `/login/aluno` | `/aluno/*` |

## 🆕 Permissoes por Perfil
| Acao | Super Admin | Coordenador | Aluno |
|------|-------------|-------------|-------|
| CRUD Cursos | ✅ | ❌ | ❌ |
| CRUD Regras | ✅ | ❌ | ❌ |
| Criar usuários | ✅ | ✅ (alunos) | ❌ |
| Excluir usuários | ✅ | ✅ (alunos do curso) | ❌ |
| Configurações | ✅ | ❌ | ❌ |

## Chaves localStorage
| Chave | Conteudo |
|-------|----------|
| `token` / `authToken` | JWT token |
| `usuario` / `userData` | Dados do usuário |
| `refreshToken` | Refresh token Firebase |

## Refresh Token Automático
- **Intervalo:** 45 minutos
- **Firebase Key:** `VITE_FIREBASE_KEY`