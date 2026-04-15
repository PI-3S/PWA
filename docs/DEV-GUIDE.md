## 📁 5. `DEV-GUIDE.md` (ATUALIZADO)

```markdown
# Guia de Desenvolvimento - SGC

**Data:** 2026-04-14 (ATUALIZADO)

## Como Rodar o Projeto

```bash
bun install          # Instalar dependencias
bun dev              # http://localhost:8080
bun build            # Build producao
bun lint             # Verificar lint
🆕 Padrões de Código (ATUALIZADO)
Ordem dos Hooks (IMPORTANTE!)
typescript
// ✅ CORRETO - useCallback ANTES do useEffect
const loadData = useCallback(async () => { ... }, [apiFetch]);

useEffect(() => {
  loadData(); // Funciona!
}, [loadData]);

// ❌ ERRADO - Causa "Cannot access before initialization"
useEffect(() => {
  loadData(); // Erro!
}, [loadData]);
const loadData = useCallback(async () => { ... }, [apiFetch]);
Mapeamento Robusto de Campos da API
typescript
// ✅ SEMPRE use múltiplos fallbacks
const mapped = data.map(item => ({
  aluno_nome: item.aluno_nome || item.nome_aluno || item.aluno?.nome || '—',
  curso_nome: item.curso_nome || item.nome_curso || item.curso?.nome || '—',
  horas: item.horas_solicitadas || item.carga_horaria_solicitada || 0,
}));
CRUD Completo
Todo recurso deve ter:

POST /api/recurso - Criar

GET /api/recurso - Listar

PATCH /api/recurso/:id - Atualizar

DELETE /api/recurso/:id - Excluir (com verificação de vínculos)

Proteção ao Excluir
javascript
// ✅ SEMPRE verificar vínculos antes do DELETE
const vinculos = await db.collection('tabela_filha')
  .where('campo_pai_id', '==', id)
  .limit(1)
  .get();

if (!vinculos.empty) {
  return res.status(400).json({ error: 'Existem registros vinculados' });
}
Configurações Dinâmicas
javascript
// ✅ Usar Firestore para configurações editáveis
const config = await db.collection('configuracoes').doc('email_config').get();

// ❌ NÃO usar .env para coisas que mudam em produção
const emailUser = process.env.EMAIL_USER; // Ruim para produção
Gerador de Senha Segura
typescript
const generateSecurePassword = () => {
  const length = 12;
  const charset = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%&*'
  };
  // Garante pelo menos um de cada tipo
  // ... retorna senha forte
};
🆕 Credenciais de Teste
Perfil	Email	Senha
Super Admin	admin@admin.com	admin123
Coordenador	coordenador@email.com	123456
Aluno	joao@email.com	123456
🆕 Scripts Úteis
scripts/setup-firestore.js
Cria coleções de configuração no Firestore.

scripts/seed-dashboard.js
Gera dados de teste para o dashboard.

Checklist Antes de Commit (ATUALIZADO)
bun lint passa

Login funciona nos 3 perfis

CRUD completo (POST, GET, PATCH, DELETE)

Ordem dos hooks está correta

Mapeamento de campos usa fallbacks

Dashboard mostra dados para Super Admin

Configurações vêm do Firestore

Exclusões verificam vínculos