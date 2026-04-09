# Lista de Tarefas - Sistema de Gestão de Certificados (SGC)

**Última atualização:** 09/04/2026

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

## 🔧 Em Reparo - Área Super Admin

### Dashboard
9. [x] Estrutura base do dashboard
10. [ ] Corrigir carregamento de métricas (problemas de CORS/token)
11. [ ] Ajustar gráficos de distribuição por curso/área
12. [ ] Corrigir atualização em tempo real após aprovação

### Gestão de Cursos
13. [x] Interface de listagem de cursos
14. [ ] Corrigir PUT/POST de cursos (endpoints não documentados)
15. [ ] Implementar DELETE de curso
16. [ ] Adicionar validação de duplicidade

### Gestão de Usuários
17. [x] Listagem com filtros por perfil
18. [x] Criação de novos usuários
19. [ ] Corrigir PATCH/UPDATE de usuário
20. [ ] Implementar DELETE de usuário
21. [ ] Adicionar busca por matrícula

### Validação de Submissões
22. [x] Listagem de submissões pendentes
23. [x] Aprovação/reprovação básica
24. [ ] Corrigir preview de certificados (problemas CORS/iframe)
25. [ ] Adicionar OCR extraído no modal de validação
26. [ ] Implementar filtros por data/período

### Regras de Atividades
27. [x] Interface de criação de regras
28. [ ] Corrigir POST de regras (validação de duplicidade)
29. [ ] Implementar edição de regras existentes
30. [ ] Adicionar DELETE de regras

### Vínculos Coordenador-Curso
31. [x] Interface de vinculação
32. [x] Criação de vínculos
33. [ ] Corrigir DELETE de vínculo (endpoint errado)
34. [ ] Adicionar visualização de coordenadores por curso

## 🔄 Em Reparo - Área do Coordenador

35. [ ] Corrigir carregamento do dashboard do coordenador
36. [ ] Ajustar listagem de submissões (filtrar por curso)
37. [ ] Corrigir aprovação/reprovação de submissões
38. [ ] Implementar visualização de certificados
39. [ ] Corrigir gestão de alunos do curso

## 🔄 Em Reparo - Área do Aluno

40. [ ] Corrigir dashboard do aluno (progresso/horas)
41. [ ] Implementar fluxo de nova submissão
42. [ ] Corrigir upload de certificados
43. [ ] Ajustar acompanhamento de status
44. [ ] Corrigir histórico de submissões

## 🐛 Bugs Identificados

### Autenticação
- [x] Token não fornecido no Admin (RESOLVIDO)
- [x] Redirecionamento travado pós-login (RESOLVIDO)
- [x] Incompatibilidade de chaves localStorage (RESOLVIDO)
- [ ] Token expirando durante uso do sistema

### Admin
- [ ] CORS ao carregar preview de certificados
- [ ] Erro 404 no PUT/DELETE de cursos
- [ ] Erro 404 no DELETE de vínculos coordenador-curso
- [ ] Métricas não atualizam após aprovação
- [ ] Filtros de status não funcionam em todas as abas

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
| Admin - Cursos | 🟡 50% | Listagem OK, CRUD incompleto |
| Admin - Usuários | 🟡 60% | Listagem/criação OK, edit/delete pendente |
| Admin - Validação | 🟡 65% | Aprova/reprova OK, preview bugado |
| Admin - Regras | 🟡 40% | Só criação, sem edit/delete |
| Admin - Vínculos | 🟡 50% | Cria OK, delete com erro |
| Coordenador | 🔴 10% | Estrutura existe, funcionalidades quebradas |
| Aluno | 🔴 5% | Estrutura existe, nada funcional |

**Progresso Real:** ~35%

## ⚠️ Problemas Críticos Pendentes

1. **CORS no preview de certificados** - Iframe não carrega em produção
2. **Endpoints não documentados** - PUT/DELETE retornam 404
3. **Inconsistência de dados** - API retorna estruturas diferentes do documentado
4. **Atualização de estado** - Métricas não refletem mudanças em tempo real

## 🎯 Próximas Ações (Ordem de Prioridade)

### Prioridade ALTA
1. [ ] Corrigir preview de certificados (CORS)
2. [ ] Implementar PUT/DELETE de cursos (ou adaptar para endpoints existentes)
3. [ ] Corrigir DELETE de vínculos coordenador-curso
4. [ ] Corrigir atualização de métricas pós-aprovação

### Prioridade MÉDIA
5. [ ] Ajustar área do coordenador (listagem e aprovação)
6. [ ] Corrigir dashboard do aluno
7. [ ] Implementar edição de usuários
8. [ ] Adicionar DELETE de regras

### Prioridade BAIXA
9. [ ] Adicionar filtros avançados
10. [ ] Melhorar UX/UI
11. [ ] Documentar componentes
12. [ ] Adicionar testes

## 📝 Notas para o Desenvolvedor

- **NÃO ASSUMIR** que features estão 100% funcionais
- Sempre testar com a API real antes de marcar como concluído
- Verificar CORS e endpoints não documentados
- Manter compatibilidade com ambas as nomenclaturas de localStorage
- Documentar workarounds implementados

---
**Última verificação:** 09/04/2026
**Responsável:** [Seu Nome]