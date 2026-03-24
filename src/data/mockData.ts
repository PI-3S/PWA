export type ActivityCategory = 'cursos' | 'palestras' | 'monitoria' | 'estagio';
export type SubmissionStatus = 'pendente' | 'deferido' | 'indeferido' | 'ajuste';

export interface Submission {
  id: string;
  studentName: string;
  studentId: string;
  course: string;
  category: ActivityCategory;
  activityTitle: string;
  hoursRequested: number;
  hoursInDocument: number;
  submissionDate: string;
  status: SubmissionStatus;
  documentUrl: string;
  description: string;
  studentAccumulatedHours: Record<ActivityCategory, number>;
  categoryLimits: Record<ActivityCategory, number>;
  justification?: string;
}

export const categoryLabels: Record<ActivityCategory, string> = {
  cursos: 'Cursos',
  palestras: 'Palestras',
  monitoria: 'Monitoria',
  estagio: 'Estágio',
};

export const statusLabels: Record<SubmissionStatus, string> = {
  pendente: 'Pendente',
  deferido: 'Deferido',
  indeferido: 'Indeferido',
  ajuste: 'Ajuste Solicitado',
};

const categoryLimits: Record<ActivityCategory, number> = {
  cursos: 40,
  palestras: 30,
  monitoria: 50,
  estagio: 60,
};

export const mockSubmissions: Submission[] = [
  {
    id: '1',
    studentName: 'Ana Clara Ribeiro',
    studentId: '2021001',
    course: 'Engenharia de Software',
    category: 'cursos',
    activityTitle: 'Curso de React Avançado',
    hoursRequested: 20,
    hoursInDocument: 18,
    submissionDate: '2026-03-18',
    status: 'pendente',
    documentUrl: '',
    description: 'Curso online de React com certificação pela plataforma Udemy.',
    studentAccumulatedHours: { cursos: 30, palestras: 10, monitoria: 0, estagio: 0 },
    categoryLimits,
  },
  {
    id: '2',
    studentName: 'Carlos Eduardo Santos',
    studentId: '2021045',
    course: 'Ciência da Computação',
    category: 'palestras',
    activityTitle: 'Palestra: IA Generativa na Educação',
    hoursRequested: 4,
    hoursInDocument: 4,
    submissionDate: '2026-03-10',
    status: 'pendente',
    documentUrl: '',
    description: 'Palestra ministrada no evento TechEdu 2026.',
    studentAccumulatedHours: { cursos: 15, palestras: 22, monitoria: 0, estagio: 20 },
    categoryLimits,
  },
  {
    id: '3',
    studentName: 'Mariana Costa Lima',
    studentId: '2020088',
    course: 'Engenharia de Software',
    category: 'monitoria',
    activityTitle: 'Monitoria de Estrutura de Dados',
    hoursRequested: 30,
    hoursInDocument: 30,
    submissionDate: '2026-03-05',
    status: 'pendente',
    documentUrl: '',
    description: 'Monitoria realizada no semestre 2025.2 sob orientação do Prof. João.',
    studentAccumulatedHours: { cursos: 20, palestras: 15, monitoria: 25, estagio: 0 },
    categoryLimits,
  },
];
