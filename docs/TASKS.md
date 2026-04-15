# Lista de Tarefas - Sistema de Gestão de Certificados (SGC)

**Última atualização:** 14/04/2026

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

### Limpeza de Código
9. [x] Remover componentes órfãos
10. [x] Adicionar try/catch no JSON.parse do ProtectedRoute

### Área Super Admin - COMPLETA ✅
11. [x] Dashboard com métricas (corrigido para Super Admin)
12. [x] CRUD completo de cursos (POST, GET, PATCH, DELETE)
13. [x] CRUD completo de usuários (POST, GET, PATCH, DELETE)
14. [x] Validação de submissões (aprovar/reprovar)
15. [x] CRUD completo de regras (POST, GET, PATCH, DELETE)
16. [x] Vínculos coordenador-curso (POST, GET, DELETE)
17. [x] Configurações do sistema (email, sistema, cores)
18. [x] Gerador de senha segura + modal de confirmação
19. [x] Envio automático de credenciais por email
20. [x] Ordem correta dos hooks (useCallback antes useEffect)
21. [x] Mapeamento robusto de campos da API

### Backend - Endpoints Adicionados
22. [x] PATCH /api/cursos/:id
23. [x] DELETE /api/cursos/:id
24. [x] DELETE /api/usuarios/:id
25. [x] PATCH /api/regras/:id
26. [x] DELETE /api/regras/:id
27. [x] DELETE /api/coordenadores-cursos/:id
28. [x] GET /api/configuracoes/:id
29. [x] POST /api/configuracoes/:id
30. [x] POST /api/configuracoes/test-email
31. [x] Dashboard corrigido para Super Admin

### Scripts e Utilidades
32. [x] Script setup-firestore.js
33. [x] Coleção configuracoes no Firestore

---

## 🔄 EM ANDAMENTO

### Área do Coordenador (PRÓXIMO)
34. [ ] Revisar Coordenador.tsx - aplicar correções do Admin
35. [ ] Testar dashboard do coordenador
36. [ ] Testar aprovação/reprovação de submissões
37. [ ] Testar cadastro de alunos

### Área do Aluno
38. [ ] Revisar Aluno.tsx - aplicar correções do Admin
39. [ ] Testar dashboard do aluno
40. [ ] Testar envio de submissões
41. [ ] Testar upload de certificados

---

## 📊 Status Real do Progresso

| Área | Status | Observações |
|------|--------|-------------|
| Autenticação | ✅ 100% | Funcionando perfeitamente |
| Login Pages | ✅ 100% | Todas as roles funcionando |
| Admin - Dashboard | ✅ 100% | Corrigido para Super Admin |
| Admin - Cursos | ✅ 100% | CRUD completo |
| Admin - Usuários | ✅ 100% | CRUD + email automático |
| Admin - Validação | ✅ 100% | Aprova/reprova OK |
| Admin - Regras | ✅ 100% | CRUD completo |
| Admin - Vínculos | ✅ 100% | CRUD completo |
| Admin - Configurações | ✅ 100% | Email e sistema |
| Backend - Endpoints | ✅ 100% | Todos CRUD completos |
| Coordenador | 🟡 30% | Precisa revisão |
| Aluno | 🟡 30% | Precisa revisão |

**Progresso Real:** ~75%

---

## 🎯 Próximas Ações

### Prioridade ALTA
1. [ ] Revisar Coordenador.tsx
2. [ ] Revisar Aluno.tsx

### Prioridade MÉDIA
3. [ ] Testar fluxo completo Aluno → Coordenador → Admin
4. [ ] Adicionar filtros avançados

### Prioridade BAIXA
5. [ ] Melhorar UX/UI
6. [ ] Adicionar testes automatizados

---

## 📝 Notas para o Desenvolvedor

- **Ordem dos hooks:** `useCallback` sempre ANTES do `useEffect`
- **Mapeamento de campos:** Usar múltiplos fallbacks (`campo1 || campo2 || campo3 || '—'`)
- **CRUD completo:** Todo recurso precisa de POST, GET, PATCH, DELETE
- **Configurações:** Usar Firestore, não .env para produção
- **Proteção ao excluir:** Verificar vínculos antes de DELETE

---
**Última verificação:** 14/04/2026
**Responsável:** Dev Full-Stack