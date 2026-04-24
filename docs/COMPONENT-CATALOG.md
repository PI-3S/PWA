# Catálogo de Componentes - Páginas do Sistema

Este documento cataloga todas as seções, endpoints e funcionalidades das páginas principais do sistema.

---

## 1. Admin.tsx

**Linhas:** 1.737

### Seções/Abas

| ID | Label | Ícone | Descrição |
|----|-------|-------|-----------|
| `dashboard` | Dashboard | LayoutDashboard | Visão geral com métricas do sistema |
| `courses` | Gestão de Cursos | BookOpen | CRUD de cursos |
| `users` | Gestão de Usuários | Users | CRUD de usuários (alunos e coordenadores) |
| `validation` | Validacao | FileCheck | Validação de submissões |
| `rules` | Regras de Atividades | ScrollText | CRUD de regras de atividades |
| `coordinators` | Coordenadores | Link2 | Vínculos entre coordenadores e cursos |
| `settings` | Configurações | Settings | Configurações de email e sistema |

### Endpoints Chamados

#### Dashboard
| Método | URL | Campos Enviados |
|--------|-----|-----------------|
| GET | `/api/dashboard/coordenador` | - |

#### Cursos
| Método | URL | Campos Enviados |
|--------|-----|-----------------|
| GET | `/api/cursos` | - |
| POST | `/api/cursos` | `{ nome, carga_horaria_minima }` |
| PATCH | `/api/cursos/{id}` | `{ nome, carga_horaria_minima }` |
| DELETE | `/api/cursos/{id}` | - |

#### Usuários
| Método | URL | Campos Enviados |
|--------|-----|-----------------|
| GET | `/api/usuarios?perfil={perfil}` | - |
| POST | `/api/usuarios` | `{ nome, email, senha, perfil, matricula, curso_id }` |
| PATCH | `/api/usuarios/{id}` | `{ nome, email, matricula, curso_id, perfil }` |
| PUT | `/api/usuarios/{id}` | `{ nome, email, matricula, curso_id, perfil }` (fallback) |
| DELETE | `/api/usuarios/{id}` | - |
| POST | `/api/usuarios/{id}/reset-senha` | - |

#### Submissões
| Método | URL | Campos Enviados |
|--------|-----|-----------------|
| GET | `/api/submissoes` | - |
| PATCH | `/api/submissoes/{id}` | `{ status }` ou `{ status, observacao }` |

#### Regras
| Método | URL | Campos Enviados |
|--------|-----|-----------------|
| GET | `/api/regras` | - |
| POST | `/api/regras` | `{ area, limite_horas, exige_comprovante, curso_id }` |
| PATCH | `/api/regras/{id}` | `{ area, limite_horas, exige_comprovante, curso_id }` |
| DELETE | `/api/regras/{id}` | - |

#### Coordenadores-Cursos
| Método | URL | Campos Enviados |
|--------|-----|-----------------|
| GET | `/api/coordenadores-cursos` | - |
| POST | `/api/coordenadores-cursos` | `{ usuario_id, curso_id }` |
| DELETE | `/api/coordenadores-cursos/{id}` | - |

#### Certificados
| Método | URL | Campos Enviados |
|--------|-----|-----------------|
| GET | `/api/certificados?submissao_id={id}` | - |

#### Configurações
| Método | URL | Campos Enviados |
|--------|-----|-----------------|
| GET | `/api/configuracoes/email_config` | - |
| POST | `/api/configuracoes/email_config` | `{ host, port, secure, user, pass, from, ativo }` |
| GET | `/api/configuracoes/sistema_config` | - |
| POST | `/api/configuracoes/sistema_config` | `{ nome_sistema, instituicao, logo_url, frontend_url, cor_primaria, cor_secundaria }` |
| POST | `/api/configuracoes/test-email` | `{ to }` |

### Funcionalidades por Seção

#### Dashboard
- Exibe métricas: total de submissões, pendentes, aprovadas, reprovadas
- Gráfico de submissões por curso
- Lista de submissões por área

#### Gestão de Cursos
- Listar todos os cursos
- Criar novo curso (nome + carga horária mínima)
- Editar curso existente
- Excluir curso

#### Gestão de Usuários
- Busca por nome/email
- Filtro por perfil (aluno/coordenador)
- Criar novo usuário com geração de senha forte automática
- Editar usuário existente
- Excluir usuário
- Resetar senha (envia nova senha por email)
- Modal de confirmação com credenciais após criação
- Opção de copiar credenciais para clipboard
- Opção de enviar credenciais por email

#### Validação
- Filtro por status (todos, pendente, aprovado, reprovado, correção)
- Filtro por curso
- Expandir detalhes da submissão
- Visualizar certificado anexado (link externo)
- Visualizar texto extraído via OCR
- Aprovar submissão
- Reprovar submissão
- Solicitar correção (com observação obrigatória)

#### Regras de Atividades
- Listar todas as regras
- Criar nova regra (área, limite de horas, exige comprovante, curso)
- Editar regra existente
- Excluir regra
- Badge indicando se exige comprovante

#### Coordenadores
- Listar vínculos coordenador-curso
- Criar novo vínculo
- Remover vínculo

#### Configurações
- **Email:**
  - Configurar servidor SMTP (host, porta)
  - Configurar credenciais (email remetente, senha de app)
  - Configurar nome do remetente
  - Ativar/desativar envio de emails
  - Testar envio de email
- **Sistema:**
  - Nome do sistema
  - Nome da instituição
  - URL do frontend
  - URL da logo
  - Cor primária (HSL)
  - Cor secundária (HSL)

---

## 2. Coordenador.tsx

**Linhas:** 834

### Seções/Abas

| ID | Label | Ícone | Descrição |
|----|-------|-------|-----------|
| `dashboard` | Dashboard | LayoutDashboard | Visão geral com métricas e fila de prioridade |
| `submissoes` | Submissões | FileText | Lista e validação de submissões |
| `alunos` | Alunos | Users | Lista de alunos com progresso |
| `cadastrar` | Cadastrar | UserPlus | Cadastro de novos alunos |

### Endpoints Chamados

#### Dashboard
| Método | URL | Campos Enviados |
|--------|-----|-----------------|
| GET | `/api/dashboard/coordenador` | - |

#### Submissões
| Método | URL | Campos Enviados |
|--------|-----|-----------------|
| GET | `/api/submissoes` | - |
| GET | `/api/usuarios` | - |
| GET | `/api/regras` | - |
| GET | `/api/cursos` | - |
| GET | `/api/certificados?submissao_id={id}` | - |
| PATCH | `/api/submissoes/{id}` | `{ status, coordenador_id }` ou `{ status, coordenador_id, observacao }` |

#### Alunos
| Método | URL | Campos Enviados |
|--------|-----|-----------------|
| GET | `/api/usuarios?perfil=aluno` | - |
| GET | `/api/cursos` | - |

#### Cadastrar Aluno
| Método | URL | Campos Enviados |
|--------|-----|-----------------|
| POST | `/api/usuarios` | `{ nome, matricula, email, senha, curso_id, perfil: 'aluno' }` |

### Funcionalidades por Seção

#### Dashboard
- Exibe 5 cards de métricas: Total, Pendentes, Aprovadas, Reprovadas, Total Alunos
- Fila de prioridade com as 5 submissões pendentes mais recentes
- Ações rápidas na fila: Aprovar, Correção, Reprovar

#### Submissões
- Filtro por curso
- Filtro por status (todos, pendente, aprovado, reprovado, correção)
- Tabela com: aluno, data, curso, horas, status
- Expandir para ver detalhes:
  - Nome do arquivo do certificado
  - Link para abrir PDF
  - Texto extraído via OCR
  - Descrição da atividade
  - Observação de correção (se aplicável)
- Ações: Aprovar Horas, Correção, Reprovar
- Modal de correção com observação obrigatória

#### Alunos
- Lista de alunos com: nome, matrícula, curso, progresso
- Barra de progresso visual (horas aprovadas / carga mínima)
- Cálculo automático de progresso baseado em submissões aprovadas

#### Cadastrar
- Formulário de cadastro de aluno:
  - Nome completo
  - Matrícula
  - Curso (dropdown)
  - Email institucional
  - Senha temporária
- Validação de campos obrigatórios

---

## 3. Aluno.tsx

**Linhas:** 724

### Seções/Abas

| ID | Label | Ícone | Descrição |
|----|-------|-------|-----------|
| `progress` | Meu Progresso | BarChart3 | Dashboard pessoal com métricas |
| `submit` | Nova Submissão | Send | Envio de atividades e certificados |
| `history` | Histórico | FileText | Lista de submissões anteriores |

### Endpoints Chamados

#### Cursos
| Método | URL | Campos Enviados |
|--------|-----|-----------------|
| GET | `/api/alunos-cursos` | - |

#### Dashboard
| Método | URL | Campos Enviados |
|--------|-----|-----------------|
| GET | `/api/dashboard/aluno?curso_id={id}` | - |
| GET | `/api/dashboard/aluno` | - |

#### Regras
| Método | URL | Campos Enviados |
|--------|-----|-----------------|
| GET | `/api/regras?curso_id={id}` | - |

#### Submissões
| Método | URL | Campos Enviados |
|--------|-----|-----------------|
| GET | `/api/submissoes` | - |
| POST | `/api/submissoes` | `{ regra_id, tipo, descricao, carga_horaria_solicitada }` |

#### Certificados
| Método | URL | Campos Enviados |
|--------|-----|-----------------|
| POST | `/api/certificados` | `FormData: { submissao_id, arquivo }` |

### Funcionalidades por Seção

#### Meu Progresso
- Seletor de curso (se aluno tiver múltiplos cursos)
- Card de progresso principal:
  - Horas aprovadas / carga horária mínima
  - Barra de progresso visual
  - Porcentagem completa
- 4 cards de métricas: Total Envios, Pendentes, Aprovadas, Reprovadas
- Horas por área:
  - Lista de áreas com horas acumuladas
  - Limite de horas por área
  - Barra de progresso por área

#### Nova Submissão
- **Passo 1 - Dados da Atividade:**
  - Seleção de área (baseada nas regras do curso)
  - Campo de horas do certificado
  - Descrição opcional
  - Validação de campos obrigatórios
- **Passo 2 - Enviar Certificado:**
  - Área de drag-and-drop
  - Suporte a clique para selecionar arquivo
  - Formatos aceitos: PDF, JPG, PNG
  - Limite de tamanho: 4 MB
  - Preview do arquivo selecionado (nome e tamanho)
  - Opção de remover e selecionar outro arquivo
  - Botão para voltar ao passo 1
  - Botão para finalizar envio

#### Histórico
- Tabela de submissões com: data, tipo, horas, status
- Badges coloridos por status:
  - Aprovado (verde)
  - Reprovado (vermelho)
  - Pendente (amarelo)
  - Correção (amarelo escuro)
- Linha extra para observação de correção (quando aplicável)
- Exibe observação do coordenador com ícone de alerta

---

## Resumo de Linhas

| Arquivo | Linhas |
|---------|--------|
| Admin.tsx | 1.737 |
| Coordenador.tsx | 834 |
| Aluno.tsx | 724 |
| **Total** | **3.295** |

---

## Notas Importantes

### Autenticação
- Todas as requisições incluem header `Authorization: Bearer {token}`
- Verificação de token no localStorage ao carregar as páginas
- Redirecionamento para login se token não encontrado

### Tratamento de Erros
- Toasts de sucesso/erro com estilo consistente
- Tratamento de erros 401/403 com logout automático
- Mapeamento robusto de campos da API com fallbacks

### Temas
- Suporte a temas claro/escuro via hook `useAppTheme`
- Cores dinâmicas baseadas no tema selecionado
- ThemeSwitcher em todas as páginas

### Responsividade
- Sidebar adaptável para mobile
- Tabelas com scroll horizontal em telas pequenas
- Grids responsivos para cards de métricas