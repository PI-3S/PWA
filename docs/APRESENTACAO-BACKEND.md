# Roteiro de Apresentação — Backend (Node.js + Firebase + Vercel)

> **Como usar este arquivo:** Leia em voz alta durante a apresentação. Cada bloco tem o que falar, o que mostrar na tela e os pontos em jogo.

---

## ABERTURA (30 segundos)

> *"O sistema Maestria SGC é uma aplicação completa de gestão de atividades complementares. Vou apresentar o backend, que é uma API REST em Node.js hospedada na Vercel, conectada ao Firebase como banco de dados, com três papéis de usuário: aluno, coordenador e super admin."*

---

## 1. ANÁLISE DO PROBLEMA E ESCOPO

**O que falar:**
> *"O problema central é que o SENAC não tinha uma forma digital de gerenciar a entrega, validação e controle de horas complementares. Alunos precisam acumular horas em diferentes áreas, coordenadores precisam validar certificados, e a administração precisa gerir cursos, regras e usuários. O escopo foi modelado em três perfis com permissões diferentes, fluxo completo de submissão e validação, e integração com OCR para leitura automática de certificados."*

**O que mostrar:** diagrama geral do sistema (fluxo: Aluno → submete → Coordenador valida → Admin gerencia)

---

## 2. ARQUITETURA DO SISTEMA — 1,5 pontos

**O que falar:**
> *"O backend segue uma arquitetura em camadas clara: Rotas → Middleware → Services → Firebase. Cada camada tem responsabilidade única."*

```
Cliente (PWA / Mobile)
        ↓ HTTPS + JSON
    [Express Routes]        ← define os endpoints
        ↓
    [Middleware auth.js]    ← valida JWT em toda rota protegida
        ↓
    [Services]              ← lógica de negócio
        ↓
    [Firebase Admin SDK]    ← banco de dados e armazenamento
        ↓
    [Vercel (deploy)]       ← serverless, escala automática
```

**O que falar sobre cada camada:**
> *"As rotas apenas recebem a requisição e chamam o service correto — sem lógica de negócio nelas. O middleware intercepta antes de qualquer rota protegida e rejeita requisições sem token válido. Os services contêm toda a regra de negócio. O Firebase é acessado exclusivamente pelos services — nenhuma rota acessa o banco diretamente."*

**Separação Frontend/Backend:**
> *"Frontend (PWA) e backend são deploys independentes. O PWA consome a API via HTTPS com Bearer token. Isso permite que um app mobile futuro consuma a mesma API sem mudança no backend."*

**O que mostrar:** estrutura de pastas do backend (`routes/`, `middleware/`, `services/`, `config/`)

---

## 3. INTEGRAÇÃO MOBILE / API / PWA — 0,5 pontos

**O que falar:**
> *"A comunicação entre cliente e backend é 100% via JSON sobre HTTPS. O frontend nunca acessa o Firebase diretamente — tudo passa pela API. Isso mantém as credenciais do Firebase seguras no servidor."*

**Fluxo de autenticação:**
```
1. Cliente → POST /api/auth/login { email, senha }
2. Backend valida no Firebase Auth
3. Backend retorna token JWT + refreshToken
4. Cliente inclui Bearer token em toda requisição seguinte
5. Token expira em 45 min — frontend renova automaticamente via refresh
```

**Endpoints disponíveis:** 31 endpoints cobrindo 10 grupos de recursos (auth, dashboard, cursos, usuários, submissões, certificados, regras, coordenadores-cursos, alunos-cursos, configurações)

**O que mostrar:** fazer uma requisição ao vivo via browser/Postman em `/api/dashboard/coordenador` e mostrar o JSON retornado

---

## 4. ORGANIZAÇÃO E MODULARIZAÇÃO — 1,0 ponto

**O que falar:**
> *"O projeto está organizado em módulos por responsabilidade. Nenhum arquivo faz mais de uma coisa."*

```
backend/
├── routes/
│   ├── auth.js           ← login, forgot-password
│   ├── usuarios.js       ← CRUD de usuários
│   ├── cursos.js         ← CRUD de cursos
│   ├── submissoes.js     ← submissão e validação
│   ├── certificados.js   ← upload + OCR
│   ├── regras.js         ← regras por curso
│   ├── dashboard.js      ← métricas aluno/coordenador
│   └── configuracoes.js  ← SMTP, parâmetros sistema
├── middleware/
│   └── auth.js           ← verificação JWT
├── services/
│   ├── email.js          ← envio SMTP
│   ├── ocr.js            ← extração de texto de certificados
│   └── logs.js           ← registro de operações
├── config/
│   └── firebase.js       ← inicialização singleton do Firebase Admin SDK
└── index.js              ← Express app, registro de rotas
```

> *"Cada arquivo de route faz apenas o roteamento. Cada service faz apenas sua função específica. O Firebase é configurado uma única vez como singleton e importado onde necessário."*

---

## 5. REUSO E COMPONENTIZAÇÃO — 2,0 pontos ⭐ (maior nota)

**O que falar:**
> *"Este é o ponto mais forte do backend. Três padrões de reuso foram aplicados sistematicamente:"*

**Padrão 1 — Middleware centralizado:**
> *"O `middleware/auth.js` é reutilizado em todas as rotas protegidas. Não há verificação de token duplicada em nenhum arquivo de rota. Uma linha aplica autenticação em qualquer endpoint:"*
```js
router.get('/usuarios', authMiddleware, listarUsuarios);
router.post('/usuarios', authMiddleware, criarUsuario);
// authMiddleware é o mesmo em todos os 28 endpoints protegidos
```

**Padrão 2 — Services compartilhados:**
> *"O `email.js` é chamado por múltiplos módulos: criação de usuário envia credenciais, reset de senha envia nova senha, e a configuração tem um endpoint de teste — três fluxos diferentes, um único service de email. O `ocr.js` é consumido por `certificados.js` — a lógica de extração existe em um único lugar. O `logs.js` é chamado por qualquer módulo que precisa registrar operações."*

**Padrão 3 — Configuração singleton:**
> *"O Firebase Admin SDK é inicializado uma única vez em `config/firebase.js`. Todos os services importam essa instância — nunca inicializam o Firebase por conta própria. Isso evita múltiplas conexões e centraliza as credenciais."*

**O que mostrar:** abrir `config/firebase.js` e `services/email.js`, mostrar que email é importado em pelo menos 2 rotas diferentes

---

## 6. QUALIDADE E REFATORAÇÃO DO CÓDIGO — 2,0 pontos ⭐ (maior nota)

**O que falar:**
> *"A qualidade do código se manifesta em quatro aspectos:"*

**Nomeação clara:**
> *"Funções têm nomes que descrevem exatamente o que fazem: `listarUsuarios`, `criarSubmissao`, `validarCertificado`, `enviarEmailCredenciais`. Nenhum nome genérico como `handler` ou `process`."*

**Separação de responsabilidades:**
> *"Rota não sabe como enviar email. Service de email não sabe nada sobre HTTP. Cada módulo conhece apenas sua camada — acoplamento mínimo."*

**Tratamento de erros consistente:**
> *"Toda rota tem try/catch. Erros retornam JSON com `{ mensagem: '...' }` e status HTTP correto (400 dados inválidos, 401 não autenticado, 403 sem permissão, 404 não encontrado, 500 erro interno). O cliente sempre sabe o que aconteceu."*

**Sem duplicação:**
> *"A verificação de permissão por perfil está no middleware, não repetida em cada rota. A lógica de OCR está em um único service, não duplicada em upload e validação."*

**O que mostrar:** abrir qualquer arquivo de route e mostrar o padrão try/catch + response consistente

---

## 7. GITHUB E VERSIONAMENTO — 0,5 pontos

**O que falar:**
> *"O projeto usou Git com commits organizados ao longo do desenvolvimento. O repositório tem histórico claro das features adicionadas — autenticação, CRUD de recursos, integração OCR, configurações de email."*

**O que mostrar:** `git log --oneline` no terminal ou histórico no GitHub

---

## 8. BOAS PRÁTICAS E PADRÕES DE PROJETO — 0,5 pontos

**O que falar:**
> *"Três padrões aplicados explicitamente:"*

- **Middleware pattern** — interceptação da requisição antes do handler (Express nativo)
- **Singleton** — instância única do Firebase compartilhada por toda a aplicação
- **Service layer** — lógica de negócio isolada das rotas (separação Controller/Service)
- **Repository pattern implícito** — services são a única camada que acessa o Firebase, funcionando como repositórios

**O que mostrar:** diagrama da camada architecture (seção 2 acima) e apontar onde cada padrão aparece

---

## 9. DOCUMENTAÇÃO E APRESENTAÇÃO — 0,5 pontos

**O que mostrar:**
- Este roteiro
- `docs/API.md` — 31 endpoints documentados com body/response
- `docs/ARCHITECTURE.md` — stack, estrutura de pastas, fluxos

**O que falar:**
> *"A documentação foi mantida junto ao código no repositório — API completa com exemplos de body e response, arquitetura explicada em diagrama, guia de desenvolvimento com credenciais de teste e padrões de código."*

---

## RESPOSTAS PARA PERGUNTAS PROVÁVEIS

**"Por que Firebase e não PostgreSQL?"**
> *"Firebase oferece autenticação pronta com JWT, sem precisar implementar hash de senha, refresh de token ou estrutura de sessions. Para um projeto acadêmico com prazo, elimina semanas de setup de auth. A troca é que queries relacionais são mais verbosas."*

**"Como funciona o OCR?"**
> *"O aluno faz upload do certificado (PDF/JPG/PNG) via multipart/form-data. O `certificados.js` recebe o arquivo e chama `services/ocr.js`, que extrai: nome, carga horária, data, instituição e tipo. O backend retorna esses dados com um score de confiança entre 0 e 1. O frontend exibe os dados extraídos — o aluno confirma ou corrige manualmente antes de salvar."*

**"Como a segurança é tratada?"**
> *"Nenhuma rota de dados é acessível sem token. O middleware verifica e decodifica o JWT em cada requisição. As credenciais do Firebase ficam apenas no servidor — o cliente nunca tem acesso direto ao banco. Senhas não são armazenadas — o Firebase Auth gerencia hashes."*

**"E se o token expirar?"**
> *"O frontend detecta 401 e usa o refreshToken para obter um novo JWT automaticamente, sem fazer o usuário logar de novo. Se o refresh também falhar, desloga e redireciona para login."*

**"Quantos endpoints tem a API?"**
> *"31 endpoints distribuídos em 10 grupos de recursos. Todos seguem convenção REST: GET para leitura, POST para criação, PATCH para atualização parcial, DELETE para remoção."*

---

## RESUMO DOS PONTOS

| Critério | Pontos | Status |
|----------|--------|--------|
| Análise do problema e escopo | 0,0 (base) | ✅ |
| Arquitetura do sistema | 1,5 | ✅ camadas separadas, deploy independente |
| Integração Mobile/API/PWA | 0,5 | ✅ JSON/HTTPS, auth JWT, 31 endpoints |
| Organização e modularização | 1,0 | ✅ routes/middleware/services/config |
| Reuso e componentização | 2,0 | ✅ auth middleware, services compartilhados, singleton Firebase |
| Qualidade e refatoração | 2,0 | ✅ nomeação, separação, try/catch, sem duplicação |
| GitHub e versionamento | 0,5 | ✅ histórico de commits |
| Boas práticas e padrões | 0,5 | ✅ Middleware, Singleton, Service Layer |
| Documentação e apresentação | 0,5 | ✅ API.md, ARCHITECTURE.md, este roteiro |
| **TOTAL** | **8,5** | |

> *Nota: Interface/usabilidade (0,5pt) pertence ao frontend — será coberto no roteiro do PWA.*
