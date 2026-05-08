// Tipos compartilhados entre Coordenador e seus componentes

export interface OcrData {
  nome: string | null;
  carga_horaria: string | null;
  data: string | null;
  instituicao: string | null;
  tipo: string | null;
  confianca: number;
}

export interface DashboardMetrics {
  total_submissoes: number;
  pendentes: number;
  aprovadas: number;
  reprovadas: number;
  por_curso: { curso: string; total: number; aprovadas: number; pendentes: number; reprovadas: number }[];
  total_alunos?: number;
}

export interface Submissao {
  id: string;
  aluno_id: string;
  aluno_nome: string;
  curso_nome: string;
  area: string;
  horas_solicitadas: number;
  status: 'pendente' | 'aprovado' | 'reprovado' | 'correcao';
  data_envio: string;
  data_validacao?: string;
  descricao?: string;
  observacao?: string;
}

export interface AlunoInfo {
  id: string;
  nome: string;
  email: string;
  matricula: string;
  curso_nome: string;
  horas_aprovadas: number;
  carga_minima: number;
}

// Tipos para gerenciamento de regras de atividades complementares
export type CategoriaAtividade = 'ensino' | 'pesquisa' | 'extensao';

export interface RegraAtividade {
  id?: string;
  nome: string;
  categoria: CategoriaAtividade;
  descricao: string;
  horas_maximas: number;
  requisitos_obrigatorios: string;
  tipo_documento: 'pdf' | 'imagem' | 'pdf_imagem' | 'outro';
  observacoes?: string;
  ativo: boolean;
  curso_id: string;
  curso_nome?: string;
  data_criacao?: string;
}

export const CATEGORIAS_ATIVIDADE = [
  { value: 'ensino', label: 'Ensino' },
  { value: 'pesquisa', label: 'Pesquisa' },
  { value: 'extensao', label: 'Extensão' },
] as const;

export const TIPOS_DOCUMENTO = [
  { value: 'pdf', label: 'PDF' },
  { value: 'imagem', label: 'Imagem (JPG/PNG)' },
  { value: 'pdf_imagem', label: 'PDF ou Imagem' },
  { value: 'outro', label: 'Outro' },
] as const;
