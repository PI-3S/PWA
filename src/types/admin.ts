// Tipos compartilhados entre Admin e seus componentes

export interface Curso {
  id: string;
  nome: string;
  carga_horaria_minima: number;
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  perfil: string;
  curso_id?: string;
  matricula?: string;
  curso_nome?: string;
}

export interface Submissao {
  id: string;
  aluno_id: string;
  status: string;
  data_envio: string;
  data_validacao?: string;
  descricao?: string;
  horas_solicitadas?: number;
  carga_horaria_solicitada?: number;
  aluno_nome?: string;
  curso_nome?: string;
  area?: string;
  tipo?: string;
}

export interface Regra {
  id: string;
  area: string;
  limite_horas: number;
  exige_comprovante: boolean;
  curso_id: string;
  curso_nome?: string;
}

export interface CoordCurso {
  id: string;
  usuario_id: string;
  curso_id: string;
  coordenador_nome?: string;
  coordenador_email?: string;
  curso_nome?: string;
}

export interface DashboardMetrics {
  total_submissoes: number;
  pendentes: number;
  aprovadas: number;
  reprovadas: number;
  por_area: { area: string; total: number; aprovadas: number; pendentes: number; reprovadas: number }[];
  por_curso: { curso: string; total: number; aprovadas: number; pendentes: number; reprovadas: number }[];
}
