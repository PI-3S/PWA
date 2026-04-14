# Lista de Tarefas - Sistema de Gestão de Certificados (SGC)

**Última atualização:** 14/04/2026

## ✅ Tarefas Concluídas

### Infraestrutura Base
1. [x] Configurar API base URL para https://back-end-banco-five.vercel.app
2. [x] Implementar AuthContext com refresh token automático
3. [x] Configurar ProtectedRoute com validação por perfil
4. [x] Corrigir compatibilidade de chaves localStorage (`token`/`authToken`, `usuario`/`userData`)
5. [x] Implementar redirecionamento inteligente pós-login

### Páginas de Login
6. [x] Criar página de login unificada com parâmetro de role
7. [x] Implementar validação de perfil no login
8. [x] Corrigir problema de redirecionamento travado (delay 100ms)

### Limpeza de Código
9. [x] Remover componentes órfãos (FilterBar, SubmissionQueue, EvaluationDialog, NavLink, StatusCards, Professor.tsx)
10. [x] Adicionar try/catch no JSON.parse do ProtectedRoute
11. [x] Centralizar signOut sem page reload

## 🔧 Em Reparo - Área Super Admin

### Dashboard
12. [x] Estrutura base do dashboard
13. [ ] Corrigir carregamento de métricas (problemas de CORS/token)
14. [ ] Ajustar gráficos de distribuição por curso/área
15. [ ] Corrigir atualização em tempo real após aprovação

### Gestão de Cursos
16. [x] Interface de listagem de cursos
17. [x] Criar/Editar cursos (POST/PUT)
18. [x] Excluir cursos (DELETE) - ADICIONADO
19. [ ] Adicionar validação de duplicidade

### Gestão de Usuários
20. [x] Listagem com filtros por perfil
21. [x] Criação de novos usuários
22. [x] Edição de usuário (PATCH) - ADICIONADO
23. [x] Exclusão de usuário (DELETE) - ADICIONADO
24. [ ] Adicionar busca por matrícula

### Validação de Submissões
25. [x] Listagem de submissões pendentes
26. [x] Aprovação/reprovação básica
27. [ ] Corrigir preview de certificados (problemas CORS/iframe)
28. [ ] Adicionar OCR extraído no modal de validação
29. [ ] Implementar filtros por data/período

### Regras de Atividades
30. [x] Interface de criação de regras
31. [x] Edição de regras existentes (PATCH) - ADICIONADO
32. [x] Exclusão de regras (DELETE) - ADICIONADO

### Vínculos Coordenador-Curso
33. [x] Interface de vinculação
34. [x] Criação de vínculos
35. [ ] Corrigir DELETE de vínculo (endpoint errado)
36. [ ] Adicionar visualização de coordenadores por curso

## 🔄 Em Reparo - Área do Coordenador

37. [x] Corrigir carregamento do dashboard do coordenador
38. [ ] Ajustar listagem de submissões (filtrar por curso)
39. [ ] Corrigir aprovação/reprovação de submissões
40. [ ] Implementar visualização de certificados
41. [ ] Corrigir gestão de alunos do curso

## 🔄 Em Reparo - Área do Aluno

42. [x] Corrigir dashboard do aluno (unwrap `metricas`)
43. [x] Corrigir fluxo de nova submissão (auto-set `tipo` da regra)
44. [ ] Corrigir upload de certificados
45. [ ] Ajustar acompanhamento de status
46. [ ] Corrigir histórico de submissões

## 🐛 Bugs Identificados

### Autenticação
- [x] Token não fornecido no Admin (RESOLVIDO)
- [x] Redirecionamento travado pós-login (RESOLVIDO)
- [x] Incompatibilidade de chaves localStorage (RESOLVIDO)
- [ ] Token expirando durante uso do sistema

### Admin
- [ ] CORS ao carregar preview de certificados
- [ ] Métricas não atualizam após aprovação

### API/Backend
- [ ] Endpoints de PUT/DELETE não documentados
- [ ] Respostas inconsistentes (metricas vs metrics)
- [ ] Campos com nomes diferentes (carga_horaria_solicitada vs horas_solicitadas)

## 📊 Status Real do Progresso

| Área | Status | Observações |
|------|--------|-------------|
| Autenticação | ✅ 100% | Funcionando perfeitamente |
| Login Pages | ✅ 100% | Todas as roles funcionando |
| Admin - Dashboard | 🟡 70% | Base OK, métricas com bugs |
| Admin - Cursos | 🟢 80% | CRUD completo (create/read/update/delete) |
| Admin - Usuários | 🟢 80% | CRUD completo (create/read/update/delete) |
| Admin - Validação | 🟡 65% | Aprova/reprova OK, preview bugado |
| Admin - Regras | 🟢 80% | CRUD completo (create/read/update/delete) |
| Admin - Vínculos | 🟡 50% | Cria OK, delete com erro |
| Coordenador | 🟡 30% | Estrutura OK, funcionalidades em revisão |
| Aluno | 🟡 25% | Fluxo de submissão corrigido, resto em revisão |

**Progresso Real:** ~55%

## ⚠️ Problemas Críticos Pendentes

1. **CORS no preview de certificados** - Iframe não carrega em produção
2. **Endpoints não documentados** - PUT/DELETE retornam 404
3. **Inconsistência de dados** - API retorna estruturas diferentes do documentado
4. **Atualização de estado** - Métricas não refletem mudanças em tempo real

## 🎯 Próximas Ações (Ordem de Prioridade)

### Prioridade ALTA
1. [ ] Corrigir preview de certificados (CORS)
2. [ ] Corrigir DELETE de vínculos coordenador-curso
3. [ ] Corrigir atualização de métricas pós-aprovação

### Prioridade MÉDIA
4. [ ] Ajustar área do coordenador (listagem e aprovação)
5. [ ] Corrigir upload de certificados do aluno
6. [ ] Melhorar histórico de submissões do aluno

### Prioridade BAIXA
7. [ ] Adicionar filtros avançados
8. [ ] Melhorar UX/UI
9. [ ] Adicionar testes

## 📝 Notas para o Desenvolvedor

- **NÃO ASSUMIR** que features estão 100% funcionais
- Sempre testar com a API real antes de marcar como concluído
- Verificar CORS e endpoints não documentados
- Manter compatibilidade com ambas as nomenclaturas de localStorage
- Documentar workarounds implementados

---
**Última verificação:** 14/04/2026
**Responsável:** [Seu Nome]
