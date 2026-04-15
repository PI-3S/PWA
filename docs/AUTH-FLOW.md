# Rotas Completas do Backend - SGC

**Data:** 2026-04-14

## Base URL
https://back-end-banco-five.vercel.app

text

## 🔐 Autenticação

### POST /api/auth/login
**Body:**
```json
{
  "email": "admin@admin.com",
  "senha": "admin123"
}
Response:

json
{
  "success": true,
  "token": "eyJhbGci...",
  "refreshToken": "...",
  "usuario": {
    "uid": "xxx",
    "nome": "Admin",
    "email": "admin@admin.com",
    "perfil": "super_admin",
    "curso_id": null
  }
}
👥 Usuários
Método	Rota	Perfil
GET	/api/usuarios	super_admin, coordenador
POST	/api/usuarios	super_admin, coordenador
PATCH	/api/usuarios/:id	super_admin, coordenador
DELETE	/api/usuarios/:id	super_admin, coordenador
POST /api/usuarios
json
{
  "nome": "João Silva",
  "email": "joao@email.com",
  "senha": "123456",
  "perfil": "aluno",
  "matricula": "2024001",
  "curso_id": "abc123"
}
DELETE /api/usuarios/:id
Proteções:

Não exclui último super_admin

Remove vínculos automaticamente

📚 Cursos
Método	Rota	Perfil
GET	/api/cursos	Todos
POST	/api/cursos	super_admin
PATCH	/api/cursos/:id	super_admin
DELETE	/api/cursos/:id	super_admin
PATCH /api/cursos/:id
json
{
  "nome": "Novo Nome",
  "carga_horaria_minima": 250
}
DELETE /api/cursos/:id
Proteção: Não exclui se houver alunos ou coordenadores vinculados

📏 Regras de Atividades
Método	Rota	Perfil
GET	/api/regras	Todos
POST	/api/regras	super_admin
PATCH	/api/regras/:id	super_admin
DELETE	/api/regras/:id	super_admin
POST /api/regras
json
{
  "area": "Extensão",
  "limite_horas": 60,
  "exige_comprovante": true,
  "curso_id": "abc123"
}
DELETE /api/regras/:id
Proteção: Não exclui se houver submissões vinculadas

📤 Submissões
Método	Rota	Perfil
GET	/api/submissoes	Todos
POST	/api/submissoes	aluno
PATCH	/api/submissoes/:id	super_admin, coordenador
POST /api/submissoes
json
{
  "regra_id": "regra123",
  "tipo": "Curso Online",
  "descricao": "Curso de React",
  "carga_horaria_solicitada": 40
}
PATCH /api/submissoes/:id
json
{
  "status": "aprovado"  // ou "reprovado"
}
📜 Certificados
Método	Rota	Perfil
GET	/api/certificados	Todos
POST	/api/certificados	aluno
POST /api/certificados
Content-Type: multipart/form-data

text
submissao_id: "sub123"
arquivo: [FILE]
🔗 Vínculos Coordenador-Curso
Método	Rota	Perfil
GET	/api/coordenadores-cursos	super_admin
POST	/api/coordenadores-cursos	super_admin
DELETE	/api/coordenadores-cursos/:id	super_admin
🎓 Vínculos Aluno-Curso
Método	Rota	Perfil
GET	/api/alunos-cursos	Todos
POST	/api/alunos-cursos	super_admin, coordenador
DELETE	/api/alunos-cursos/:id	super_admin, coordenador
📊 Dashboard
GET /api/dashboard/coordenador
Perfil: super_admin, coordenador
Response:

json
{
  "success": true,
  "metricas": {
    "total_submissoes": 25,
    "pendentes": 10,
    "aprovadas": 12,
    "reprovadas": 3,
    "por_area": [...],
    "por_curso": [...]
  }
}
GET /api/dashboard/aluno
Perfil: aluno
Response:

json
{
  "success": true,
  "metricas": {
    "total_submissoes": 5,
    "pendentes": 2,
    "aprovadas": 2,
    "reprovadas": 1,
    "total_horas_aprovadas": 80,
    "carga_horaria_minima": 200,
    "progresso_percentual": 40
  }
}
⚙️ Configurações (🆕)
Método	Rota	Perfil
GET	/api/configuracoes/:id	super_admin
POST	/api/configuracoes/:id	super_admin
POST	/api/configuracoes/test-email	super_admin
GET /api/configuracoes/email_config
Response:

json
{
  "success": true,
  "config": {
    "host": "smtp.gmail.com",
    "port": 587,
    "user": "email@gmail.com",
    "pass": "****",
    "from": "SGC <email@gmail.com>",
    "ativo": true
  }
}
POST /api/configuracoes/email_config
Body: (mesmo formato acima)

POST /api/configuracoes/test-email
json
{
  "to": "teste@email.com"
}
📋 Coleções do Firestore
Coleção	Descrição
usuarios	Usuários do sistema
cursos	Cursos cadastrados
regras_atividade	Regras por curso
submissoes	Submissões dos alunos
atividades_complementares	Dados das atividades
certificados	URLs e OCR
coordenadores_cursos	Vínculos coord-curso
alunos_cursos	Vínculos aluno-curso
configuracoes	🆕 Configurações do sistema
logs	Registro de ações