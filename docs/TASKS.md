# Lista de Tarefas - Sistema de Gestão de Certificados (SGC)

**Última atualização:** 2026-05-07

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

### OCR e Extração de Dados - NOVO ✅
48. [x] Implementar extração de dados estruturados via OCR
49. [x] Criar função `extrairCamposEstruturados()` no backend
50. [x] Adicionar endpoint DELETE para certificados
51. [x] Retornar `dados_ocr` junto com `texto_extraido`
52. [x] Criar componente OcrPreview reutilizável
53. [x] Adicionar preview OCR antes de submissão (aluno)
54. [x] Adicionar visualização OCR completa (coordenador)
55. [x] Adicionar visualização OCR completa (admin)
56. [x] Implementar indicador de confiança da extração
57. [x] Permitir correção manual de dados extraídos
58. [x] Adicionar toggle para ver texto completo extraído
59. [x] Adicionar alerta quando confiança é baixa

### Correções de UI e Bugs - NOVO ✅
60. [x] Corrigir tela azul no OCR preview (panelBg → cardBg)
61. [x] Adicionar accentGreen em todos os componentes necessários
62. [x] Simplificar dashboard do coordenador (remover ações diretas)
63. [x] Adicionar link "Ver todas" no dashboard
64. [x] Adicionar botão "Avaliar" que navega para submissões
65. [x] Corrigir categoriaBadge com fallbacks e null checks
66. [x] Adicionar normalização de dados em RegrasSection
67. [x] Adicionar cursosAcessiveis para controle de permissões

---

## 📊 Status Real do Progresso

| Área | Status | Observações |
|------|--------|-------------|
| Autenticação | ✅ 100% | Funcionando perfeitamente |
| Login Pages | ✅ 100% | Todas as roles + recuperação senha |
| Admin - Dashboard | ✅ 100% | Corrigido para Super Admin |
| Admin - Cursos | ✅ 100% | CRUD completo |
| Admin - Usuários | ✅ 100% | CRUD + email automático |
| Admin - Validação | ✅ 100% | Aprova/reprova/correção + OCR |
| Admin - Regras | ✅ 100% | CRUD completo |
| Admin - Vínculos | ✅ 100% | CRUD completo |
| Admin - Configurações | ✅ 100% | Email e sistema |
| Backend - Endpoints | ✅ 100% | Todos CRUD completos |
| Backend - OCR | ✅ 100% | Extração estruturada de dados |
| Coordenador | ✅ 100% | Revisado + OCR + Dashboard simplificado |
| Aluno | ✅ 100% | Revisado + OCR preview |

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
- **OCR Integration:** Regex patterns para extração estruturada de dados
- **Componentes Reutilizáveis:** OcrPreview pode ser usado em múltiplos contextos
- **Cores de Tema:** Sempre verificar se a cor existe antes de usar (panelBg vs cardBg)
- **Dashboard Simplificado:** Remover ações diretas, usar links para seções dedicadas

---
**Última verificação:** 2026-05-07
**Responsável:** Dev Full-Stack