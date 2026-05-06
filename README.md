# SGC - Sistema de Gestão de Atividades Complementares

Sistema web para gestão de atividades complementares do SENAC, permitindo que alunos submetam comprovantes, coordenadores validem as atividades e administradores gerenciem cursos, usuários e configurações do sistema.

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/SEU-REPO/sgc-senac)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-orange)](https://github.com/SEU-REPO/sgc-senac/releases)

## Funcionalidades

### Aluno
- Visualização de progresso de carga horária por área de atividade
- Submissão de novas atividades com upload de certificados
- Acompanhamento do status das submissões (pendente, aprovado, reprovado, correção)
- Histórico completo de atividades validadas
- Visualização de cursos vinculados

### Coordenador
- Dashboard com métricas de submissões por área e curso
- Validação de atividades submetidas por alunos
- Cadastro de novos alunos
- Visualização de certificados enviados
- Filtros por curso e status de validação

### Super Admin
- Gestão completa de cursos (CRUD)
- Gestão de usuários (alunos, coordenadores, admins)
- Gestão de regras de atividades por curso
- Configuração de sistema (nome, cores, logo)
- Configuração de e-mail para notificações
- Vinculação de coordenadores a cursos
- Dashboard com métricas globais

## Stack Tecnológica

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 5
- **Routing**: React Router DOM 6
- **State Management**: React Query (TanStack Query)
- **UI Components**: Radix UI + shadcn/ui
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **PWA**: Vite PWA Plugin

### Backend
- **Runtime**: Node.js
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Storage**: Firebase Storage
- **API**: REST com Express.js

## Pré-requisitos

- Node.js 18+ ou superior
- npm, yarn ou bun
- Conta Firebase (para backend)
- Git

## Instalação

1. Clone o repositório:
```bash
git clone https://github.com/SEU-REPO/sgc-senac.git
cd sgc-senac
```

2. Instale as dependências:
```bash
npm install
# ou
bun install
```

3. Configure as variáveis de ambiente (veja seção abaixo)

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
# ou
bun run dev
```

5. Acesse `http://localhost:8080`

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Backend API
VITE_API_BASE_URL=https://your-backend-api.vercel.app
```

## Comandos Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento |
| `npm run build` | Build para produção |
| `npm run build:dev` | Build em modo desenvolvimento |
| `npm run preview` | Preview do build de produção |
| `npm run lint` | Executa ESLint |
| `npm run test` | Executa testes |
| `npm run test:watch` | Executa testes em modo watch |

## Estrutura de Pastas

```
sgc-senac/
├── docs/                   # Documentação técnica
├── public/                 # Arquivos estáticos
│   └── icons/             # Ícones PWA
├── src/
│   ├── components/        # Componentes React
│   │   ├── ui/           # Componentes UI (shadcn/ui)
│   │   └── layout/       # Componentes de layout
│   ├── contexts/         # Contextos React
│   ├── data/             # Dados estáticos e configurações
│   ├── hooks/            # Custom hooks
│   ├── lib/              # Utilitários
│   ├── pages/            # Páginas principais
│   ├── services/         # Serviços de API
│   ├── types/            # Tipos TypeScript
│   └── main.tsx          # Entry point
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Deploy

### Frontend (Vercel)

1. Conecte o repositório ao Vercel
2. Configure as variáveis de ambiente no painel do Vercel
3. Deploy automático ao fazer push na branch `main`

### Backend (Vercel)

O backend é uma API Node.js hospedada no Vercel. Configure as variáveis de ambiente do Firebase no painel do Vercel.

## Credenciais de Teste

### Super Admin
- Email: `admin@admin.com.br`
- Senha: `admin123`

### Coordenador
- Email: `coordenador@gmail.com`
- Senha: `cord123`

### Aluno
- Email: `joao@email.com`
- Senha: `joao123`

> **Nota**: Estas credenciais são apenas para ambiente de desenvolvimento. Em produção, utilize credenciais reais fornecidas pela instituição.

## Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## Suporte

Para suporte técnico ou dúvidas, entre em contato através do e-mail: suporte@senac.com.br

---

Desenvolvido para o SENAC - Sistema Nacional de Aprendizagem Comercial
