// Tipos compartilhados entre Coordenador e seus componentes

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
