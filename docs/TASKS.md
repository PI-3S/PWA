# Lista de Tarefas - Sistema de Gestão de Certificados (SGC)

**Última atualização:** 2026-04-21

## ✅ Tarefas Concluídas

### Infraestrutura Base
1. [x] Configurar API base URL para https://back-end-banco-five.vercel.app
2. [x] Implementar AuthContext com refresh token automático
3. [x] Configurar ProtectedRoute com validação por perfil
4. [x] Corrigir compatibilidade de chaves localStorage
5. [x] Implementar redirecionamento inteligente pós-login

### Páginas de Login
6. [x] Criar página de login unificada com parâmetro de role
7. [x] Implementar validação de perfil no login
8. [x] Corrigir problema de redirecionamento travado
9. [x] Adicionar funcionalidade "Esqueci minha senha"

### Limpeza de Código
10. [x] Remover componentes órfãos
11. [x] Adicionar try/catch no JSON.parse do ProtectedRoute

### Área Super Admin - COMPLETA ✅
12. [x] Dashboard com métricas (corrigido para Super Admin)
13. [x] CRUD completo de cursos (POST, GET, PATCH, DELETE)
14. [x] CRUD completo de usuários (POST, GET, PATCH, DELETE)
15. [x] Validação de submissões (aprovar/reprovar/correção)
16. [x] CRUD completo de regras (POST, GET, PATCH, DELETE)
17. [x] Vínculos coordenador-curso (POST, GET, DELETE)
18. [x] Configurações do sistema (email, sistema, cores)
19. [x] Gerador de senha segura + modal de confirmação
20. [x] Envio automático de credenciais por email
21. [x] Ordem correta dos hooks (useCallback antes useEffect)
22. [x] Mapeamento robusto de campos da API
23. [x] Enrichment de dados via chamadas paralelas

### Backend - Endpoints Adicionados
24. [x] PATCH /api/cursos/:id
25. [x] DELETE /api/cursos/:id
26. [x] DELETE /api/usuarios/:id
27. [x] PATCH /api/regras/:id
28. [x] DELETE /api/regras/:id
29. [x] DELETE /api/coordenadores-cursos/:id
30. [x] GET /api/configuracoes/:id
31. [x] POST /api/configuracoes/:id
32. [x] POST /api/configuracoes/test-email
33. [x] Dashboard corrigido para Super Admin
34. [x] POST /api/auth/forgot-password

### Scripts e Utilidades
35. [x] Script setup-firestore.js
36. [x] Coleção configuracoes no Firestore

### Área do Coordenador - REVISADA ✅
37. [x] Corrigir import React
38. [x] Aplicar ordem correta dos hooks
39. [x] Mapeamento robusto de campos
40. [x] Enrichment de submissões com dados paralelos
41. [x] Calcular progresso dos alunos corretamente
42. [x] Layout ocupando tela inteira

### Área do Aluno - REVISADA ✅
43. [x] Corrigir import React
44. [x] Layout ocupando tela inteira
45. [x] Área de upload redesenhada (drag-and-drop)
46. [x] Aviso de limite 4MB para arquivos
47. [x] Feedback visual no upload

---

## 📊 Status Real do Progresso

| Área | Status | Observações |
|------|--------|-------------|
| Autenticação | ✅ 100% | Funcionando perfeitamente |
| Login Pages | ✅ 100% | Todas as roles + recuperação senha |
| Admin - Dashboard | ✅ 100% | Corrigido para Super Admin |
| Admin - Cursos | ✅ 100% | CRUD completo |
| Admin - Usuários | ✅ 100% | CRUD + email automático |
| Admin - Validação | ✅ 100% | Aprova/reprova/correção |
| Admin - Regras | ✅ 100% | CRUD completo |
| Admin - Vínculos | ✅ 100% | CRUD completo |
| Admin - Configurações | ✅ 100% | Email e sistema |
| Backend - Endpoints | ✅ 100% | Todos CRUD completos |
| Coordenador | ✅ 100% | Revisado e funcionando |
| Aluno | ✅ 100% | Revisado e funcionando |

**Progresso Real:** 100% ✅

---

## 🎯 Próximas Ações (Melhorias Futuras)

### Prioridade BAIXA
1. [ ] Unificar apiClient em todos os componentes
2. [ ] Adicionar testes automatizados
3. [ ] Melhorar UX/UI geral
4. [ ] Adicionar filtros avançados
5. [ ] Implementar modo offline (PWA)
6. [ ] Notificações em tempo real
7. [ ] Exportação de relatórios

---

## 📝 Notas para o Desenvolvedor

- **Ordem dos hooks:** `useCallback` sempre ANTES do `useEffect`
- **Mapeamento de campos:** Usar múltiplos fallbacks (`campo1 || campo2 || campo3 || '—'`)
- **CRUD completo:** Todo recurso precisa de POST, GET, PATCH, DELETE
- **Configurações:** Usar Firestore, não .env para produção
- **Proteção ao excluir:** Verificar vínculos antes de DELETE
- **Enrichment de dados:** Usar Promise.all + Maps para lookup eficiente
- **Layout:** Usar `min-h-screen w-full flex` para ocupar tela inteira

---
**Última verificação:** 2026-04-21
**Responsável:** Dev Full-Stack