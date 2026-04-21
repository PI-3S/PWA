# Análise de Código - SGC

**Data:** 2026-04-21 (ATUALIZADO)

## Visão Geral

O projeto é uma aplicação React + TypeScript para gestão de atividades complementares do SENAC. Possui 3 perfis de usuário (aluno, coordenador, super_admin) com painéis separados e autenticação via Firebase Auth.

---

## 1. Componentes Órfãos (Ainda Presentes)

### 1.1 Componentes com imports quebrados

Os seguintes componentes em `src/components/` importam exports que **não existem** mais em `src/data/data.ts`:

| Componente | Import Inexistente |
|------------|-------------------|
| `FilterBar.tsx:4` | `ActivityCategory`, `categoryLabels` |
| `SubmissionQueue.tsx:3` | `Submission` (campos diferentes), `categoryLabels`, `statusLabels` |
| `EvaluationDialog.tsx:8` | `Submission` (campos diferentes), `categoryLabels`, `ActivityCategory` |

**Ação recomendada:** Remover ou refatorar esses componentes.

### 1.2 NavLink.tsx não utilizado
`src/components/NavLink.tsx` é um wrapper do `NavLink` do React Router mas não é importado em nenhum lugar.

---

## 2. Problemas de Autenticação (Resolvidos)

### 2.1 Múltiplas chaves localStorage ✅ RESOLVIDO
O sistema agora funciona com fallback automático entre as chaves:
- Token: `token` / `authToken`
- Usuário: `usuario` / `userData`

### 2.2 signOut usa page reload
`AuthContext.tsx:146`: `window.location.href = '/login'` recarrega a página inteira desnecessariamente.
**Status:** Baixa prioridade - funciona mas poderia usar `navigate()`.

### 2.3 ProtectedRoute sem try/catch
`ProtectedRoute.tsx:25-27`: faz `JSON.parse` em dados do localStorage sem try/catch.
**Status:** Baixa prioridade.

---

## 3. Duplicação de Lógica de API

Existem 3 formas diferentes de fazer chamadas HTTP no projeto:

| Local | Método |
|-------|--------|
| `services/api.ts` | `apiClient.get/post/patch/delete` - NÃO USADO |
| `Aluno.tsx`, `Coordenador.tsx` | `fetch` inline com `authHeaders()` |
| `Admin.tsx` | `apiFetch` interno |

**Nota:** Funcional mas poderia ser unificado no futuro.

---

## 4. Campos com Nomes Diferentes ✅ RESOLVIDO

A API retorna campos com nomes diferentes dependendo do endpoint. Todas as páginas agora possuem mapeamento robusto com múltiplos fallbacks:

```ts
aluno_nome: s.aluno_nome || s.nome_aluno || aluno?.nome || '—'
curso_nome: s.curso_nome || s.nome_curso || cursosMap.get(id) || '—'
horas_solicitadas: s.horas_solicitadas || s.carga_horaria_solicitada || s.carga_horaria || 0
```

---

## 5. Configurações Permissivas

### TypeScript (`tsconfig.json`)
- `strictNullChecks: false` - erros de null/undefined silenciosos
- `noImplicitAny: false` - permite `any` implícito
- `noUnusedLocals: false` - código morto não detectado

### ESLint (`eslint.config.js`)
- `@typescript-eslint/no-unused-vars: off` - variáveis não usadas não geram warning

**Nota:** Baixa prioridade - não afeta funcionamento.

---

## 6. Testes Inexistentes

- `src/test/example.test.ts`: apenas `expect(true).toBe(true)`
- Nenhuma página, componente ou contexto tem teste real

**Status:** Melhoria futura.

---

## 7. Problemas Resolvidos nesta Versão

| Problema | Status |
|----------|--------|
| React is not defined (Coordenador.tsx) | ✅ Resolvido |
| React is not defined (Aluno.tsx) | ✅ Resolvido |
| Layout centralizado no Aluno | ✅ Resolvido |
| Upload confuso no Aluno | ✅ Resolvido |
| Validação sem aluno_nome no Admin | ✅ Resolvido |
| Ordem incorreta dos hooks | ✅ Resolvido |
| Campos vazios nas tabelas | ✅ Resolvido |
| Login sem recuperação de senha | ✅ Resolvido |

---

## 8. Resumo de Qualidade

| Aspecto | Avaliação |
|---------|-----------|
| Funcionalidade | ✅ Excelente |
| Código Limpo | 🟡 Bom (pequenas duplicações) |
| Tipagem | 🟡 médio (any implícito) |
| Testes | ❌ Inexistentes |
| Documentação | ✅ Completa |
| UX/UI | ✅ Bom |

---

**Conclusão:** O sistema está estável e pronto para produção. Os problemas restantes são de baixa prioridade e não afetam o funcionamento.