/**
 * TIPOS GLOBAIS E CONFIGURAÇÕES DO SISTEMA (PI)
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

// Configurações da API para centralizar a URL da Vercel
export const API_CONFIG = {
  BASE_URL: 'https://back-end-banco-five.vercel.app',
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
 * Converte os valores técnicos para o que o usuário lê na tela
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