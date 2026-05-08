// Tipos para o Aluno e seus componentes

export interface AlunoCurso {
  id: string;
  curso_id: string;
  curso_nome: string;
  carga_horaria_minima?: number;
}

export interface DashboardAluno {
  total_submissoes: number;
  pendentes: number;
  aprovadas: number;
  reprovadas: number;
  total_horas_aprovadas: number;
  carga_horaria_minima: number;
  progresso_percentual: number;
  horas_por_area: { area: string; horas: number; limite: number }[];
}

export interface Regra {
  id: string;
  area: string;
  nome?: string;
  limite_horas?: number;
  horas_maximas?: number;
  curso_id: string;
  descricao?: string;
  requisitos_obrigatorios?: string;
  tipo_documento?: string;
  observacoes?: string;
  ativo?: boolean;
}

export interface Submissao {
  id: string;
  data_envio: string;
  tipo?: string;
  descricao?: string;
  horas_solicitadas?: number;
  status: string;
  observacao?: string;
  regra_id?: string;
}
