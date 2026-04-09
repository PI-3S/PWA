/**
 * TIPOS GLOBAIS E CONFIGURAÇÕES DO SISTEMA (PI - Projeto Integrador)
 */

// Tipos de Perfil e Status estritos conforme o manual de rotas
export type UserPerfil = 'super_admin' | 'coordenador' | 'aluno';
export type SubmissionStatus = 'pendente' | 'aprovado' | 'reprovado';

// Interface do Usuário (O que o AuthContext usa)
export interface User {
  uid: string;
  nome: string;
  email: string;
  perfil: UserPerfil;
  curso_id: string | null;
  matricula?: string | null;
}

// Interface da Submissão (Mapeada para o seu banco Firestore/Back-end)
export interface Submission {
  id: string;
  aluno_id: string;
  coordenador_id: string | null;
  regra_id: string;
  status: SubmissionStatus;
  data_envio: string;
  data_validacao: string | null;
  descricao?: string | null;
  carga_horaria_solicitada?: number;
  tipo?: string; 
  documento_url?: string;
}

/**
 * CONFIGURAÇÕES DA API
 * Centraliza os endereços para facilitar a troca entre Localhost e Produção (Vercel)
 */
export const API_CONFIG = {
  // Tenta ler do .env, se não existir, usa a URL da Vercel como padrão
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://back-end-banco-five.vercel.app',
  
  // Chave de API do Firebase (Web API Key) para renovação de token (Refresh Token)
  FIREBASE_KEY: import.meta.env.VITE_FIREBASE_KEY || '', 

  ENDPOINTS: {
    LOGIN: '/api/auth/login',
    SUBMISSOES: '/api/submissoes',
    USUARIOS: '/api/usuarios',
    CURSOS: '/api/cursos',
    CERTIFICADOS: '/api/certificados',
    DASHBOARD_ALUNO: '/api/dashboard/aluno',
    DASHBOARD_COORD: '/api/dashboard/coordenador',
  }
};

/**
 * LABELS PARA INTERFACE
 * Converte os valores técnicos para o que o usuário lê na tela (PT-BR)
 */
export const statusLabels: Record<SubmissionStatus, string> = {
  pendente: 'Pendente',
  aprovado: 'Aprovado',
  reprovado: 'Reprovado',
};

export const perfilLabels: Record<UserPerfil, string> = {
  super_admin: 'Administrador',
  coordenador: 'Coordenador',
  aluno: 'Aluno',
};