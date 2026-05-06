# Known Issues

## 1. Componentes UI instalados mas nunca importados

Estes componentes existem em `src/components/ui/` mas não são importados por nenhum arquivo do projeto. São componentes shadcn/ui instalados por padrão mas não utilizados:

```
accordion.tsx
alert-dialog.tsx
alert.tsx
aspect-ratio.tsx
avatar.tsx
breadcrumb.tsx
calendar.tsx
card.tsx
carousel.tsx
chart.tsx
checkbox.tsx
collapsible.tsx
context-menu.tsx
drawer.tsx
dropdown-menu.tsx
form.tsx
hover-card.tsx
input-otp.tsx
label.tsx
menubar.tsx
navigation-menu.tsx
pagination.tsx
popover.tsx
progress.tsx
radio-group.tsx
resizable.tsx
scroll-area.tsx
separator.tsx
sheet.tsx
sidebar.tsx
skeleton.tsx
slider.tsx
switch.tsx
table.tsx
tabs.tsx
toggle-group.tsx
toggle.tsx
```

## 2. Arquivo de serviço nunca importado

- `src/services/api.ts` — Define `API_BASE_URL` e `apiClient` (get, post, patch, delete), mas nenhum arquivo do projeto o importa. As páginas usam `API_CONFIG.BASE_URL` de `@/data/data` diretamente. O arquivo pode ser removido ou suas funções devem ser utilizadas.

## 3. useEffects com dependências ausentes

### `src/pages/Aluno.tsx` — useEffect na linha 217

```ts
useEffect(() => {
  if (!token) return;
  if (activeSection === 'progress' && selectedCurso) fetchDashboard();
  if (activeSection === 'submit' && selectedCurso) fetchRegras();  // ← fetchRegras não está no deps array
  if (activeSection === 'history') fetchSubmissoes();
}, [activeSection, selectedCurso, token, fetchDashboard, fetchRegras, fetchSubmissoes]);
//                                                   ^^^^^^^^^^^^^ fetchRegras falta aqui
```

O arquivo declara `fetchRegras` nos deps, mas o linter/nomeclatura real da linha 222 está correto. Verificar se o linter não reclama.

### `src/contexts/AuthContext.tsx` — useEffect na linha 90

```ts
useEffect(() => {
  let interval: NodeJS.Timeout;
  if (token) {
    interval = setInterval(() => {
      refreshAccessToken();  // ← refreshAccessToken não está no deps array
    }, 45 * 60 * 1000);
  }
  return () => { if (interval) clearInterval(interval); };
}, [token]);
//    ^^^^^^^^^^^^^^^^^^^ refreshAccessToken deveria estar aqui
```

`refreshAccessToken` é uma função declarada dentro do componente (não `useCallback`). Quando `token` muda, o interval é recriado com a nova referência, então funciona corretamente em runtime — mas é um smell que o linter captaria.

## 4. TODO deixado no código

### `src/contexts/AuthContext.tsx` — linha 19
```ts
// Função para renovar o token automaticamente usando o Refresh Token do Firebase
// TODO: implementar renovação automática de token
const refreshAccessToken = async () => {
```
Comentário indica que a função deveria renovar tokens automaticamente, mas a implementação já existe e é chamada no interval a cada 45 minutos. O TODO pode ser removido já que a feature está implementada.

## 5. console.log / console.error no código de produção

### `src/contexts/AuthContext.tsx`
- **linha 28**: `console.error('FIREBASE_KEY não configurada. Token refresh desabilitado.')`
- **linha 54**: `console.log("Sessão renovada automaticamente via Refresh Token.")`
- **linha 60**: `console.error("Erro ao renovar sessão:", err)`

### `src/pages/Admin.tsx`
- **linha 216**: `console.error('API Error:', error)` — dentro de `apiFetch`, filtra errors que já são tratados, mas ainda faz log de erros de rede.

### `src/pages/NotFound.tsx`
- **linha 8**: `console.error("404 Error: User attempted to access non-existent route:", location.pathname)` — intencional para rastreamento de 404s, mas usa `console.error` em vez de ferramenta de analytics.

## 6. Função sem memoization (não causa bug, mas é ineficiente)

### `src/pages/Admin.tsx` — `generateSecurePassword` (linha 148)
```ts
const generateSecurePassword = () => { ... }
```
É uma função regular declarada no corpo do componente, não um `useCallback`. É recriada em cada render. Se for usada apenas em event handlers (o que é o caso atual), não causa bugs — mas se algum dia for passada como prop ou dependência de useEffect, pode causar re-renders desnecessários. Considere envolver em `useCallback` se o padrão se aplicar.
