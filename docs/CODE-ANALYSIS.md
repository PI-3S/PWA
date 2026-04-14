# Analise de Codigo - SGC

**Data:** 2026-04-14

## Visao Geral

O projeto e uma aplicacao React + TypeScript para gestao de atividades complementares do SENAC. Possui 3 perfis de usuario (aluno, coordenador, super_admin) com paineis separados e autenticacao via Firebase Auth.

---

## 1. Componentes Orfaos e Imports Quebrados

### 1.1 Componentes sem uso e com imports inexistentes

Os seguintes componentes em `src/components/` importam exports que **nao existem** mais em `src/data/data.ts`:

| Componente | Import Inexistente |
|------------|-------------------|
| `FilterBar.tsx:4` | `ActivityCategory`, `categoryLabels` |
| `SubmissionQueue.tsx:3` | `Submission` (campos diferentes), `categoryLabels`, `statusLabels` (valores diferentes) |
| `EvaluationDialog.tsx:8` | `Submission` (campos diferentes), `categoryLabels`, `ActivityCategory` |

O `data.ts` foi simplificado e removeu:
- `ActivityCategory` (type)
- `categoryLabels` (Record com labels de categorias como "Cursos", "Palestras", etc.)
- A interface `Submission` expandida com `studentName`, `course`, `hoursRequested`, `hoursInDocument`, `studentAccumulatedHours`, `categoryLimits`

Esses 3 componentes **nao compilariam** se importados.

### 1.2 Pagina Professor.tsx

`src/pages/Professor.tsx` contem dados mock hardcodados e **nao esta conectada nas rotas** do `App.tsx`. Foi removida.

### 1.3 apiClient nao utilizado

`src/services/api.ts` exporta `apiClient` com metodos get/post/patch/delete bem estruturados, mas **nenhum componente o utiliza**. Todos fazem `fetch` direto inline.

### 1.4 NavLink.tsx nao utilizado

`src/components/NavLink.tsx` e um wrapper do `NavLink` do React Router mas nao e importado em nenhum lugar.

---

## 2. Inconsistencias de Autenticacao

### 2.1 Multiplas chaves localStorage

O sistema salva os mesmos dados em chaves duplicadas:

| Dado | Chave Primaria | Chave Secundaria |
|------|---------------|-----------------|
| Token | `token` | `authToken` |
| Usuario | `usuario` | `userData` |
| Refresh Token | `refreshToken` | - |
| Expiracao | `tokenExpiry` | - |
| Email (nao usado) | - | `userEmail` |

Isso foi feito como workaround de compatibilidade, mas gera confusao.

### 2.2 signOut usa page reload

`AuthContext.tsx:146`: `window.location.href = '/login'` recarrega a pagina inteira desnecessariamente.

### 2.3 ProtectedRoute sem try/catch

`ProtectedRoute.tsx:25-27`: faz `JSON.parse` em dados do localStorage sem try/catch. Se o JSON estiver corrompido, a aplicacao quebra.

### 2.4 Admin tem auth propria e conflitante

`Admin.tsx` verifica autenticacao internamente (`checkAuth` no useEffect), o que e redundante com o `ProtectedRoute`. Alem disso:
- Aceita perfis `super_admin` **e** `admin` (linha 156)
- Mas `ProtectedRoute` so permite `super_admin`
- E `UserPerfil` em `data.ts` so define `super_admin`

### 2.5 Login.tsx le do localStorage para validar perfil

`Login.tsx:82-84`: apos o `signIn`, le `localStorage.getItem('usuario')` para validar o perfil. Isso depende de o `signIn` ja ter gravado o dado, criando um acoplamento implicito e fragil.

---

## 3. Duplicacao de Logica de API

Existem 3 formas diferentes de fazer chamadas HTTP no projeto:

| Local | Metodo | Consistencia |
|-------|--------|-------------|
| `services/api.ts` | `apiClient.get/post/patch/delete` | Generico, bem tipado - NAO USADO |
| `Aluno.tsx`, `Coordenador.tsx` | `fetch` inline com `authHeaders()` | Funcional, mas repetitivo |
| `Admin.tsx` | `apiFetch` interno + `getToken()` | Funcional, mas diferente dos outros |

Cada um usa sua propria funcao para montar headers, tratar erros e ler tokens.

---

## 4. Campos com Nomes Diferentes

A API retorna campos com nomes diferentes dependendo do endpoint:

| Campo | Variante 1 | Variante 2 |
|-------|-----------|-----------|
| Horas solicitadas | `carga_horaria_solicitada` | `horas_solicitadas` |
| Dashboard | `metricas` | direto no root |

O `Admin.tsx:254-257` faz mapeamento manual:
```ts
horas_solicitadas: s.carga_horaria_solicitada || s.horas_solicitadas
```

---

## 5. Configuracoes Permissivas

### TypeScript (`tsconfig.json`)
- `strictNullChecks: false` - erros de null/undefined silenciosos
- `noImplicitAny: false` - permite `any` implicito
- `noUnusedLocals: false` - codigo morto nao detectado
- `noUnusedParameters: false` - parametros nao usados nao alertam

### ESLint (`eslint.config.js`)
- `@typescript-eslint/no-unused-vars: off` - variaveis nao usadas nao geram warning

---

## 6. Token Refresh Silenciosamente Falho

`AuthContext.tsx:29-38`: se `FIREBASE_KEY` nao estiver definido no `.env`, a URL fica `https://securetoken.googleapis.com/v1/token?key=` e a requisicao falha silenciosamente (catch sem acao efetiva).

---

## 7. Testes Inexistentes

- `src/test/example.test.ts`: apenas `expect(true).toBe(true)`
- `src/test/setup.ts`: so configura `matchMedia` mock
- Nenhuma pagina, componente ou contexto tem teste real

---

## 8. Outros

| Problema | Local | Gravidade |
|----------|-------|-----------| Baixa |
| `README.md` vazio (placeholder TODO) | `/README.md` | Baixa |
| CSS classes `futuristic-bg`, `glass-card`, `scan-line`, `text-glow` usadas mas nao definidas no Tailwind | Varios | Baixa |
| `handleLogout` do Admin nao limpa `sessionStorage.welcomed_admin` (limpa `welcomed` sem o sufixo) | `Admin.tsx:430` | Baixa |
| `Professor.tsx` ainda existia no repositorio | `src/pages/Professor.tsx` | Medio (removido) |
| Variaveis CSS customizadas (`--border`, `--primary`, etc.) referenciadas no Tailwind mas nao confirmadas no CSS | `tailwind.config.ts` | Baixa |
