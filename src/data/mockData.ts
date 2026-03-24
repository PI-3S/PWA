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
  {
    id: '4',
    studentName: 'Lucas Pereira Alves',
    studentId: '2022012',
    course: 'Sistemas de Informação',
    category: 'estagio',
    activityTitle: 'Estágio em Desenvolvimento Web',
    hoursRequested: 40,
    hoursInDocument: 40,
    submissionDate: '2026-02-20',
    status: 'pendente',
    documentUrl: '',
    description: 'Estágio na empresa TechSolutions, área de front-end.',
    studentAccumulatedHours: { cursos: 10, palestras: 5, monitoria: 0, estagio: 30 },
    categoryLimits,
  },
  {
    id: '5',
    studentName: 'Beatriz Fernandes',
    studentId: '2021078',
    course: 'Engenharia de Software',
    category: 'cursos',
    activityTitle: 'Curso de UX Design',
    hoursRequested: 15,
    hoursInDocument: 15,
    submissionDate: '2026-03-22',
    status: 'pendente',
    documentUrl: '',
    description: 'Certificação em UX Design pela Interaction Design Foundation.',
    studentAccumulatedHours: { cursos: 10, palestras: 20, monitoria: 0, estagio: 0 },
    categoryLimits,
  },
  {
    id: '6',
    studentName: 'Ana Clara Ribeiro',
    studentId: '2021001',
    course: 'Engenharia de Software',
    category: 'palestras',
    activityTitle: 'Semana Acadêmica 2025',
    hoursRequested: 8,
    hoursInDocument: 8,
    submissionDate: '2026-03-01',
    status: 'deferido',
    documentUrl: '',
    description: 'Participação na Semana Acadêmica de Engenharia de Software.',
    studentAccumulatedHours: { cursos: 30, palestras: 10, monitoria: 0, estagio: 0 },
    categoryLimits,
  },
  {
    id: '7',
    studentName: 'Carlos Eduardo Santos',
    studentId: '2021045',
    course: 'Ciência da Computação',
    category: 'cursos',
    activityTitle: 'Curso de Python para Data Science',
    hoursRequested: 25,
    hoursInDocument: 20,
    submissionDate: '2026-02-15',
    status: 'indeferido',
    documentUrl: '',
    description: 'Curso online com carga horária divergente do certificado.',
    studentAccumulatedHours: { cursos: 15, palestras: 22, monitoria: 0, estagio: 20 },
    categoryLimits,
    justification: 'Carga horária declarada (25h) difere do certificado (20h). Documento ilegível.',
  },
  {
    id: '8',
    studentName: 'Fernanda Oliveira',
    studentId: '2020055',
    course: 'Sistemas de Informação',
    category: 'cursos',
    activityTitle: 'Curso de Cloud Computing',
    hoursRequested: 12,
    hoursInDocument: 12,
    submissionDate: '2026-03-20',
    status: 'ajuste',
    documentUrl: '',
    description: 'Certificação AWS Cloud Practitioner.',
    studentAccumulatedHours: { cursos: 5, palestras: 0, monitoria: 0, estagio: 40 },
    categoryLimits,
    justification: 'Por favor, envie o certificado com data de conclusão visível.',
  },
];
